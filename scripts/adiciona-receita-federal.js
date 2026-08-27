/**
 * Cadastra os produtos de Receita Federal lançados depois da última importação.
 *
 * Uso:  node scripts/adiciona-receita-federal.js
 *
 * Roda de novo sem duplicar: produto já cadastrado é pulado.
 *
 * DE ONDE VÊM OS DADOS: aba "Legislação Tributária" da planilha do Sérgio, onde
 * eles aparecem com SEFAZ = "Receita Federal". Só entra aqui o que a planilha
 * afirma: nome, id, preço, checkout e página de vendas.
 *
 * "Sobre o produto" e "Disciplinas" vêm VAZIOS na planilha para os quatro. Não
 * inventei texto: o conteúdo é raspado das páginas de venda por
 * build-conteudo-produto.js, que é o mesmo caminho dos outros 107.
 */

const fs = require('fs');
const path = require('path');

const ARQUIVO = path.join(__dirname, '..', 'src/data/catalogo/produtos.json');
const ARQUIVO_CONTEUDO = path.join(__dirname, '..', 'src/data/catalogo/conteudo-produto.json');

/** "Flashcards Legislação Aduaneira (Receita Federal)" -> slug do site */
function idDaUrl(url) {
  const m = String(url).match(/\/produto\/([^/]+)\/?$/);
  return m ? m[1] : null;
}

const NOVOS = [
  {
    nome: 'Flashcards Legislação Aduaneira (Receita Federal)',
    idEduzz: '3089202',
    categoria: 'isolado',
    tipo: 'Isolado',
    preco: 197,
    checkout: 'https://chk.eduzz.com/7tnzwfzg',
    urlSite: 'https://esquematizaai.com/produto/flashcards-legislacao-aduaneira-receita-federal/',
  },
  {
    nome: 'Flashcards Legislação Tributária Federal (Receita Federal)',
    idEduzz: '3089205',
    categoria: 'isolado',
    tipo: 'Isolado',
    preco: 197,
    checkout: 'https://chk.eduzz.com/to4udxik',
    urlSite: 'https://esquematizaai.com/produto/flashcards-legislacao-tributaria-federal-receita-federal/',
  },
  {
    nome: 'Flashcards Comércio Internacional (Receita Federal)',
    idEduzz: '3089206',
    categoria: 'isolado',
    tipo: 'Isolado',
    preco: 197,
    checkout: 'https://chk.eduzz.com/fjlxljqj',
    urlSite: 'https://esquematizaai.com/produto/flashcards-comercio-internacional-receita-federal/',
  },
  {
    nome: 'Combo Flashcards LTF + Leg Aduaneira + Comércio Internacional (Receita Federal)',
    idEduzz: '3089207',
    categoria: 'combo',
    tipo: 'Combo',
    preco: 457,
    checkout: 'https://chk.eduzz.com/2ks6xiyi',
    urlSite: 'https://esquematizaai.com/produto/combo-flashcards-receita-federal/',
  },
];

/**
 * Conserta o título da aba de conteúdo do combo.
 *
 * A página de vendas do combo no WordPress reaproveitou a aba do produto
 * isolado, então o título diz "Comércio Internacional" enquanto o corpo lista
 * as três disciplinas. Na página do produto esse título vira cabeçalho, e um
 * cabeçalho que nomeia uma disciplina só, em cima de uma lista com três, faz o
 * comprador achar que está levando menos do que está.
 *
 * Só o título é trocado. O corpo é o que a página diz, e continua intacto.
 * O padrão segue os combos irmãos: "⭐️ Combo de Legislação Tributária ISS-MAO".
 */
function corrigeTituloDoCombo() {
  if (!fs.existsSync(ARQUIVO_CONTEUDO)) return;

  const bruto = JSON.parse(fs.readFileSync(ARQUIVO_CONTEUDO, 'utf8'));
  const item = bruto.conteudo && bruto.conteudo['combo-flashcards-receita-federal'];
  if (!item || !item.detalhesTitulo) return;

  const certo = '⭐️ Combo de Flashcards Receita Federal';
  if (item.detalhesTitulo === certo) return;

  console.log('  título do combo: "' + item.detalhesTitulo + '" -> "' + certo + '"');
  item.detalhesTitulo = certo;
  fs.writeFileSync(ARQUIVO_CONTEUDO, JSON.stringify(bruto, null, 1), 'utf8');
}

function main() {
  const bruto = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
  const lista = bruto.produtos;

  let cadastrados = 0;
  let pulados = 0;

  for (const n of NOVOS) {
    const id = idDaUrl(n.urlSite);
    if (lista.some((p) => p.id === id || String(p.idEduzz) === n.idEduzz)) {
      pulados++;
      continue;
    }

    lista.push({
      id,
      idEduzz: n.idEduzz,
      nome: n.nome,
      nomesAlternativos: [],
      categoria: n.categoria,
      campanha: null,
      status: 'ativo',
      tipo: n.tipo,
      // Receita Federal é concurso da área fiscal; é assim que a vitrine filtra
      area: 'Fiscal',
      ferramenta: 'Flashcards',
      formato: 'Regular',
      sefaz: 'Receita Federal',
      urlSite: n.urlSite,
      observacao: null,
      precos: { cheio: n.preco, promocional: null, black: null },
      precosTexto: null,
      checkouts: { normal: n.checkout, black: null, outros: [] },
      orderbump: null,
      orderbumpProdutos: null,
      orderbumpPreco: null,
      precoTotalComOrderbump: null,
      layoutCheckout: null,
      upsell: null,
      pastaGdrive: null,
      linkEdicaoEduzz: null,
      atualizacao: null,
      // vazios de propósito: o texto vem da raspagem da página de vendas
      sobre: null,
      disciplinas: null,
      cronograma: null,
      capaOrigem: null,
      fontes: ['Produtos (2).xlsx, aba Legislação Tributária'],
      avisos: [],
      herdouDe: null,
    });
    cadastrados++;
    console.log('  cadastrado: ' + id + '  R$ ' + n.preco);
  }

  fs.writeFileSync(ARQUIVO, JSON.stringify(bruto, null, 2) + '\n', 'utf8');

  console.log('\n  cadastrados: ' + cadastrados + ' | já existiam: ' + pulados);
  console.log('  total no catálogo: ' + lista.length);

  corrigeTituloDoCombo();
}

main();
