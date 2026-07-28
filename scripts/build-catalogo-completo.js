/**
 * Gera o catálogo do site a partir de "Catalogo_Completo_Esquematiza.xlsx".
 *
 * Esta planilha SUBSTITUI a antiga "Produtos (1).xlsx" (que gerava o catálogo pelo
 * scripts/build-catalogo.js, mantido só como referência do histórico). A diferença:
 * a antiga tinha 18 abas que se contradiziam e exigiam votação para resolver conflito;
 * esta é uma aba só, curada pelo cliente, com uma linha por produto.
 *
 * Uso:  node scripts/build-catalogo-completo.js ["C:\caminho\Catalogo_Completo_Esquematiza.xlsx"]
 * Requer:  npm install --save-dev xlsx
 *
 * O QUE A PLANILHA NOVA TEM DE DIFERENTE, e que muda o site:
 *  - PREÇO ÚNICO. Não existe mais coluna de "de/por" nem preço Black. Onde o site
 *    mostrava "-30%", agora mostra só o preço vigente. Não é perda de recurso: é
 *    a planilha dizendo que aquele desconto não existe mais.
 *  - DESCRIÇÃO em todos os 107 produtos (vai para `sobre`, usado na página do produto).
 *  - URL DA CAPA em todos os 107 (o scripts/build-capas-completo.js baixa e otimiza).
 *  - CHECKOUT em só metade deles. Os demais são vendidos pela página do WordPress,
 *    então `urlSite` vira o destino de compra (ver ofertaAtual em data/catalogo/index.ts).
 *
 * IDs: quando o produto já existia no catálogo anterior, o id é HERDADO para não
 * quebrar as URLs /vitrine/produto/[id] que já estão no ar e no sitemap. Só produto
 * realmente novo ganha slug novo, derivado da página de vendas.
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const XLSX_PATH =
  process.argv[2] || 'C:\\Users\\pedro\\OneDrive\\downloads\\Catalogo_Completo_Esquematiza.xlsx';
const DIR = path.join(__dirname, '..', 'src', 'data', 'catalogo');
const ABA = 'Catálogo Completo';

// ---------------------------------------------------------------- leitura
const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });
if (!wb.Sheets[ABA]) {
  console.error(`Aba "${ABA}" não encontrada. Abas: ${wb.SheetNames.join(', ')}`);
  process.exit(1);
}
const ws = wb.Sheets[ABA];
const range = XLSX.utils.decode_range(ws['!ref']);

const cel = (r, col) => ws[XLSX.utils.encode_cell({ r, c: XLSX.utils.decode_col(col) })];
const txt = (r, col) => {
  const c = cel(r, col);
  if (!c) return null;
  const v = String(c.v).replace(/\s+/g, ' ').trim();
  return v === '' ? null : v;
};
/** hyperlink embutido tem prioridade: a célula às vezes mostra um rótulo, não a URL */
const link = (r, col) => {
  const c = cel(r, col);
  if (!c) return null;
  if (c.l?.Target) return c.l.Target.trim();
  return typeof c.v === 'string' && /^https?:/.test(c.v.trim()) ? c.v.trim() : null;
};

const linhas = [];
for (let r = 1; r <= range.e.r; r++) {
  const nome = txt(r, 'E');
  if (!nome) continue;
  linhas.push({
    linha: r + 1,
    classe: txt(r, 'B'),
    tipo: txt(r, 'C'),
    formato: txt(r, 'D'),
    nome,
    paginaVendas: link(r, 'F'),
    checkout: link(r, 'G'),
    preco: cel(r, 'I') ? Number(cel(r, 'I').v) : null,
    descricao: txt(r, 'J'),
    arquivoCapa: txt(r, 'K'),
    urlCapa: link(r, 'L'),
  });
}

// ------------------------------------------------- casamento com o catálogo antigo
/**
 * Referência do catálogo ANTES da migração para esta planilha.
 * Fica num snapshot próprio, e não no produtos.json, porque o script sobrescreve o
 * produtos.json: se comparasse com ele, a segunda execução acharia que nada mudou e
 * o relatório de removidos viria vazio. Com o snapshot, rodar de novo dá o mesmo
 * resultado da primeira vez.
 */
const SNAPSHOT = path.join(DIR, 'produtos.antes-da-planilha-completa.json');
// fs + JSON.parse, e não require: require só entende .json/.js, e o snapshot precisa
// ser lido pelo conteúdo, não pela extensão. Com require, um erro aqui passaria
// despercebido e o relatório de removidos sairia vazio sem ninguém notar.
const lerProdutos = (arquivo) => {
  try {
    return JSON.parse(fs.readFileSync(arquivo, 'utf8')).produtos ?? [];
  } catch {
    return null;
  }
};
const anterior = lerProdutos(SNAPSHOT) ?? lerProdutos(path.join(DIR, 'produtos.json')) ?? [];
if (!anterior.length) {
  console.warn('AVISO: não achei catálogo anterior; o relatório REMOVIDOS.md virá vazio.');
}

const PARADAS = new Set(['de', 'do', 'da', 'e', 'a', 'o', 'em', 'para', 'com', 'as', 'os']);
// a planilha antiga abreviava e pluralizava diferente; sem isso o casamento erra
const SINONIMOS = {
  adm: 'administracao', administrativa: 'administracao',
  resumos: 'resumo', flashcard: 'flashcards',
  isolada: 'isolado', isoladas: 'isolado',
};
const tokens = (s) =>
  s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((t) => t && !PARADAS.has(t))
    .map((t) => SINONIMOS[t] ?? t);

const similaridade = (a, b) => {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
};

/** 0.75 foi calibrado olhando os pares: abaixo disso começam a aparecer trocas
 *  como "Direito Processual Civil" casando com "Direito Civil". */
const CORTE = 0.75;
const usados = new Set();
function parAnterior(nome) {
  let melhor = null;
  let score = 0;
  for (const q of anterior) {
    if (usados.has(q.id)) continue;
    const s = similaridade(nome, q.nome);
    if (s > score) {
      score = s;
      melhor = q;
    }
  }
  if (melhor && score >= CORTE) {
    usados.add(melhor.id);
    return { par: melhor, score };
  }
  return { par: null, score };
}

// ------------------------------------------------------------------ derivações
const slugDaPagina = (url) => {
  if (!url) return null;
  const m = url.match(/\/produto\/([^/?#]+)/);
  return m ? m[1] : null;
};

const slugDoNome = (nome) =>
  nome
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** A planilha nova não tem coluna de área; o site filtra por ela. Quando não dá
 *  para herdar do catálogo antigo, deduz pelo nome. null quando não dá para afirmar. */
const REGRAS_AREA = [
  [/\b(policial|pf|prf|depen|pc-|pm-)\b/i, 'Policial'],
  [/\b(tj-|trt|trf|stj|stm|tse|tribunal|tribunais)\b/i, 'Tribunais'],
  [/\b(tce|tcu|tcdf|cgu|controle|gest[aã]o)\b/i, 'Controle'],
  [/\b(c[aâ]mara|senado|legislativ)\b/i, 'Legislativo'],
  [/\b(banc[aá]ri|banco do brasil|caixa|bacen)\b/i, 'Bancária'],
  [/\b(fiscal|sefaz|iss|icms|receita|tribut[aá]ri|simples nacional)\b/i, 'Fiscal'],
];
function deduzArea(nome, descricao) {
  for (const [re, area] of REGRAS_AREA) if (re.test(nome)) return area;
  for (const [re, area] of REGRAS_AREA) if (descricao && re.test(descricao)) return area;
  return null;
}

/** Formato da planilha -> rótulo de ferramenta que a UI já conhece (rotulos.ts) */
const FERRAMENTA = {
  Flashcards: 'Flashcards',
  Resumo: 'Resumo',
  Resumos: 'Resumo',
  'Resumos + Flashcards': 'R + F + Q + V',
  Assinatura: 'Assinatura',
  'Questões Inéditas': 'Questões Inéditas',
  'Vade Mecum': 'Vademecum',
  'Legislação Tributária': 'Resumo',
  'Reforma Tributária': 'Resumo',
  Regimentos: 'Resumo',
};

// ------------------------------------------------------------------ montagem
const produtos = [];
const avisosGerais = [];
const idsVistos = new Set();

for (const l of linhas) {
  const { par, score } = parAnterior(l.nome);
  const avisos = [];

  let id = par?.id ?? slugDaPagina(l.paginaVendas) ?? slugDoNome(l.nome);
  if (idsVistos.has(id)) {
    const base = id;
    let n = 2;
    while (idsVistos.has(`${base}-${n}`)) n++;
    id = `${base}-${n}`;
    avisos.push(`id duplicado na planilha; virou "${id}"`);
  }
  idsVistos.add(id);

  if (!l.checkout) {
    avisos.push('sem checkout Eduzz na planilha: a compra vai para a página de vendas');
  }
  if (l.preco === null) avisos.push('sem preço na planilha');

  const area = par?.area ?? deduzArea(l.nome, l.descricao);
  if (!area) avisos.push('sem área definida (não aparece nos filtros por área)');

  produtos.push({
    id,
    idEduzz: par?.idEduzz ?? null,
    nome: l.nome,
    nomesAlternativos: par && par.nome !== l.nome ? [par.nome] : [],
    categoria: (l.tipo ?? 'outro').toLowerCase(),
    campanha: null,
    status: 'ativo',
    tipo: l.tipo,
    area,
    ferramenta: FERRAMENTA[l.formato] ?? l.formato,
    formato: l.classe,
    sefaz: (l.nome.match(/\b(SEFAZ-[A-Z]{2}|ISS-[A-Za-zÀ-ÿ]+|TJ-[A-Z]{2}|TCE-?[A-Z]{2})\b/) ?? [null])[0],
    urlSite: l.paginaVendas,
    observacao: null,
    precos: { cheio: l.preco, promocional: null, black: null },
    precosTexto: null,
    checkouts: { normal: l.checkout, black: null, outros: [] },
    orderbump: null,
    orderbumpProdutos: null,
    orderbumpPreco: null,
    precoTotalComOrderbump: null,
    layoutCheckout: null,
    upsell: null,
    pastaGdrive: null,
    linkEdicaoEduzz: null,
    atualizacao: null,
    sobre: l.descricao,
    disciplinas: par?.disciplinas ?? null,
    cronograma: null,
    capaOrigem: { arquivo: l.arquivoCapa, url: l.urlCapa },
    fontes: [`Catalogo_Completo_Esquematiza.xlsx linha ${l.linha}`],
    avisos,
    herdouDe: par ? { id: par.id, nome: par.nome, score: Number(score.toFixed(2)) } : null,
  });
}

// ------------------------------------------- checkout repetido em produtos diferentes
// Se dois produtos com preços diferentes apontam para o mesmo checkout, um dos dois
// está errado na planilha e não dá para saber qual. Mostrar o preço A com o checkout
// que cobra B quebra a regra da casa: o botão tem que cobrar exatamente o que a tela
// diz. Então os dois perdem o checkout direto e caem na própria página de vendas,
// que é por produto e mostra o preço certo.
const porCheckout = new Map();
for (const p of produtos) {
  if (!p.checkouts.normal) continue;
  porCheckout.set(p.checkouts.normal, (porCheckout.get(p.checkouts.normal) ?? []).concat(p));
}
const checkoutsAmbiguos = [];
for (const [url, lista] of porCheckout) {
  if (lista.length < 2) continue;
  checkoutsAmbiguos.push({ url, produtos: lista.map((p) => `${p.nome} (R$ ${p.precos.cheio})`) });
  for (const p of lista) {
    p.checkouts.outros.push({ rotulo: 'checkout ambíguo na planilha', preco: p.precos.cheio, url });
    p.checkouts.normal = null;
    p.avisos.push(
      `checkout ${url} está repetido em ${lista.length} produtos com preços diferentes; ` +
        'a compra foi desviada para a página de vendas até a planilha ser corrigida',
    );
  }
}

// ----------------------------------------------- o que saiu do ar em relação ao antigo
const idsNovos = new Set(produtos.map((p) => p.id));
const removidos = anterior.filter((q) => !idsNovos.has(q.id));

// --------------------------------------------------------------------- saída
const geradoEm = new Date().toISOString().slice(0, 10);
const escrever = (arquivo, dados) => {
  fs.writeFileSync(path.join(DIR, arquivo), JSON.stringify(dados, null, 1), 'utf8');
};

escrever('produtos.json', {
  geradoEm,
  fonte: 'Catalogo_Completo_Esquematiza.xlsx',
  total: produtos.length,
  produtos,
});

// relatório do que saiu, para o cliente decidir se algum volta
const linhasMd = [
  '# Produtos que saíram do catálogo',
  '',
  `Gerado em ${geradoEm} ao importar \`Catalogo_Completo_Esquematiza.xlsx\`.`,
  '',
  `A planilha nova traz **${produtos.length}** produtos. O catálogo anterior tinha **${anterior.length}**.`,
  `Os **${removidos.length}** abaixo não têm correspondente na planilha nova, então saíram do site.`,
  '',
  'Se algum deles ainda é vendido, é só voltar para a planilha e rodar o script de novo.',
  '',
  '| Produto | Categoria | Preço que estava no site | Tinha checkout? |',
  '| --- | --- | --- | --- |',
];
for (const r of removidos) {
  const preco = r.precos.black ?? r.precos.cheio;
  const temCk = r.checkouts.normal || r.checkouts.black ? 'sim' : 'não';
  linhasMd.push(`| ${r.nome} | ${r.categoria} | ${preco === null ? '—' : 'R$ ' + preco} | ${temCk} |`);
}
fs.writeFileSync(path.join(DIR, 'REMOVIDOS.md'), linhasMd.join('\n') + '\n', 'utf8');

// --------------------------------------------------------------------- resumo
const porCategoria = {};
for (const p of produtos) porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1;
const semCheckout = produtos.filter((p) => !p.checkouts.normal).length;
const semArea = produtos.filter((p) => !p.area).length;
const herdados = produtos.filter((p) => p.herdouDe).length;

console.log(`produtos: ${produtos.length}`, porCategoria);
console.log(`ids herdados do catálogo anterior: ${herdados} (URLs preservadas)`);
console.log(`ids novos: ${produtos.length - herdados}`);
console.log(`sem checkout Eduzz (vendem pela página): ${semCheckout}`);
console.log(`sem área: ${semArea}`);
console.log(`saíram do catálogo: ${removidos.length} -> ver REMOVIDOS.md`);
if (checkoutsAmbiguos.length) {
  console.log(`\nCHECKOUTS REPETIDOS EM PRODUTOS DIFERENTES (${checkoutsAmbiguos.length}) - CORRIGIR NA PLANILHA:`);
  for (const c of checkoutsAmbiguos) console.log(`   ${c.url}\n     ${c.produtos.join('\n     ')}`);
}
if (avisosGerais.length) console.log('avisos:', avisosGerais);
