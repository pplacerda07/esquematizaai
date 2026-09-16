/**
 * Põe no site a arte de capa que o Sérgio mandou.
 *
 *   node scripts/adiciona-capa.js <arquivo> <id-do-produto>
 *
 * Exemplo:
 *   node scripts/adiciona-capa.js ~/Downloads/legislativo.png combo-resumo-area-legislativa-regular
 *
 * O arquivo que chega vem do Canva ou do WhatsApp, grande e com margem branca
 * em volta do cartão. Aqui ele passa pelo mesmo tratamento das outras 151 capas:
 * a margem é aparada, a largura vai para 452 (que é o tamanho que a vitrine
 * pede) e o formato vira webp, que é o que deixa a página leve.
 *
 * O id do produto NÃO é adivinhado: tem que existir no catálogo, senão a capa
 * fica no disco sem nunca aparecer na tela, que é o tipo de silêncio que já
 * aconteceu aqui. Se errar o id, o script diz quais existem parecidos.
 *
 * O índice src/data/catalogo/capas.json é atualizado junto, com a altura real
 * que saiu do processamento. Sem largura e altura o Next não reserva o espaço
 * e a página pula enquanto carrega.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'src', 'data', 'catalogo');
const CAPAS = path.join(__dirname, '..', 'public', 'capas');
const INDICE = path.join(DIR, 'capas.json');
const LARGURA = 452;

const [arquivo, id] = process.argv.slice(2);

if (!arquivo || !id) {
  console.error('uso: node scripts/adiciona-capa.js <arquivo> <id-do-produto>');
  process.exit(1);
}

const produtos = JSON.parse(fs.readFileSync(path.join(DIR, 'produtos.json'), 'utf8')).produtos;
const produto = produtos.find((p) => p.id === id);

if (!produto) {
  console.error('não existe produto com o id "' + id + '".');
  const pedacos = id.split('-').filter((w) => w.length >= 4);
  const parecidos = produtos
    .filter((p) => pedacos.some((w) => p.id.includes(w)))
    .slice(0, 8)
    .map((p) => '  ' + p.id.padEnd(48) + p.nome);
  if (parecidos.length) {
    console.error('\nquis dizer algum destes?');
    console.error(parecidos.join('\n'));
  }
  process.exit(1);
}

if (!fs.existsSync(arquivo)) {
  console.error('arquivo não encontrado: ' + arquivo);
  process.exit(1);
}

async function main() {
  const saida = path.join(CAPAS, id + '.webp');
  const jaExistia = fs.existsSync(saida);

  // lê para a memória antes de processar, em vez de deixar o sharp abrir o
  // arquivo: assim dá para apontar o script para a própria capa que ele gerou,
  // quando se quer só refazer o índice. Capa tem dezenas de kB, cabe de sobra.
  const entrada = fs.readFileSync(arquivo);
  const info = await sharp(entrada)
    // threshold 10 e não 0: o fundo do Canva não é branco puro, e com tolerância
    // zero a margem fica e o cartão entra na vitrine nadando no meio do quadro
    .trim({ threshold: 10 })
    .resize({ width: LARGURA, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(saida);

  const indice = JSON.parse(fs.readFileSync(INDICE, 'utf8'));
  const capas = indice.capas ?? indice;
  capas[id] = { src: '/capas/' + id + '.webp', width: info.width, height: info.height };

  // a chave nova entra no fim e o resto do arquivo não se mexe: reordenar aqui
  // trocaria de lugar as 151 entradas e esconderia a única linha que importa
  fs.writeFileSync(INDICE, JSON.stringify(indice, null, 2) + '\n', 'utf8');

  console.log((jaExistia ? 'substituída' : 'criada') + ': public/capas/' + id + '.webp');
  console.log('  ' + info.width + 'x' + info.height + ', ' + Math.round(info.size / 1024) + ' kB');
  console.log('  produto: ' + produto.nome);
  console.log('  confira em /vitrine/produto/' + id);
}

main();
