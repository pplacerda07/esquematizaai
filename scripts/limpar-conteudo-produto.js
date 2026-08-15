/**
 * Limpa o conteúdo de produto que veio da raspagem do WordPress.
 *
 * Uso:  node scripts/limpar-conteudo-produto.js
 *
 * Roda quantas vezes quiser: só age no que ainda está sujo.
 *
 * O QUE A RASPAGEM DEIXOU PARA TRÁS, e por que cada regra existe:
 *
 * 1. FRAGMENTO DE HTML NO FIM (1.071 das 1.177 respostas)
 *    Cada resposta terminava com o começo da <div> da PERGUNTA SEGUINTE, sem
 *    nem fechar a tag:
 *      ...no e-mail informado.
 *      <div id="poderei-fazer-download-e-imprimir" class="elementor-tab-title
 *    Aparecia como texto na tela porque o Markdown não tem o que fazer com uma
 *    tag pela metade.
 *
 * 2. O RODAPÉ DO SITE INTEIRO NA ÚLTIMA RESPOSTA (nos 107 produtos)
 *    Depois de "Edit Template" vinha o copyright, o aviso sobre o Facebook e o
 *    FAQ repetido. Tudo isso estava sendo exibido como se fosse a resposta de
 *    "Por quanto tempo terei acesso ao material?".
 *
 * 3. O PREFIXO "Resposta:" (107 vezes)
 *    Sobra da estrutura do WordPress. A pergunta já está no título do bloco.
 *
 * 4. WHATSAPP ANTIGO (107 vezes)
 *    O FAQ mandava procurar (12) 9 9615-2509. O número da casa hoje é o que
 *    está em WHATSAPP_NUMERO, src/config.ts. Cliente com dúvida antes de
 *    comprar mandando mensagem para número errado é venda perdida em silêncio.
 *
 * 5. O MESMO FRAGMENTO NO CAMPO "detalhes" (12 produtos)
 *    Terminavam com a <div> do bloco de sumário, pela metade igual ao item 1.
 *    Por isso a limpeza roda nos campos de texto e não só no FAQ.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ARQUIVO = path.join(RAIZ, 'src/data/catalogo/conteudo-produto.json');

// Onde a resposta deixa de ser resposta. O primeiro que aparecer manda.
const FIM_DA_RESPOSTA = /(<div|<\/div|Edit Template|Todos os Direitos Reservados)/i;

const WHATSAPP_ANTIGO = /\(?12\)?\s*9?\s*9615[-\s]?2509/g;
// mesmo número de WHATSAPP_NUMERO em src/config.ts, escrito para leitura humana
const WHATSAPP_ATUAL = '(11) 5286-5954';

/**
 * Trechos do "sobre" que o Sérgio pediu para sair.
 *
 * CONTEÚDO ABORDADO repetia, palavra por palavra, a lista de disciplinas que já
 * aparece em "Detalhes do produto" logo abaixo. "Em dúvida entre assinar" e
 * "Produtos relacionados" eram links de navegação do WordPress: na página nova
 * a pessoa já veio da vitrine e tem a barra de compra fixa do lado.
 */
const FIM_DO_SOBRE = /(\*\*CONTEÚDO ABORDADO|CONTEÚDO ABORDADO:|Em dúvida entre|Produtos relacionados)/i;

/**
 * Cronograma que só anuncia que o material está pronto não é cronograma: é uma
 * seção inteira, com título, para dizer "já pode baixar". A página de produto
 * deixa de mostrá-la nesses casos.
 *
 * Fica quem tem informação de verdade: data de entrega, material em elaboração,
 * lista do que está incluso, avisos.
 */
function cronogramaSoDizQueEstaPronto(texto) {
  const limpo = texto
    .replace(/[✅⏳🗓️*_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (limpo.length > 90) return false;
  if (/\d{2}\/\d{2}\/\d{4}|previsão|elaboração dos|atenção|após|edital/i.test(limpo)) return false;

  return /(finalizad|conclu[ií]|dispon[ií]vel para download|100%)/i.test(limpo);
}

/** Em Markdown, uma quebra só junta as linhas num parágrafo. Duas separam. */
function separarLinhasDeCheck(texto) {
  return texto.replace(/([^\n])\n(?=✅)/g, '$1\n\n');
}

function limparResposta(texto) {
  if (!texto) return texto;
  let saida = texto;

  const corte = saida.search(FIM_DA_RESPOSTA);
  if (corte >= 0) saida = saida.slice(0, corte);

  saida = saida
    .replace(/^\s*Resposta:\s*/i, '')
    .replace(WHATSAPP_ANTIGO, WHATSAPP_ATUAL)
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return saida;
}

function main() {
  const bruto = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
  const mapa = bruto.conteudo || bruto;

  let perguntas = 0;
  let alteradas = 0;
  let removidasPorFicarVazias = 0;
  let telefonesTrocados = 0;
  let caracteresRemovidos = 0;
  let camposDeTextoLimpos = 0;
  let sobreCortado = 0;
  let checksSeparados = 0;
  let cronogramasVazios = 0;

  // os campos de texto sofrem do mesmo mal do FAQ, então passam pela mesma regra
  const CAMPOS_DE_TEXTO = ['sobre', 'detalhes', 'sumario', 'cronograma', 'detalhesTitulo'];

  for (const dados of Object.values(mapa)) {
    // --- pedidos do Sérgio, antes da limpeza geral ---

    if (dados.sobre) {
      const corte = dados.sobre.search(FIM_DO_SOBRE);
      if (corte > 0) {
        dados.sobre = dados.sobre.slice(0, corte).trim();
        sobreCortado++;
      }

      const separado = separarLinhasDeCheck(dados.sobre);
      if (separado !== dados.sobre) {
        dados.sobre = separado;
        checksSeparados++;
      }
    }

    if (dados.cronograma && cronogramaSoDizQueEstaPronto(dados.cronograma)) {
      delete dados.cronograma;
      cronogramasVazios++;
    }

    for (const campo of CAMPOS_DE_TEXTO) {
      if (typeof dados[campo] !== 'string' || !dados[campo]) continue;
      const antes = dados[campo];
      const depois = limparResposta(antes);
      if (depois === antes) continue;

      camposDeTextoLimpos++;
      caracteresRemovidos += antes.length - depois.length;
      if (depois) dados[campo] = depois;
      else delete dados[campo];
    }

    if (!Array.isArray(dados.faq) || !dados.faq.length) continue;

    const mantidas = [];
    for (const item of dados.faq) {
      perguntas++;
      const antes = item.resposta ?? '';
      const depois = limparResposta(antes);

      if (WHATSAPP_ANTIGO.test(antes)) telefonesTrocados++;
      WHATSAPP_ANTIGO.lastIndex = 0; // regex global guarda posição entre chamadas

      if (depois !== antes) {
        alteradas++;
        caracteresRemovidos += antes.length - depois.length;
      }

      // resposta que virou nada não ajuda ninguém: melhor a pergunta sumir do
      // que abrir um bloco vazio na página
      if (!depois) {
        removidasPorFicarVazias++;
        continue;
      }

      item.resposta = depois;
      mantidas.push(item);
    }

    dados.faq = mantidas;
    if (!dados.faq.length) delete dados.faq;
  }

  fs.writeFileSync(ARQUIVO, JSON.stringify(bruto, null, 2) + '\n', 'utf8');

  console.log('"sobre" cortados           :', sobreCortado, '(conteúdo abordado, em dúvida entre, relacionados)');
  console.log('listas de ✅ separadas      :', checksSeparados);
  console.log('cronogramas removidos      :', cronogramasVazios, '(só diziam que o material está pronto)');
  console.log('campos de texto limpos     :', camposDeTextoLimpos);
  console.log('perguntas analisadas       :', perguntas);
  console.log('respostas alteradas        :', alteradas);
  console.log('perguntas removidas (vazias):', removidasPorFicarVazias);
  console.log('telefones antigos trocados :', telefonesTrocados);
  console.log('caracteres removidos       :', caracteresRemovidos.toLocaleString('pt-BR'));
}

main();
