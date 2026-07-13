/**
 * Gera o catálogo de produtos (site/src/data/catalogo/*.json) a partir da planilha da equipe.
 *
 * Uso:  node scripts/build-catalogo.js "C:\caminho\para\Produtos.xlsx"
 * Requer (uma vez):  npm install --save-dev xlsx
 *
 * Regras de consolidação documentadas em src/data/catalogo/README.md.
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const XLSX_PATH = process.argv[2] || 'C:\\Users\\pedro\\OneDrive\\downloads\\Produtos (1).xlsx';
const OUT_DIR = path.join(__dirname, '..', 'src', 'data', 'catalogo');

const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });

// ---------- helpers ----------
const colIdx = (letter) => XLSX.utils.decode_col(letter);

function cellAt(ws, r, colLetter) {
  return ws[XLSX.utils.encode_cell({ r, c: colIdx(colLetter) })];
}

function rawText(cell) {
  if (!cell) return null;
  let v = cell.w !== undefined ? cell.w : cell.v;
  if (v === undefined || v === null) return null;
  if (v instanceof Date) v = v.toISOString().slice(0, 10);
  const s = String(v).replace(/\r\n/g, '\n').replace(/ /g, ' ').replace(/ /g, ' ').trim();
  return s.length ? s : null;
}

function isUrl(s) { return typeof s === 'string' && /^https?:\/\/\S+$/i.test(s.trim()); }

// Retorna { url, hyperlink, divergente } de uma célula que deveria conter um link.
function cellLink(cell) {
  const texto = rawText(cell);
  const target = cell && cell.l && cell.l.Target ? cell.l.Target.trim().replace(/\)$/, '') : null;
  if (!texto && !target) return null;
  if (texto && isUrl(texto)) {
    const divergente = target && target !== texto ? target : null;
    return { url: texto, hyperlinkDivergente: divergente };
  }
  if (target) return { url: target, textoDaCelula: texto || null, hyperlinkDivergente: null };
  return null; // texto não-URL e sem hyperlink
}

// "R$ 1,094.00" -> 1094 | "R$ 97,00" -> 97 | "137.90" -> 137.9 | outros -> null
function parsePreco(s) {
  if (s === null || s === undefined) return { valor: null, texto: null };
  const texto = String(s).trim();
  let t = texto.replace(/R\$\s*/gi, '').trim();
  if (!/^[\d.,\s]+$/.test(t)) return { valor: null, texto };
  t = t.replace(/\s+/g, '');
  const lastSep = Math.max(t.lastIndexOf(','), t.lastIndexOf('.'));
  if (lastSep >= 0) {
    const decimals = t.length - lastSep - 1;
    if (decimals >= 1 && decimals <= 2) {
      const intPart = t.slice(0, lastSep).replace(/[.,]/g, '');
      t = intPart + '.' + t.slice(lastSep + 1);
    } else {
      t = t.replace(/[.,]/g, '');
    }
  }
  const n = Number(t);
  if (!Number.isFinite(n)) return { valor: null, texto };
  return { valor: n === 0 ? null : n, texto: null }; // R$ 0,00 na planilha = "não definido"
}

function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function sheetRows(name) {
  const ws = wb.Sheets[name];
  if (!ws || !ws['!ref']) return { ws: null, rows: [] };
  const range = XLSX.utils.decode_range(ws['!ref']);
  const rows = [];
  for (let r = range.s.r; r <= range.e.r; r++) rows.push(r);
  return { ws, rows, range };
}

// ---------- 1. abas de produtos ----------
// mapeamento de colunas por aba
const PRODUCT_SHEETS = [
  // abas atuais (prioridade alta)
  { sheet: 'assinaturas', prio: 10, cols: { nome: 'A', naEduzz: 'B', naAlpa: 'C', status: 'D', tipo: 'E', area: 'F', ferramenta: 'G', formato: 'H', urlSite: 'I', observacao: 'J', preco: 'K', precoPromocional: 'L', precoBlack: 'M', pastaGdrive: 'N', chkNormal: 'O', chkBlack: 'P', idEduzz: 'Q', orderbump: 'R', upsell: 'S', atualizacao: 'T', sobre: 'U', disciplinas: 'V', cronograma: 'W' } },
  { sheet: 'combo-regular', prio: 10, cols: { nome: 'A', naEduzz: 'B', naAlpa: 'C', status: 'D', tipo: 'E', area: 'F', ferramenta: 'G', formato: 'H', urlSite: 'I', observacao: 'J', preco: 'K', precoPromocional: 'L', precoBlack: 'M', pastaGdrive: 'N', chkNormal: 'O', chkBlack: 'P', idEduzz: 'Q', orderbump: 'R', upsell: 'S', atualizacao: 'T', sobre: 'U', disciplinas: 'V', cronograma: 'W' } },
  { sheet: 'outros-produtos', prio: 10, cols: { nome: 'A', naEduzz: 'B', naAlpa: 'C', status: 'D', tipo: 'E', area: 'F', ferramenta: 'G', formato: 'H', urlSite: 'I', observacao: 'J', preco: 'K', precoPromocional: 'L', precoBlack: 'M', pastaGdrive: 'N', chkNormal: 'O', chkBlack: 'P', idEduzz: 'Q', orderbump: 'R', upsell: 'S', atualizacao: 'T', sobre: 'U', disciplinas: 'V', cronograma: 'W' } },
  { sheet: 'leg-tributaria', prio: 10, cols: { nome: 'A', sefaz: 'B', naEduzz: 'C', naAlpa: 'D', status: 'E', tipo: 'F', area: 'G', ferramenta: 'H', formato: 'I', urlSite: 'J', observacao: 'K', preco: 'L', precoPromocional: 'M', precoBlack: 'N', pastaGdrive: 'O', chkNormal: 'P', chkCupom30: 'Q', chkBlack: 'R', idEduzz: 'S', orderbump: 'T', upsell: 'U', atualizacao: 'V', sobre: 'W', disciplinas: 'X', cronograma: 'Y' } },
  // abas antigas (usadas p/ completar lacunas: orderbump, layout, upgrades)
  { sheet: 'Combos Regulares', prio: 5, cols: { idEduzz: 'A', nome: 'B', naEduzz: 'C', naAlpa: 'D', status: 'E', tipo: 'F', area: 'G', ferramenta: 'H', formato: 'I', urlSite: 'J', observacao: 'K', preco: 'L', precoPromocional: 'M', pastaGdrive: 'N', chkNormal: 'O', layoutCheckout: 'P', orderbumpProdutos: 'Q', orderbumpPreco: 'R', precoTotalComOrderbump: 'S', chkBlack: 'U', orderbump: 'V', upsell: 'W', atualizacao: 'X', sobre: 'Y', disciplinas: 'Z', cronograma: 'AA' } },
  // untrustedLinks: as linhas dessa aba estão desalinhadas (checkout de um produto na
  // linha do vizinho). Seus links nunca disputam os slots normal/black; viram "outros".
  { sheet: 'Legislação Tributária', prio: 5, untrustedLinks: true, cols: { idEduzz: 'A', nome: 'B', sefaz: 'C', ferramenta: 'D', urlSite: 'E', preco: 'F', chkNormal: 'G', precoCupom20: 'H', chkCupom20: 'I', chkUpgrade1: 'J', chkUpgrade2: 'K', chkBlack: 'L', orderbump: 'N', upsell: 'O', atualizacao: 'P', sobre: 'Q', disciplinas: 'R', cronograma: 'S' } },
  { sheet: 'Produtos Isolados (não há desco', prio: 5, cols: { idEduzz: 'A', nome: 'B', ferramenta: 'C', urlSite: 'D', preco: 'E', chkNormal: 'F', orderbump: 'G', upsell: 'H', atualizacao: 'I', sobre: 'J', disciplinas: 'K', cronograma: 'L' } },
  { sheet: 'Assinatura', prio: 5, cols: { idEduzz: 'A', nome: 'B', naEduzz: 'C', naAlpa: 'D', status: 'E', tipo: 'F', area: 'G', ferramenta: 'H', formato: 'I', urlSite: 'J', observacao: 'K', preco: 'M', pastaGdrive: 'N', chkNormal: 'O', orderbump: 'P', upsell: 'Q', atualizacao: 'R', sobre: 'S', disciplinas: 'T', cronograma: 'U' } },
  { sheet: 'outros-produtos (15.12.25)', prio: 5, cols: { idEduzz: 'A', nome: 'B', naEduzz: 'C', naAlpa: 'D', status: 'E', tipo: 'F', area: 'G', ferramenta: 'H', formato: 'I', urlSite: 'J', observacao: 'K', preco: 'L', precoPromocional: 'M', precoBlack: 'N', pastaGdrive: 'O', chkNormal: 'P', chkBlack: 'Q', orderbump: 'R', upsell: 'S', atualizacao: 'T', sobre: 'U', disciplinas: 'V', cronograma: 'W' } },
  { sheet: 'Página6_conflict616946819', prio: 3, cols: { idEduzz: 'A', nome: 'B', area: 'C', ferramenta: 'D', formato: 'E', urlSite: 'F', preco: 'G', precoBlack: 'H', chkNormal: 'I', linkEdicaoEduzz: 'K' } },
];

const LINK_FIELDS = new Set(['urlSite', 'pastaGdrive', 'chkNormal', 'chkBlack', 'chkCupom30', 'chkCupom20', 'chkUpgrade1', 'chkUpgrade2', 'linkEdicaoEduzz']);
const PRICE_FIELDS = new Set(['preco', 'precoPromocional', 'precoBlack', 'precoCupom20', 'orderbumpPreco', 'precoTotalComOrderbump']);

const rawRows = []; // { sheet, prio, rowNum, data: {campo: valor} }
for (const cfg of PRODUCT_SHEETS) {
  const { ws, rows } = sheetRows(cfg.sheet);
  if (!ws) { console.error('ABA NÃO ENCONTRADA:', cfg.sheet); continue; }
  for (const r of rows) {
    if (r === 0) continue; // header
    const data = {};
    for (const [campo, letter] of Object.entries(cfg.cols)) {
      const cell = cellAt(ws, r, letter);
      if (!cell) continue;
      if (LINK_FIELDS.has(campo)) {
        const link = cellLink(cell);
        if (link) data[campo] = link;
      } else if (PRICE_FIELDS.has(campo)) {
        const p = parsePreco(rawText(cell));
        if (p.valor !== null || p.texto) data[campo] = p;
      } else {
        const t = rawText(cell);
        if (t !== null) data[campo] = t;
      }
    }
    // linha precisa de nome de produto real
    if (!data.nome || data.nome.length < 4) continue;
    if (/^(TRUE|FALSE)$/i.test(data.nome)) continue;
    rawRows.push({ sheet: cfg.sheet, prio: cfg.prio, rowNum: r + 1, untrustedLinks: !!cfg.untrustedLinks, data });
  }
}

// ---------- 2. merge por idEduzz / nome ----------
function nomeLimpo(nome) {
  return nome.replace(/^\[blackfriday\]\s*/i, '').replace(/\s+/g, ' ').trim();
}
function chaveDe(row) {
  const id = row.data.idEduzz && String(row.data.idEduzz).match(/^\d{6,}$/) ? String(row.data.idEduzz) : null;
  if (id) return 'id:' + id;
  return 'nome:' + slugify(nomeLimpo(row.data.nome));
}

// nomes (slug) -> chave id:, para juntar linhas sem ID ao grupo certo
const nomeParaId = new Map();
for (const row of rawRows) {
  const k = chaveDe(row);
  if (k.startsWith('id:')) {
    const slug = slugify(nomeLimpo(row.data.nome).replace(/\s*\[VL\]\s*/i, ' ').trim());
    if (!nomeParaId.has(slug)) nomeParaId.set(slug, k);
  }
}
const grupos = new Map();
for (const row of rawRows) {
  let k = chaveDe(row);
  if (k.startsWith('nome:')) {
    const slug = k.slice(5);
    if (nomeParaId.has(slug)) k = nomeParaId.get(slug);
  }
  if (!grupos.has(k)) grupos.set(k, []);
  grupos.get(k).push(row);
}

function score(row) {
  let s = row.prio;
  for (const f of ['status', 'tipo', 'area', 'ferramenta', 'formato', 'urlSite', 'sobre']) if (row.data[f]) s += 2;
  if (!/\[VL\]/i.test(row.data.nome)) s += 4; // linhas [VL] são oferta paralela, não canônicas
  return s;
}

const avisos = []; // { produto, tipo, detalhe }
const produtos = [];

function categorize(nome, ferramenta, tipo) {
  const n = nome.toLowerCase();
  if (/^oferta personalizada/.test(n)) return 'oferta-personalizada';
  if (/^treinamento/.test(n)) return 'treinamento';
  if (ferramenta === 'Assinatura' || /^assinatura/.test(n)) return 'assinatura';
  if (/^(combo|super combo|pacote)/.test(n) || tipo === 'Combo') return 'combo';
  if (tipo === 'Isolada' || /isolad[ao]/.test(n)) return 'isolado';
  if (['Resumo', 'Flashcards', 'Questões Inéditas', 'Vademecum'].includes(ferramenta)) return 'isolado';
  return 'outro';
}

for (const [chave, rows] of grupos) {
  rows.sort((a, b) => score(b) - score(a));
  const canon = rows[0];
  const idEduzz = chave.startsWith('id:') ? chave.slice(3) : (canon.data.idEduzz || null);
  const nome = nomeLimpo(canon.data.nome);

  const p = {
    id: null, // slug depois (dedup)
    idEduzz,
    nome,
    nomesAlternativos: [],
    categoria: null,
    campanha: null,
    status: null, tipo: null, area: null, ferramenta: null, formato: null, sefaz: null,
    urlSite: null,
    observacao: null,
    precos: { cheio: null, promocional: null, black: null },
    precosTexto: null,
    checkouts: { normal: null, black: null, outros: [] },
    orderbump: null, orderbumpProdutos: null, orderbumpPreco: null, precoTotalComOrderbump: null,
    layoutCheckout: null,
    upsell: null,
    pastaGdrive: null,
    linkEdicaoEduzz: null,
    atualizacao: null,
    sobre: null, disciplinas: null, cronograma: null,
    fontes: [], avisos: [],
  };

  const cand = { precos: { cheio: [], promocional: [], black: [] }, chk: { normal: [], black: [] } };
  const addOutro = (rotulo, url, preco) => {
    if (!url) return;
    if (p.checkouts.normal === url || p.checkouts.black === url) return;
    if (p.checkouts.outros.some(o => o.url === url && o.rotulo === rotulo)) return;
    p.checkouts.outros.push({ rotulo, preco: preco ?? null, url });
  };
  const aviso = (tipo, detalhe) => { p.avisos.push(`${tipo}: ${detalhe}`); avisos.push({ produto: nome, idEduzz, tipo, detalhe }); };

  for (const row of rows) {
    const d = row.data;
    const isVL = /\[VL\]/i.test(d.nome) && !/\[VL\]/i.test(canon.data.nome);
    const fonte = `${row.sheet}:R${row.rowNum}`;
    p.fontes.push(fonte);

    const nomeRowLimpo = nomeLimpo(d.nome);
    if (nomeRowLimpo !== p.nome && !p.nomesAlternativos.includes(nomeRowLimpo)) p.nomesAlternativos.push(nomeRowLimpo);

    // campos descritivos: primeiro não-nulo na ordem de score
    for (const f of ['status', 'tipo', 'area', 'ferramenta', 'formato', 'sefaz', 'observacao', 'orderbump', 'orderbumpProdutos', 'layoutCheckout', 'upsell', 'atualizacao']) {
      if (d[f] && !p[f]) p[f] = d[f];
    }
    for (const f of ['sobre', 'disciplinas', 'cronograma']) {
      if (d[f] && (!p[f] || d[f].length > p[f].length)) p[f] = d[f];
    }
    for (const f of ['urlSite', 'pastaGdrive', 'linkEdicaoEduzz']) {
      if (d[f] && !p[f]) {
        p[f] = d[f].url;
        if (d[f].hyperlinkDivergente) aviso('link-divergente', `${f} na ${fonte}: texto ${d[f].url} x hyperlink ${d[f].hyperlinkDivergente}`);
      }
    }

    // preços: coleta candidatos (resolvidos por votação após o loop)
    const addPrecoCand = (slot, val) => {
      if (!val) return;
      if (val.valor === null) {
        if (val.texto && !(p.precosTexto || {})[slot]) { p.precosTexto = p.precosTexto || {}; p.precosTexto[slot] = val.texto; }
        return;
      }
      if (isVL) return; // preços de linha [VL] são de oferta paralela
      cand.precos[slot].push({ valor: val.valor, fonte });
    };
    addPrecoCand('cheio', d.preco);
    addPrecoCand('promocional', d.precoPromocional);
    addPrecoCand('black', d.precoBlack);
    if (d.orderbumpPreco && d.orderbumpPreco.valor !== null && p.orderbumpPreco === null) p.orderbumpPreco = d.orderbumpPreco.valor;
    if (d.precoTotalComOrderbump && d.precoTotalComOrderbump.valor !== null && p.precoTotalComOrderbump === null) p.precoTotalComOrderbump = d.precoTotalComOrderbump.valor;

    // checkouts: normal/black por votação; demais viram "outros"
    const addChkCand = (slot, link, rotuloOutro) => {
      if (!link) return;
      if (link.hyperlinkDivergente) aviso('link-divergente', `checkout ${slot} na ${fonte}: texto ${link.url} x hyperlink ${link.hyperlinkDivergente}`);
      if (isVL) { addOutro(`${slot} da oferta [VL]`, link.url); return; }
      if (slot === 'normal' || slot === 'black') {
        if (row.untrustedLinks) { addOutro(`${slot} (aba antiga "Legislação Tributária", linhas desalinhadas; conferir na Eduzz)`, link.url); return; }
        cand.chk[slot].push({ url: link.url, fonte, sheet: row.sheet });
      } else {
        addOutro(rotuloOutro, link.url, slot === 'cupom20' && d.precoCupom20 ? d.precoCupom20.valor : null);
      }
    };
    addChkCand('normal', d.chkNormal);
    addChkCand('black', d.chkBlack);
    addChkCand('cupom30', d.chkCupom30, 'com cupom 30%');
    addChkCand('cupom20', d.chkCupom20, 'com cupom 20% (SF33SP)');
    addChkCand('upgrade1', d.chkUpgrade1, 'upgrade #1 (R$ 245)');
    addChkCand('upgrade2', d.chkUpgrade2, 'upgrade #2 (R$ 157)');
  }

  // resolve por votação: valor mais frequente vence; perdedores viram um único aviso
  const moda = (lista, key) => {
    const cont = new Map();
    for (const item of lista) {
      const k = item[key];
      if (!cont.has(k)) cont.set(k, { n: 0, fontes: [] });
      cont.get(k).n++;
      cont.get(k).fontes.push(item.fonte);
    }
    const ordenado = [...cont.entries()].sort((a, b) => b[1].n - a[1].n);
    return ordenado;
  };
  for (const slot of ['cheio', 'promocional', 'black']) {
    const votos = moda(cand.precos[slot], 'valor');
    if (!votos.length) continue;
    p.precos[slot] = votos[0][0];
    if (votos.length > 1) {
      const outros = votos.slice(1).map(([v, info]) => `R$ ${v} (${info.fontes[0]}${info.n > 1 ? ` +${info.n - 1}` : ''})`).join(', ');
      aviso('preco-conflito', `preço ${slot}: adotado R$ ${votos[0][0]} (${votos[0][1].n} ocorrência(s)); divergente(s): ${outros}`);
    }
  }
  for (const slot of ['normal', 'black']) {
    const votos = moda(cand.chk[slot], 'url');
    if (!votos.length) continue;
    p.checkouts[slot] = votos[0][0];
    if (votos.length > 1) {
      for (const [url, info] of votos.slice(1)) addOutro(`${slot} alternativo (${info.fontes[0]})`, url);
      const outros = votos.slice(1).map(([u, info]) => `${u} (${info.fontes[0]}${info.n > 1 ? ` +${info.n - 1}` : ''})`).join(', ');
      aviso('checkout-conflito', `checkout ${slot}: adotado ${votos[0][0]} (${votos[0][1].n} ocorrência(s)); divergente(s): ${outros}`);
    }
  }
  // remove de "outros" o que acabou eleito como normal/black
  p.checkouts.outros = p.checkouts.outros.filter(o => o.url !== p.checkouts.normal && o.url !== p.checkouts.black);

  p.categoria = categorize(p.nome, p.ferramenta, p.tipo);

  // produto exclusivo de campanha (todas as linhas com prefixo [blackfriday])
  if (rows.every(r => /^\[blackfriday\]/i.test(r.data.nome))) p.campanha = 'blackfriday';

  produtos.push(p);
}

// (slugs e ordenação são atribuídos depois do bloco 5, que ainda pode adicionar produtos)

// ---------- 3. cupons ----------
const cupons = [];
{
  const { ws, rows } = sheetRows('Cupom');
  for (const r of rows) {
    if (r === 0) continue;
    const perc = rawText(cellAt(ws, r, 'A'));
    const codigo = rawText(cellAt(ws, r, 'B'));
    if (!codigo) continue;
    cupons.push({
      codigo,
      percentual: perc ? Number(perc) : null,
      categoria: rawText(cellAt(ws, r, 'C')),
      produtosElegiveis: rawText(cellAt(ws, r, 'D')),
      mensagem: rawText(cellAt(ws, r, 'E')),
    });
  }
}

// ---------- 4. ofertas personalizadas ----------
const ofertasPersonalizadas = [];
{
  const { ws, rows, range } = sheetRows('Ofertas personalizadas');
  for (const r of rows) {
    if (r < 2) continue; // R1 obs, R2 header
    const id = rawText(cellAt(ws, r, 'A'));
    if (!id) continue;
    const formato = rawText(cellAt(ws, r, 'C'));
    // varre pares (preço, link) de D em diante
    for (let c = colIdx('D'); c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (!cell) continue;
      const t = rawText(cell);
      const preco = parsePreco(t);
      if (preco.valor === null) continue;
      // próxima célula com link
      let url = null;
      for (let c2 = c + 1; c2 <= Math.min(c + 1, range.e.c); c2++) {
        const l = cellLink(ws[XLSX.utils.encode_cell({ r, c: c2 })]);
        if (l) { url = l.url; break; }
      }
      ofertasPersonalizadas.push({ idEduzz: id, parcelamento: formato || null, preco: preco.valor, checkout: url });
    }
  }
}

// ---------- 5. link produtos desconto (escada de preços com cupom) ----------
const linksDesconto = [];
{
  const { ws, rows, range } = sheetRows('link produtos desconto');
  for (const r of rows) {
    if (r === 0) continue;
    const id = rawText(cellAt(ws, r, 'A'));
    const nome = rawText(cellAt(ws, r, 'B'));
    if (!nome) continue;
    const item = {
      idEduzz: id || null, nome,
      area: rawText(cellAt(ws, r, 'C')),
      ferramenta: rawText(cellAt(ws, r, 'D')),
      formato: rawText(cellAt(ws, r, 'E')),
      paginaOferta: null,
      escada: [], // do maior para o menor preço, com link de checkout
    };
    let pendingPreco = null;
    for (let c = colIdx('F'); c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (!cell) continue;
      const link = cellLink(cell);
      const t = rawText(cell);
      if (link && /esquematizaai\.com/.test(link.url) && !/eduzz/.test(link.url)) {
        item.paginaOferta = link.url;
        continue;
      }
      if (link && /eduzz\.com/.test(link.url)) {
        item.escada.push({ preco: pendingPreco, checkout: link.url });
        pendingPreco = null;
        continue;
      }
      const preco = parsePreco(t);
      if (preco.valor !== null) {
        if (pendingPreco !== null) item.escada.push({ preco: pendingPreco, checkout: null });
        pendingPreco = preco.valor;
      }
    }
    if (pendingPreco !== null) item.escada.push({ preco: pendingPreco, checkout: null });
    if (item.escada.length || item.paginaOferta) linksDesconto.push(item);
  }
}

// ---------- 5.5 produtos que só existem na aba "link produtos desconto" ----------
{
  const idsExistentes = new Set(produtos.map(p => p.idEduzz).filter(Boolean));
  for (const item of linksDesconto) {
    if (!item.idEduzz || !/^\d{6,}$/.test(item.idEduzz) || idsExistentes.has(item.idEduzz)) continue;
    idsExistentes.add(item.idEduzz);
    const nome = item.nome.trim();
    produtos.push({
      id: null,
      idEduzz: item.idEduzz,
      nome,
      nomesAlternativos: [],
      categoria: categorize(nome, item.ferramenta, null),
      campanha: null,
      status: null, tipo: null, area: item.area || null, ferramenta: item.ferramenta || null, formato: item.formato || null, sefaz: null,
      urlSite: item.paginaOferta || null,
      observacao: null,
      precos: { cheio: null, promocional: null, black: null },
      precosTexto: null,
      checkouts: { normal: null, black: null, outros: [] },
      orderbump: null, orderbumpProdutos: null, orderbumpPreco: null, precoTotalComOrderbump: null,
      layoutCheckout: null,
      upsell: null,
      pastaGdrive: null,
      linkEdicaoEduzz: null,
      atualizacao: null,
      sobre: null, disciplinas: null, cronograma: null,
      fontes: ['link produtos desconto'],
      avisos: ['cadastro-incompleto: produto aparece apenas na aba "link produtos desconto" (checkouts com desconto em links-desconto.json); sem cadastro nas abas de produtos'],
    });
    avisos.push({ produto: nome, idEduzz: item.idEduzz, tipo: 'cadastro-incompleto', detalhe: 'só existe na aba "link produtos desconto"' });
  }
}

// slugs únicos + ordenação final
const usados = new Set();
for (const p of produtos) {
  let slug = slugify(p.nome);
  if (usados.has(slug)) slug = slug + '-' + (p.idEduzz || Math.random().toString(36).slice(2, 6));
  usados.add(slug);
  p.id = slug;
}
produtos.sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome));

// ---------- 6. sumários ----------
const sumarios = { resumosRegulares: { totalPaginas: null, totalDisciplinas: null, disciplinas: [] }, flashcardsRegulares: [], modulosPorArea: [] };
{
  const { ws, rows } = sheetRows('sumario_resumos_regulares');
  for (const r of rows) {
    const b = rawText(cellAt(ws, r, 'B'));
    const dcol = rawText(cellAt(ws, r, 'D'));
    if (b === 'Total Páginas') { sumarios.resumosRegulares.totalPaginas = Number(dcol) || null; continue; }
    if (b === 'Total Disciplinas') { sumarios.resumosRegulares.totalDisciplinas = Number(dcol) || null; continue; }
    if (!b || b === 'Disciplina' || r < 4) continue;
    sumarios.resumosRegulares.disciplinas.push({
      disciplina: b,
      versao: rawText(cellAt(ws, r, 'C')),
      paginas: dcol ? Number(dcol) || null : null,
      sumario: rawText(cellAt(ws, r, 'E')),
    });
  }
}
{
  const { ws, rows } = sheetRows('sumario_flashcards_regulares');
  for (const r of rows) {
    if (r === 0) continue;
    const disciplina = rawText(cellAt(ws, r, 'B'));
    if (!disciplina) continue;
    sumarios.flashcardsRegulares.push({
      disciplina,
      versao: rawText(cellAt(ws, r, 'C')),
      cards: (() => { const t = rawText(cellAt(ws, r, 'D')); return t ? Number(t) || null : null; })(),
      arvoreAssuntos: rawText(cellAt(ws, r, 'E')),
      observacao: rawText(cellAt(ws, r, 'F')),
    });
  }
}
{
  const { ws, rows } = sheetRows('modulos_resumos-regulares_por-a');
  for (const r of rows) {
    if (r === 0) continue;
    const disciplina = rawText(cellAt(ws, r, 'C'));
    if (!disciplina) continue;
    sumarios.modulosPorArea.push({
      formato: rawText(cellAt(ws, r, 'A')),
      area: rawText(cellAt(ws, r, 'B')),
      disciplina,
      modulo: rawText(cellAt(ws, r, 'D')),
      status: rawText(cellAt(ws, r, 'E')),
      entregaElaborador: rawText(cellAt(ws, r, 'F')),
      postagemAlunos: rawText(cellAt(ws, r, 'G')),
      observacao: rawText(cellAt(ws, r, 'H')),
      sumario: rawText(cellAt(ws, r, 'I')),
    });
  }
}

// ---------- 7. copy ----------
const copy = { mensagensDesconto: [], produtosDestacados: [] };
{
  const { ws, rows } = sheetRows('copy');
  for (const r of rows) {
    const b = rawText(cellAt(ws, r, 'B'));
    const c = rawText(cellAt(ws, r, 'C'));
    if (!b) continue;
    if (/^\d{6,}$/.test(b)) copy.produtosDestacados.push({ idEduzz: b, nome: c });
    else copy.mensagensDesconto.push(b);
  }
}

// ---------- escrever ----------
fs.mkdirSync(OUT_DIR, { recursive: true });
const write = (file, obj) => {
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(obj, null, 2), 'utf8');
  console.log('wrote', file);
};

const geradoEm = new Date().toISOString().slice(0, 10);
write('produtos.json', { geradoEm, fonte: 'Produtos (1).xlsx', total: produtos.length, produtos });
write('cupons.json', { geradoEm, fonte: 'Produtos (1).xlsx (aba Cupom)', cupons });
write('ofertas-personalizadas.json', { geradoEm, fonte: 'Produtos (1).xlsx (aba Ofertas personalizadas)', observacao: 'Via de regra utilizar as parcelas COM juros (nota da própria planilha). Links de checkout da Eduzz por valor de oferta, usados pelo atendimento para fechar vendas personalizadas.', ofertas: ofertasPersonalizadas });
write('links-desconto.json', { geradoEm, fonte: 'Produtos (1).xlsx (aba "link produtos desconto")', observacao: 'Escada de preços por produto: cada degrau é um checkout da Eduzz com cupom pré-aplicado. Usada pelo atendimento/campanhas para ofertar descontos progressivos.', produtos: linksDesconto });
write('sumarios.json', { geradoEm, fonte: 'Produtos (1).xlsx (abas sumario_* e modulos_*)', ...sumarios });
write('copy.json', { geradoEm, fonte: 'Produtos (1).xlsx (aba copy)', ...copy });

// ---------- estatísticas ----------
const porCategoria = {};
for (const p of produtos) porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1;
console.log('\n--- ESTATÍSTICAS ---');
console.log('produtos únicos:', produtos.length, porCategoria);
console.log('com checkout normal:', produtos.filter(p => p.checkouts.normal).length);
console.log('com checkout black:', produtos.filter(p => p.checkouts.black).length);
console.log('com algum checkout:', produtos.filter(p => p.checkouts.normal || p.checkouts.black || p.checkouts.outros.length).length);
console.log('sem nenhum checkout:', produtos.filter(p => !p.checkouts.normal && !p.checkouts.black && !p.checkouts.outros.length).length);
console.log('sem idEduzz:', produtos.filter(p => !p.idEduzz).length);
console.log('status ativo:', produtos.filter(p => p.status === 'ativo').length, '| inativo:', produtos.filter(p => p.status === 'inativo').length, '| sem status:', produtos.filter(p => !p.status).length);
console.log('cupons:', cupons.length);
console.log('ofertas personalizadas (degraus):', ofertasPersonalizadas.length);
console.log('linksDesconto produtos:', linksDesconto.length, '| degraus:', linksDesconto.reduce((s, i) => s + i.escada.length, 0));
console.log('sumarios: resumos', sumarios.resumosRegulares.disciplinas.length, '| flashcards', sumarios.flashcardsRegulares.length, '| modulos', sumarios.modulosPorArea.length);
console.log('avisos:', avisos.length);
const tipos = {};
for (const a of avisos) tipos[a.tipo] = (tipos[a.tipo] || 0) + 1;
console.log('avisos por tipo:', tipos);
