/**
 * Captura o conteúdo editorial das páginas de venda do WordPress e converte
 * para o Markdown que a página do produto renderiza.
 *
 * Uso:  node scripts/build-conteudo-produto.js [--teste]
 *
 * Quatro blocos, todos em lugar previsível no HTML do Elementor:
 *   sobre      "Sobre o produto"      -> argumento de venda
 *   detalhes   "DISCIPLINAS"          -> módulos, com o que já está liberado
 *   sumario    "SUMÁRIO"              -> tópicos de cada disciplina
 *   cronograma "Cronograma de entrega"-> se o material está pronto ou por vir
 *
 * O cronograma é o que o cliente mais pediu: alguns materiais (Legislação
 * Tributária, por exemplo) vão à venda antes de ficarem prontos, e o aluno
 * precisa saber disso ANTES de pagar.
 *
 * POR QUE CONVERTER E NÃO COPIAR O HTML:
 * o texto do WordPress traz cor fixa no meio da frase (style="color: #FF7345").
 * Trazer isso amarraria o texto ao tema antigo e encheria a página de cor
 * solta. Aqui a marcação diz o QUE é destaque; a cor é decisão do CSS do site.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src', 'data', 'catalogo');
const SAIDA = path.join(DIR, 'conteudo-produto.json');
const SO_TESTE = process.argv.includes('--teste');

const produtos = require(path.join(DIR, 'produtos.json')).produtos;

const decodar = (s) =>
  s
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8211;|&#8212;/g, ', ') // o cliente não usa travessão
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

/** Recorta o conteúdo que vem depois de um marcador, até o próximo bloco. */
function recortar(html, marcador, container) {
  const marca = html.indexOf(marcador);
  if (marca === -1) return null;

  const i = html.indexOf(container, marca);
  if (i === -1) return null;

  const ini = html.indexOf('>', i) + 1;
  const limites = ['elementor-element', 'elementor-column', 'elementor-section', 'elementor-widget', 'eael-accordion-header']
    .map((c) => html.indexOf(c, ini))
    .filter((x) => x > ini);
  const fim = limites.length ? Math.min(...limites) : ini + 20000;
  const abre = html.lastIndexOf('<', fim);
  return html.slice(ini, abre > ini ? abre : fim);
}

/** HTML do WordPress -> Markdown com a marcação que o site já entende. */
function paraMarkdown(bloco) {
  let t = bloco;

  // PRIMEIRO de tudo: fora <style>, <script> e <noscript> COM o conteúdo.
  // A limpeza de tags lá embaixo só tira os sinais de menor/maior, então o
  // CSS do tema sobrevivia como texto e ia parar na tela do produto
  // (".elementor-1054 .elementor-element{...}"). Pegou 101 dos 107 produtos.
  t = t.replace(/<(style|script|noscript)\b[\s\S]*?<\/\1>/gi, ' ');

  t = t.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const limpo = txt.replace(/<[^>]+>/g, '').trim();
    return `[${limpo}](${href})`;
  });

  t = t.replace(/<\/?(b|strong)[^>]*>/gi, '**');
  t = t.replace(/<\/?u[^>]*>/gi, '**');
  t = t.replace(/<\/?(em|i)[^>]*>/gi, '*');
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<\/p>/gi, '\n\n');
  t = t.replace(/<[^>]+>/g, '');

  t = decodar(t);

  // Alternação e não classe de caracteres: ⭐️ e ⚙️ terminam em seletor de
  // variação (U+FE0F), e dentro de [] o seletor virava caractere solto,
  // partindo o emoji em duas linhas.
  // ➞ e → NÃO entram aqui: eles são separadores no meio da linha
  // ("01. Português ➞ 166 páginas"), e quebrar linha ali jogava a contagem
  // de páginas para a linha de baixo, solta.
  t = t.replace(/\s*(➥|▸|▹|⭐️?|💡|📖|⚙️?)/gu, '\n$1');

  const linhas = t.split('\n').map((l) => l.trim());
  const saida = [];
  let dentroDeDica = false;

  for (const linha of linhas) {
    if (!linha) {
      if (dentroDeDica) { saida.push(':::'); dentroDeDica = false; }
      saida.push('');
      continue;
    }
    if (/^💡/.test(linha)) {
      if (!dentroDeDica) { saida.push(''); saida.push(':::destaque'); dentroDeDica = true; }
      saida.push(linha.replace(/^💡\s*/, ''));
      continue;
    }
    if (dentroDeDica) { saida.push(':::'); dentroDeDica = false; saida.push(''); }

    if (/^[➥]/.test(linha)) { saida.push('- ' + linha.replace(/^➥\s*/, '')); continue; }
    if (/^⭐/.test(linha)) { saida.push('- ' + linha.replace(/^⭐️?\s*/, '')); continue; }
    if (/^[▸▹]/.test(linha)) { saida.push('  - ' + linha.replace(/^[▸▹]\s*/, '')); continue; }
    if (/^[↓⬇]/.test(linha)) continue;
    if (pareceCss(linha)) continue; // rede de segurança, caso escape algum

    // "01. Tema ➞ 12 páginas": a seta é separador, não marcador de lista
    saida.push(linha.replace(/\s*[➞→]\s*/g, ' · '));
  }
  if (dentroDeDica) saida.push(':::');

  return saida
    .map(equilibrarNegrito)
    .map(limparNegrito)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Segunda barreira contra CSS na tela: reconhece seletor e declaração soltos.
 * A primeira (remover <style> com conteúdo) já resolve, mas se o tema mudar e
 * passar CSS por outro caminho, é melhor a linha sumir do que o cliente
 * descobrir isso numa página de venda.
 */
function pareceCss(linha) {
  if (!linha) return false;
  return (
    /^[.#][a-z][\w-]*[\s.,>{]/i.test(linha) ||           // .classe { ou .a .b
    /\{[a-z-]+\s*:[^}]*\}/i.test(linha) ||               // { prop: valor }
    /^[a-z-]+\s*:\s*[^;]+;$/i.test(linha) ||             // prop: valor;
    /^(@media|@import|@font-face|--[a-z-]+:)/i.test(linha)
  );
}

/** Marcador ímpar faz o Markdown grifar o texto errado; o solitário sai. */
function equilibrarNegrito(linha) {
  const marcas = (linha.match(/\*\*/g) || []).length;
  if (marcas % 2 === 0) return linha;
  const ultimo = linha.lastIndexOf('**');
  return linha.slice(0, ultimo) + linha.slice(ultimo + 2);
}

/**
 * Ajeita os marcadores de UMA linha, pareando de verdade em vez de regex:
 * regex confundia par vazio do editor (<b></b>) com dois negritos vizinhos e
 * colava as palavras ("32 (trinta e dois)RESUMOS").
 */
function limparNegrito(linha) {
  const partes = linha.split('**');
  if (partes.length < 3) return linha;

  let saida = partes[0];
  for (let i = 1; i < partes.length; i += 2) {
    const dentro = partes[i] ?? '';
    const depois = partes[i + 1] ?? '';
    if (!dentro.trim()) { saida += dentro + depois; continue; }
    const esquerda = dentro.match(/^[ \t]*/)[0];
    const direita = dentro.match(/[ \t]*$/)[0];
    saida += `${esquerda}**${dentro.trim()}**${direita}${depois}`;
  }
  // "**A****B**" (negritos colados) o Markdown não sabe abrir; separa os pares
  return saida.replace(/\*\*\*\*/g, '** **');
}

const BLOCOS = [
  { chave: 'sobre', marcador: 'Sobre o produto', container: 'elementor-widget-container', minimo: 60 },
  { chave: 'cronograma', marcador: 'Cronograma de entrega', container: 'elementor-widget-container', minimo: 5 },
];

/** Perguntas do FAQ, que aparecem no mesmo acordeão do conteúdo do produto. */
const EH_FAQ = /^(como |qual |quais |e se |o material|os materiais|poderei|posso |por quanto)/i;

/**
 * Lê as abas do acordeão com título e conteúdo.
 *
 * O nome da aba de conteúdo MUDA por tipo de produto: nos combos é
 * "📚 DISCIPLINAS", nos isolados é o nome da própria matéria ("Direito
 * Constitucional: 164 páginas"). Procurar por um texto fixo só achava os
 * combos, por isso a escolha é pelo que a aba NÃO é: as de FAQ ficam de fora.
 */
function lerAcordeao(html) {
  const abas = [];
  const re = /eael-accordion-tab-title">([\s\S]{0,160}?)<\/span>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const titulo = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const iConteudo = html.indexOf('eael-accordion-content', m.index);
    if (iConteudo === -1) continue;
    const ini = html.indexOf('>', iConteudo) + 1;
    const fim = html.indexOf('eael-accordion-header', ini);
    abas.push({ titulo, html: html.slice(ini, fim > ini ? fim : ini + 20000) });
  }
  return abas;
}

(async () => {
  const alvo = produtos.filter((p) => p.urlSite);
  const lista = SO_TESTE ? alvo.slice(0, 2) : alvo;
  const conteudo = {};
  const contagem = { sobre: 0, detalhes: 0, sumario: 0, cronograma: 0 };
  const falhas = [];

  for (const [n, p] of lista.entries()) {
    try {
      const res = await fetch(p.urlSite, { headers: { 'User-Agent': 'EsquematizaBuild/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const item = {};
      for (const b of BLOCOS) {
        const bruto = recortar(html, b.marcador, b.container);
        if (!bruto) continue;
        const md = paraMarkdown(bruto);
        if (md.length < b.minimo) continue;
        item[b.chave] = md;
        contagem[b.chave]++;
      }

      const abas = lerAcordeao(html).filter((a) => a.titulo && !EH_FAQ.test(a.titulo));
      const abaSumario = abas.find((a) => /SUM(Á|A)RIO/i.test(a.titulo));
      const abaDetalhes = abas.find((a) => a !== abaSumario);

      if (abaDetalhes) {
        const md = paraMarkdown(abaDetalhes.html);
        if (md.length >= 30) {
          item.detalhes = md;
          // alternação, não classe: emoji em [] quebra o par de substitutos
          item.detalhesTitulo = abaDetalhes.titulo.replace(/^(📚|📖|📝)\s*/u, '').trim();
          contagem.detalhes++;
        }
      }
      if (abaSumario) {
        const md = paraMarkdown(abaSumario.html);
        if (md.length >= 30) { item.sumario = md; contagem.sumario++; }
      }
      if (Object.keys(item).length) conteudo[p.id] = item;

      if (SO_TESTE) {
        console.log('\n============', p.nome, '============');
        for (const [k, v] of Object.entries(item)) {
          console.log(`\n--- ${k} ---\n` + v.slice(0, 420));
        }
      } else if ((n + 1) % 20 === 0) {
        console.log(`  ${n + 1}/${lista.length}...`);
      }
    } catch (e) {
      falhas.push({ nome: p.nome, motivo: e.message });
    }
    await new Promise((r) => setTimeout(r, 120)); // gentil com o servidor do cliente
  }

  if (SO_TESTE) return;

  fs.writeFileSync(
    SAIDA,
    JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), fonte: 'páginas de venda do WordPress', conteudo }, null, 1),
    'utf8',
  );

  console.log(`\nprodutos com algum conteúdo: ${Object.keys(conteudo).length}/${lista.length}`);
  for (const [k, v] of Object.entries(contagem)) console.log(`  ${k.padEnd(11)} ${v}`);
  console.log(`\níndice: ${SAIDA}`);
  if (falhas.length) {
    console.log(`\nfalhas (${falhas.length}):`);
    falhas.forEach((f) => console.log('  ', f.nome.slice(0, 50), '|', f.motivo));
  }
})();
