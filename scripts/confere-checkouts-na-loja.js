/**
 * Descobre o checkout de verdade de cada produto, lendo a própria loja.
 *
 * O QUE ISSO RESOLVE: 86 produtos do site não têm checkout na planilha, e por
 * isso o botão leva para a página do produto no WordPress em vez de levar ao
 * pagamento. O Sérgio apontou isso em 15/09 no Combo SEFAZ-AL: "está
 * direcionando para o link do site antigo, o correto era enviar direto para o
 * checkout".
 *
 * POR QUE NÃO USAR O QUE JÁ ESTÁ NA PLANILHA: metade desses produtos tem um
 * link guardado em `checkouts.outros`, mas vindo da aba com as colunas
 * desalinhadas, ou seja, o link pode ser de OUTRO produto. Foi assim que em
 * setembro dezesseis produtos foram anunciados abaixo do preço real. Link de
 * pagamento não se adivinha.
 *
 * A LOJA É A FONTE: a página do produto no WordPress é exatamente onde o
 * comprador cai hoje e onde ele clica em "Comprar agora". O link que está lá é,
 * por definição, o checkout certo daquele produto.
 *
 * A CONFERÊNCIA DE PREÇO É O FREIO: só vale o checkout quando o preço da loja
 * bate com o preço do catálogo. Se divergir, o script NÃO decide: ele relata e
 * deixa para uma pessoa olhar, porque mandar alguém para um checkout com preço
 * diferente do anunciado é propaganda enganosa.
 *
 *   node scripts/confere-checkouts-na-loja.js            # só relata
 *   node scripts/confere-checkouts-na-loja.js --gravar   # grava os confirmados
 *
 * Grava em src/data/catalogo/checkouts-manuais.json, que é a camada manual e
 * sobrevive à próxima importação da planilha.
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..', 'src', 'data', 'catalogo');
const produtosDb = JSON.parse(fs.readFileSync(path.join(RAIZ, 'produtos.json'), 'utf8'));
const ARQUIVO_MANUAIS = path.join(RAIZ, 'checkouts-manuais.json');
const manuais = JSON.parse(fs.readFileSync(ARQUIVO_MANUAIS, 'utf8'));

const GRAVAR = process.argv.includes('--gravar');
const URL_DA_LOJA = 'https://loja.esquematizaai.com';

/** Mesma troca de domínio do site: a planilha guarda o endereço antigo. */
function paraLoja(link) {
  return link.replace(/^https?:\/\/(www\.)?esquematizaai\.com/i, URL_DA_LOJA);
}

/**
 * O checkout da Eduzz aparece como sun.eduzz.com no WordPress e como
 * chk.eduzz.com na planilha. É o mesmo endereço com dois nomes, e o que
 * identifica o produto é o código no fim.
 */
function checkoutsNaPagina(html) {
  const achados = new Map();
  for (const m of html.matchAll(/https?:\/\/(?:sun|chk)\.eduzz\.com\/([A-Za-z0-9]+)/g)) {
    achados.set(m[1], (achados.get(m[1]) ?? 0) + 1);
  }
  return [...achados.entries()].sort((a, b) => b[1] - a[1]).map(([codigo]) => codigo);
}

/** Palavras com 3 letras ou mais, sem acento e sem pontuação. */
function palavras(texto) {
  return new Set(
    texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3),
  );
}

/** Quanto do nome do catálogo aparece no título da Eduzz, de 0 a 1. */
function semelhanca(nomeDoCatalogo, tituloDaEduzz) {
  const a = palavras(nomeDoCatalogo);
  const b = palavras(tituloDaEduzz);
  if (a.size === 0) return 0;
  let iguais = 0;
  for (const w of a) if (b.has(w)) iguais++;
  return iguais / a.size;
}

function precoNaPagina(html) {
  const precos = new Set();
  for (const m of html.matchAll(/woocommerce-Price-amount[\s\S]{0,200}?([\d.]+,\d{2})/g)) {
    precos.add(Number(m[1].replace(/\./g, '').replace(',', '.')));
  }
  return [...precos];
}

async function baixar(endereco) {
  const resposta = await fetch(endereco, {
    redirect: 'follow',
    headers: { 'user-agent': 'esquematiza-conferencia-de-checkout' },
  });
  return {
    status: resposta.status,
    enderecoFinal: resposta.url,
    html: resposta.ok ? await resposta.text() : '',
  };
}

/**
 * Produto que saiu da loja não dá 404: o WordPress manda para a vitrine de
 * materiais. Essa página lista dezenas de produtos, com dezenas de checkouts e
 * dezenas de preços, e um deles acaba batendo com o preço do catálogo por
 * coincidência. Foi assim que três combos diferentes (MT, PA e SP) receberam o
 * MESMO checkout na primeira rodada desta conferência.
 *
 * Se o endereço final não é mais uma página de produto, não há o que ler ali.
 */
function ehPaginaDeProduto(endereco) {
  return /\/produto\/[^/]+\/?$/.test(new URL(endereco).pathname);
}

const alvos = produtosDb.produtos.filter(
  (p) => p.precos?.cheio != null && !manuais.checkouts[p.id] && !p.checkouts?.normal && p.urlSite,
);

const relatorio = {
  confirmados: [],
  precoDivergente: [],
  semCheckout: [],
  paginaFora: [],
  saiuDaLoja: [],
  nomeDivergente: [],
  checkoutRepetido: [],
};

async function main() {
  console.log('produtos a conferir: ' + alvos.length + '\n');

  for (const [i, p] of alvos.entries()) {
    const endereco = paraLoja(p.urlSite);
    const posicao = String(i + 1).padStart(3) + '/' + alvos.length;

    let resposta;
    try {
      resposta = await baixar(endereco);
    } catch (e) {
      relatorio.paginaFora.push({ id: p.id, endereco, motivo: e.message });
      console.log(posicao + '  ERRO DE REDE  ' + p.id);
      continue;
    }

    if (resposta.status !== 200) {
      relatorio.paginaFora.push({ id: p.id, endereco, motivo: 'HTTP ' + resposta.status });
      console.log(posicao + '  HTTP ' + resposta.status + '     ' + p.id);
      continue;
    }

    if (!ehPaginaDeProduto(resposta.enderecoFinal)) {
      relatorio.saiuDaLoja.push({ id: p.id, endereco, foiPara: resposta.enderecoFinal });
      console.log(posicao + '  SAIU DA LOJA  ' + p.id);
      continue;
    }

    const codigos = checkoutsNaPagina(resposta.html);
    if (codigos.length === 0) {
      relatorio.semCheckout.push({ id: p.id, endereco });
      console.log(posicao + '  sem checkout  ' + p.id);
      continue;
    }

    const precos = precoNaPagina(resposta.html);
    const doCatalogo = p.precos.cheio;
    // a página lista o preço em mais de um lugar (caixa de compra, produtos
    // relacionados); basta que UM deles seja o preço que o site anuncia
    const precoBate = precos.includes(doCatalogo);

    const checkout = 'https://chk.eduzz.com/' + codigos[0];
    const registro = { id: p.id, nome: p.nome, checkout, doCatalogo, naLoja: precos, endereco };

    if (!precoBate) {
      relatorio.precoDivergente.push(registro);
      console.log(
        posicao + '  PRECO DIFERE  ' + p.id +
        '  (catalogo ' + doCatalogo + ', loja ' + (precos.join('/') || 'nenhum') + ')',
      );
      continue;
    }

    // mais de um checkout na página costuma ser order bump ou upgrade; o mais
    // repetido é o botão principal, mas vale registrar para conferência
    relatorio.confirmados.push({ ...registro, outrosCodigos: codigos.slice(1) });
    console.log(posicao + '  ok            ' + p.id + '  -> ' + codigos[0]);
  }

  /**
   * Conferência independente, do outro lado: o título da página do checkout na
   * Eduzz é o nome do produto lá cadastrado. Se ele não parece com o nome que o
   * site anuncia, o link é de outro item, por mais que o preço tenha batido.
   *
   * Compara só as palavras que importam, porque os dois nomes quase nunca são
   * idênticos: a loja escreve "Resumo Legislação Aduaneira (Receita Federal)" e
   * a planilha, "Resumo Legislação Aduaneira Receita Federal".
   */
  console.log('\nconferindo o nome do produto na Eduzz...');
  const reprovadosNaEduzz = [];
  for (const c of relatorio.confirmados) {
    let titulo = '';
    try {
      const html = await (await fetch(c.checkout, { redirect: 'follow' })).text();
      titulo = (html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '').trim();
    } catch {
      titulo = '';
    }
    c.tituloNaEduzz = titulo;
    const parecido = titulo && semelhanca(c.nome, titulo) >= 0.6;
    if (!parecido) {
      reprovadosNaEduzz.push(c);
      console.log('  NOME NAO BATE  ' + c.id + '  <>  "' + titulo + '"');
    }
  }
  for (const c of reprovadosNaEduzz) {
    relatorio.confirmados.splice(relatorio.confirmados.indexOf(c), 1);
    relatorio.nomeDivergente.push(c);
  }

  /**
   * Último freio: checkout que dois produtos reivindicam não serve para nenhum
   * dos dois. Ou a leitura pegou o link errado, ou os produtos são o mesmo item
   * cadastrado duas vezes. Nos dois casos quem decide é uma pessoa.
   */
  const donos = new Map();
  for (const c of relatorio.confirmados) {
    if (!donos.has(c.checkout)) donos.set(c.checkout, []);
    donos.get(c.checkout).push(c);
  }
  for (const [checkout, lista] of donos) {
    if (lista.length === 1) continue;
    for (const c of lista) {
      relatorio.confirmados.splice(relatorio.confirmados.indexOf(c), 1);
      relatorio.checkoutRepetido.push({ ...c, disputadoCom: lista.filter((o) => o !== c).map((o) => o.id) });
    }
    console.log('checkout repetido, nenhum aplicado: ' + checkout + ' (' + lista.map((o) => o.id).join(', ') + ')');
  }

  console.log('\n--- RESUMO ---');
  console.log('confirmados (preço bate): ' + relatorio.confirmados.length);
  console.log('preço divergente        : ' + relatorio.precoDivergente.length);
  console.log('nome não bate na Eduzz  : ' + relatorio.nomeDivergente.length);
  console.log('checkout repetido       : ' + relatorio.checkoutRepetido.length);
  console.log('página sem checkout     : ' + relatorio.semCheckout.length);
  console.log('saiu da loja (redirect) : ' + relatorio.saiuDaLoja.length);
  console.log('página fora do ar       : ' + relatorio.paginaFora.length);

  const saida = path.join(__dirname, 'dados', 'conferencia-checkouts.json');
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, JSON.stringify(relatorio, null, 2) + '\n', 'utf8');
  console.log('\nrelatório completo em scripts/dados/conferencia-checkouts.json');

  if (!GRAVAR) {
    console.log('nada foi gravado. rode de novo com --gravar para aplicar os confirmados.');
    return;
  }

  for (const c of relatorio.confirmados) manuais.checkouts[c.id] = c.checkout;
  fs.writeFileSync(ARQUIVO_MANUAIS, JSON.stringify(manuais, null, 2) + '\n', 'utf8');
  console.log('gravados ' + relatorio.confirmados.length + ' checkouts em checkouts-manuais.json');
}

main();
