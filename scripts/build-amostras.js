/**
 * Copia as amostras grátis dos resumos para /public/amostras e gera o índice
 * src/data/catalogo/amostras.json que a página do produto consome.
 *
 * Uso:  node scripts/build-amostras.js
 *
 * POR QUE O MAPA É ESCRITO À MÃO:
 * as amostras vêm organizadas por DISCIPLINA e o catálogo é por PRODUTO, então
 * não existe casamento automático confiável. Testado: o casamento por nome
 * colocou a amostra de "Direito Civil" no produto "Direito Processual Civil"
 * (matérias diferentes) e ao mesmo tempo deixou de fora abreviações óbvias
 * como AFO, LRF e LTM. Mapa na mão é mais lento de escrever e não erra.
 *
 * Produto sem entrada aqui simplesmente não mostra o botão de amostra, que é o
 * comportamento certo: botão que promete amostra e entrega o arquivo errado é
 * pior do que não ter botão.
 */
const fs = require('fs');
const path = require('path');

const ORIGEM = path.join(
  __dirname, '..', '..', 'amostras',
  'Amostra Materiais Esquematiza Aí-20260729T171025Z-1-001',
  'Amostra Materiais Esquematiza Aí', 'Amostra RESUMOS',
);
const DESTINO = path.join(__dirname, '..', 'public', 'amostras');
const INDICE = path.join(__dirname, '..', 'src', 'data', 'catalogo', 'amostras.json');

/** produtoId -> arquivo na pasta de amostras */
const MAPA = {
  'resumo-isoladas-administracao-financeira-e-orcamentaria-afo': 'amostra-afo.pdf',
  'resumo-administracao-geral': 'amostra_administraçao-geral[resumo].pdf',
  'resumo-auditoria-fiscal-eletronica': 'amostra_auditoria-fiscal-[resumo].pdf',
  'resumo-isolada-auditoria-governamental': 'amostra-auditoria-governamental.pdf',
  'resumo-isolada-contabilidade-geral-e-avancada': 'amostra-contabilidade-geral-avancada.pdf',
  'resumo-isolada-contabilidade-publica-casp': 'amostra-contabilidade-publica.pdf',
  'resumo-isolada-direito-administrativo': 'amostra-direito-administrativo.pdf',
  'resumo-isoladas-direito-civil': 'amostra-direito-civil.pdf',
  'resumo-isolada-direito-constitucional': 'amostra-direito-constitucional.pdf',
  'resumo-isoladas-direito-penal': 'amostra-direito-penal.pdf',
  'resumo-estatistica': 'amostra-estatistica.pdf',
  'resumo-de-licitacoes-e-contratos-lei-14-133-2021': 'amostra-lei-n141332021.pdf',
  'resumo-isoladas-lingua-portuguesa': 'amostra_lingua-portuguesa-[resumo-v.4].pdf',
  'resumo-legislacao-tributaria-municipal-geral': 'amostra_ltm-geral.pdf',
  'resumo-de-matematica-basica': 'amostra-matematica-basica.pdf',
  'resumo-isolada-matematica-financeira': 'amostra-matematica-financeira.pdf',
  'resumo-isolada-raciocinio-logico': 'amostra-raciocinio-logico.pdf',
  'resumo-de-lei-de-responsabilidade-fiscal-lrf': 'amostra-responsabilidade-fiscal.pdf',

  // PENDENTE de decisão do cliente (mais de um arquivo candidato):
  //   resumo-de-economia          -> macroeconomia | microeconomia | financas-publicas
  //   resumo-isolada-reforma-tributaria -> ec-n132-2023 | lc-n2142025
};

const produtos = require(path.join(__dirname, '..', 'src', 'data', 'catalogo', 'produtos.json')).produtos;
const porId = new Map(produtos.map((p) => [p.id, p]));

fs.mkdirSync(DESTINO, { recursive: true });

const amostras = {};
const problemas = [];
let bytes = 0;

for (const [produtoId, arquivo] of Object.entries(MAPA)) {
  const produto = porId.get(produtoId);
  if (!produto) {
    problemas.push(`produto "${produtoId}" não existe mais no catálogo`);
    continue;
  }

  const origem = path.join(ORIGEM, arquivo);
  if (!fs.existsSync(origem)) {
    problemas.push(`arquivo "${arquivo}" não encontrado na pasta de amostras`);
    continue;
  }

  // nome de saída pelo id do produto: previsível e sem acento nem colchete
  const destino = path.join(DESTINO, `${produtoId}.pdf`);
  fs.copyFileSync(origem, destino);

  const tamanho = fs.statSync(destino).size;
  bytes += tamanho;
  amostras[produtoId] = {
    src: `/amostras/${produtoId}.pdf`,
    kb: Math.round(tamanho / 1024),
  };
}

fs.writeFileSync(
  INDICE,
  JSON.stringify(
    { geradoEm: new Date().toISOString().slice(0, 10), fonte: 'amostras/Amostra Materiais Esquematiza Aí', amostras },
    null, 1,
  ),
  'utf8',
);

const resumos = produtos.filter((p) => /^Resumo/i.test(p.nome)).length;
console.log(`amostras copiadas: ${Object.keys(amostras).length} (${Math.round(bytes / 1024 / 1024)} MB)`);
console.log(`resumos no catálogo: ${resumos} | sem amostra: ${resumos - Object.keys(amostras).length}`);
console.log(`índice: ${INDICE}`);
if (problemas.length) {
  console.log('\nPROBLEMAS:');
  problemas.forEach((p) => console.log('  ', p));
}
