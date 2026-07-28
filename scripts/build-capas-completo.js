/**
 * Baixa as capas dos produtos a partir das URLs da planilha e gera WebP otimizado
 * em /public/capas, mais o índice src/data/catalogo/capas.json que a UI consome.
 *
 * Uso:  node scripts/build-capas-completo.js [--perfil]
 *       --perfil  só baixa e relata as dimensões, sem gravar nada
 *
 * POR QUE ESTE SCRIPT EXISTE (e substitui o build-capas.js antigo):
 * antes, as capas vinham de uma pasta com ~490 arquivos de nome sem sentido
 * ("1 (1).png"), e o mapa produto->arquivo teve que ser montado à mão, olhando
 * imagem por imagem. A planilha nova traz a URL da capa de cada produto, então o
 * mapeamento deixou de ser adivinhação.
 *
 * As imagens ficam locais de propósito: o site não depende do WordPress no ar
 * para renderizar o catálogo, e o peso cai de ~1 MB por capa para dezenas de KB.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR_CATALOGO = path.join(__dirname, '..', 'src', 'data', 'catalogo');
const OUT_IMG = path.join(__dirname, '..', 'public', 'capas');
const SO_PERFIL = process.argv.includes('--perfil');

// 3:4 é a proporção que os cards do site já reservam (aspect-ratio: 3/4).
const LARGURA = 452;
const ALTURA = 640;

const produtos = require(path.join(DIR_CATALOGO, 'produtos.json')).produtos;

async function baixar(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EsquematizaBuild/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

(async () => {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  const capas = {};
  const perfil = [];
  const falhas = [];
  let bytesEntrada = 0;
  let bytesSaida = 0;

  for (const p of produtos) {
    const url = p.capaOrigem?.url;
    if (!url) {
      falhas.push({ id: p.id, motivo: 'sem URL de capa na planilha' });
      continue;
    }

    try {
      const bin = await baixar(url);
      bytesEntrada += bin.length;
      const meta = await sharp(bin).metadata();
      perfil.push({ id: p.id, w: meta.width, h: meta.height, r: +(meta.width / meta.height).toFixed(2), kb: Math.round(bin.length / 1024) });

      if (SO_PERFIL) continue;

      const destino = path.join(OUT_IMG, `${p.id}.webp`);
      const info = await sharp(bin)
        // "contain" e não "cover": as capas vêm em proporções diferentes (mockup
        // quadrado, arte 3:4, print de PDF). Cortar decepa título de capa.
        .resize(LARGURA, ALTURA, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .webp({ quality: 82 })
        .toFile(destino);

      bytesSaida += info.size;
      capas[p.id] = { src: `/capas/${p.id}.webp`, width: LARGURA, height: ALTURA };
    } catch (e) {
      falhas.push({ id: p.id, motivo: e.message, url });
    }
  }

  if (SO_PERFIL) {
    const razoes = {};
    for (const x of perfil) {
      const faixa = x.r < 0.85 ? 'retrato (<0.85)' : x.r > 1.15 ? 'paisagem (>1.15)' : 'quadrado (~1)';
      razoes[faixa] = (razoes[faixa] || 0) + 1;
    }
    console.log('PERFIL DAS CAPAS');
    console.log('  baixadas:', perfil.length, '| falhas:', falhas.length);
    console.log('  proporções:', razoes);
    console.log('  peso original total:', Math.round(bytesEntrada / 1024 / 1024), 'MB');
    const larguras = perfil.map((x) => x.w).sort((a, b) => a - b);
    console.log('  largura min/mediana/max:', larguras[0], larguras[Math.floor(larguras.length / 2)], larguras[larguras.length - 1]);
    console.log('\n  exemplos:', perfil.slice(0, 6));
    if (falhas.length) console.log('\n  falhas:', falhas);
    return;
  }

  fs.writeFileSync(
    path.join(DIR_CATALOGO, 'capas.json'),
    JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), fonte: 'Catalogo_Completo_Esquematiza.xlsx (coluna URL da capa)', capas }, null, 1),
    'utf8',
  );

  console.log(`capas geradas: ${Object.keys(capas).length}/${produtos.length}`);
  console.log(`peso: ${Math.round(bytesEntrada / 1024 / 1024)} MB -> ${Math.round(bytesSaida / 1024)} KB`);
  if (falhas.length) {
    console.log(`\nfalhas (${falhas.length}):`);
    falhas.forEach((f) => console.log('  ', f.id, '|', f.motivo));
  }
})();
