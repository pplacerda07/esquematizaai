/**
 * Uniformiza os prints de reviews (pasta "reviews" na raiz do workspace) em
 * cards padronizados 720x560 (fundo branco, print centrada sem cortar texto)
 * e grava em public/reviews/review-N.webp.
 *
 * Uso:  node scripts/build-reviews.js
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', '..', 'reviews');
const OUT = path.join(__dirname, '..', 'public', 'reviews');

const W = 720, H = 560, MARGEM = 24;

// ordem de exibição + tratamento especial por arquivo
const REVIEWS = [
  // cropTop corta o cabeçalho do WhatsApp com nome/telefone da cliente (privacidade/LGPD)
  { file: 'Captura de tela 2026-07-13 095406.png', out: 'review-1' },
  { file: 'Captura de tela 2026-07-13 095425.png', out: 'review-2' },
  { file: 'Captura de tela 2026-07-13 095451.png', out: 'review-3', cropTop: 38 },
  { file: 'Captura de tela 2026-07-13 095512.png', out: 'review-4' },
  { file: 'Captura de tela 2026-07-13 095502.png', out: 'review-5' },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const r of REVIEWS) {
    const origem = path.join(SRC, r.file);
    let img = sharp(origem).flatten({ background: '#ffffff' });
    if (r.cropTop) {
      const meta = await img.metadata();
      img = img.extract({ left: 0, top: r.cropTop, width: meta.width, height: meta.height - r.cropTop });
    }
    const buf = await img
      .resize(W - MARGEM * 2, H - MARGEM * 2, { fit: 'inside', withoutEnlargement: false })
      .toBuffer();
    const info = await sharp({
      create: { width: W, height: H, channels: 3, background: '#ffffff' },
    })
      .composite([{ input: buf, gravity: 'center' }])
      .webp({ quality: 82 })
      .toFile(path.join(OUT, `${r.out}.webp`));
    console.log(`${r.out}.webp: ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB  <- ${r.file}${r.cropTop ? ' (header cortado)' : ''}`);
  }
})();
