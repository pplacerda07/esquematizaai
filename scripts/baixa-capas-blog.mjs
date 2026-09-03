/**
 * Baixa as capas dos artigos importados do WordPress para dentro do projeto.
 *
 * Por que não apontar direto para esquematizaai.com: o next.config só libera
 * imagem remota do Supabase (remotePatterns), então uma capa hospedada no site
 * antigo simplesmente não renderiza. E mesmo que liberasse, o blog novo ficaria
 * dependendo do WordPress continuar no ar para ter ilustração.
 *
 * Converte para WebP porque os originais são PNG de blog, pesados à toa.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORIGEM = process.argv[2];
const DESTINO = path.join(process.cwd(), 'public', 'blog');

if (!ORIGEM) {
  console.error('uso: node scripts/baixa-capas-blog.mjs <artigos-convertidos.json>');
  process.exit(1);
}

const artigos = JSON.parse(fs.readFileSync(ORIGEM, 'utf8'));
fs.mkdirSync(DESTINO, { recursive: true });

let baixadas = 0;
let puladas = 0;
const falhas = [];
let bytesAntes = 0;
let bytesDepois = 0;

for (const a of artigos) {
  if (!a.capa_origem) { puladas += 1; continue; }

  const nome = `${a.slug}.webp`;
  const destino = path.join(DESTINO, nome);
  a.capa_url = `/blog/${nome}`;

  if (fs.existsSync(destino)) { baixadas += 1; bytesDepois += fs.statSync(destino).size; continue; }

  let bruto;
  try {
    const r = await fetch(a.capa_origem);
    if (!r.ok) { falhas.push(`${a.slug}: HTTP ${r.status}`); a.capa_url = null; continue; }
    bruto = Buffer.from(await r.arrayBuffer());
    bytesAntes += bruto.length;
  } catch (e) {
    falhas.push(`${a.slug}: download falhou (${e.message})`);
    a.capa_url = null;
    continue;
  }

  try {
    const saida = await sharp(bruto)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    fs.writeFileSync(destino, saida);
    bytesDepois += saida.length;
    baixadas += 1;
    console.log(`  ${nome}  ${(bruto.length / 1024).toFixed(0)}kB -> ${(saida.length / 1024).toFixed(0)}kB`);
  } catch (e) {
    // Um dos PNGs do WordPress é válido (assinatura e IEND corretos) mas o
    // libspng do sharp recusa. Guardo o arquivo original em vez de ficar sem
    // capa: o peso é irrelevante e a imagem é a mesma.
    const ext = path.extname(new URL(a.capa_origem).pathname) || '.png';
    const nomeBruto = `${a.slug}${ext}`;
    fs.writeFileSync(path.join(DESTINO, nomeBruto), bruto);
    a.capa_url = `/blog/${nomeBruto}`;
    bytesDepois += bruto.length;
    baixadas += 1;
    console.log(`  ${nomeBruto}  ${(bruto.length / 1024).toFixed(0)}kB (original; sharp recusou: ${e.message.slice(0, 40)})`);
  }
}

fs.writeFileSync(ORIGEM, JSON.stringify(artigos, null, 2), 'utf8');

console.log('');
console.log('capas baixadas :', baixadas);
console.log('sem capa no WP :', puladas);
console.log('falhas         :', falhas.length);
falhas.forEach((f) => console.log('  ' + f));
if (bytesAntes) {
  console.log(`peso: ${(bytesAntes / 1024 / 1024).toFixed(1)}MB -> ${(bytesDepois / 1024 / 1024).toFixed(1)}MB`);
}
