/**
 * Otimiza as imagens de amostra do material (páginas de resumo e cartões do
 * Anki) e gera o índice que a galeria da página do produto consome.
 *
 * Uso:  node scripts/build-amostras-visuais.js
 *
 * As fontes ficam em site/amostras-produto (fora de public, para o PNG pesado
 * não ser servido). Os nomes originais são "9.png" e
 * "Captura de tela 2026-07-07 141700.png": sem sentido para quem lê o código e,
 * no segundo caso, com espaço e acento na URL. Aqui viram nomes previsíveis.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ORIGEM = path.join(__dirname, '..', 'amostras-produto');
const DESTINO = path.join(__dirname, '..', 'public', 'amostras-produto');
const INDICE = path.join(__dirname, '..', 'src', 'data', 'amostras-visuais.json');

/** Arquivos numerados são páginas de resumo; "Captura de tela" são flashcards. */
const ehFlashcard = (nome) => /^captura de tela/i.test(nome);

(async () => {
  fs.mkdirSync(DESTINO, { recursive: true });

  const arquivos = fs
    .readdirSync(ORIGEM)
    .filter((f) => /\.(png|jpe?g)$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return a.localeCompare(b, 'pt-BR');
    });

  const resumos = [];
  const flashcards = [];
  let bytesEntrada = 0;
  let bytesSaida = 0;

  for (const arquivo of arquivos) {
    const flash = ehFlashcard(arquivo);
    const lista = flash ? flashcards : resumos;
    const nome = `${flash ? 'flashcard' : 'resumo'}-${lista.length + 1}.webp`;
    const origem = path.join(ORIGEM, arquivo);

    bytesEntrada += fs.statSync(origem).size;
    const info = await sharp(origem)
      // 900px de largura: mais que isso ninguém enxerga numa galeria
      .resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(DESTINO, nome));
    bytesSaida += info.size;

    lista.push({ src: `/amostras-produto/${nome}`, width: info.width, height: info.height });
  }

  fs.writeFileSync(
    INDICE,
    JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), resumos, flashcards }, null, 1),
    'utf8',
  );

  // os PNG antigos ficavam servidos junto e ninguém mais aponta para eles
  for (const f of fs.readdirSync(DESTINO)) {
    if (/\.(png|jpe?g)$/i.test(f)) fs.unlinkSync(path.join(DESTINO, f));
  }

  console.log(`páginas de resumo: ${resumos.length} | cartões de flashcard: ${flashcards.length}`);
  console.log(`peso: ${Math.round(bytesEntrada / 1024)} KB -> ${Math.round(bytesSaida / 1024)} KB`);
  console.log(`índice: ${INDICE}`);
})();
