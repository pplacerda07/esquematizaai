/**
 * Busca a capa dos produtos que estão sem, na biblioteca de mídia do WordPress.
 *
 * Uso:  node scripts/build-capas-da-midia-wp.js [--ensaio]
 *       --ensaio  só relata o que encontraria, sem gravar nada
 *
 * POR QUE ESTE SCRIPT EXISTE, e por que o build-capas-faltantes.js não bastou.
 *
 * Aquele script lê o `og:image` da página de vendas, e para 30 produtos ele
 * voltava com o logo genérico do site. A conclusão fácil seria "não existe
 * arte". Existe: as capas foram subidas no WordPress como **PDF**
 * ("Capas-em-PDF-1080-x-1440-px-23.pdf"), e o WordPress não usa PDF como
 * og:image, então a página cai no logo padrão.
 *
 * O que o WordPress faz é gerar um JPEG de pré-visualização do PDF. É esse
 * JPEG que este script usa, chegando nele pela imagem destacada do produto:
 *
 *   urlSite do catálogo  ->  slug do WordPress
 *   /wp/v2/product?slug  ->  featured_media
 *   /wp/v2/media/<id>    ->  o JPEG gerado do PDF (ou a imagem, quando é imagem)
 *
 * O CAMINHO É EXATO, e isso importa. Casar produto com imagem pelo nome do
 * arquivo seria adivinhação: a biblioteca tem 1849 itens com nomes como
 * "Capas-em-PDF-1080-x-1440-px-21.pdf", e neste projeto já houve caso de
 * "SEFAZ-GO" casar com "SEFAZ-SP" por semelhança de nome. Aqui o vínculo vem do
 * próprio cadastro do produto.
 *
 * A margem branca da página do PDF é aparada antes de gravar, senão a capa
 * entra na vitrine com uma moldura clara que as outras não têm.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const API = 'https://loja.esquematizaai.com/wp-json/wp/v2';
const DIR = path.join(__dirname, '..', 'src', 'data', 'catalogo');
const CAPAS = path.join(__dirname, '..', 'public', 'capas');
const INDICE = path.join(DIR, 'capas.json');
const ENSAIO = process.argv.includes('--ensaio');

const LARGURA = 452;
const UA = { 'User-Agent': 'EsquematizaBuild/1.0' };

/** Imagem que não é capa de produto: logo, banner, selo do site. */
function pareceGenerica(arquivo) {
  return /logo|marca|favicon|banner|selo|placeholder|default/i.test(arquivo);
}

async function json(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) return null;
  return r.json();
}

(async () => {
  const produtos = require(path.join(DIR, 'produtos.json')).produtos;
  const indice = JSON.parse(fs.readFileSync(INDICE, 'utf8'));
  const capas = indice.capas ?? indice;

  const vendaveis = produtos.filter(
    (p) =>
      p.categoria !== 'oferta-personalizada' &&
      String(p.status || '').toLowerCase() !== 'inativo' &&
      p.precos?.cheio != null,
  );
  const faltando = vendaveis.filter((p) => !capas[p.id] && p.urlSite);
  const semPagina = vendaveis.filter((p) => !capas[p.id] && !p.urlSite);

  console.log(`vendáveis: ${vendaveis.length} | sem capa: ${vendaveis.length - Object.keys(capas).filter((k) => vendaveis.some((v) => v.id === k)).length}`);
  console.log(`vou tentar: ${faltando.length}${semPagina.length ? ` (${semPagina.length} sem página de vendas, impossível)` : ''}`);
  console.log(ENSAIO ? 'MODO ENSAIO: nada será gravado\n' : '');

  const achou = [];
  const falhou = [];

  for (const p of faltando) {
    const slug = (p.urlSite.match(/\/produto\/([^/]+)/) || [])[1];
    if (!slug) {
      falhou.push([p.nome, 'urlSite sem slug de produto']);
      continue;
    }

    const prod = await json(`${API}/product?slug=${encodeURIComponent(slug)}&_fields=featured_media`);
    const idMidia = prod?.[0]?.featured_media;
    if (!idMidia) {
      falhou.push([p.nome, prod && prod.length === 0 ? 'produto não existe no WordPress' : 'sem imagem destacada']);
      continue;
    }

    const midia = await json(`${API}/media/${idMidia}?_fields=source_url,mime_type,media_details`);
    if (!midia) {
      falhou.push([p.nome, 'mídia não encontrada']);
      continue;
    }

    /**
     * PDF: usar o JPEG que o WordPress gerou da primeira página.
     *
     * Ele fica em media_details.sizes, e NÃO em media_details.file: para PDF o
     * `file` do topo aponta para o próprio PDF. A maior versão é a `full`; as
     * outras (724x1024, 212x300) servem de reserva quando ela não existe.
     */
    let url = midia.source_url;
    if (midia.mime_type === 'application/pdf') {
      const tamanhos = midia.media_details?.sizes ?? {};
      const melhor =
        tamanhos.full ??
        Object.values(tamanhos).sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
      if (!melhor?.source_url) {
        falhou.push([p.nome, 'PDF sem pré-visualização gerada']);
        continue;
      }
      url = melhor.source_url;
    }

    const nomeArquivo = url.split('/').pop();
    if (pareceGenerica(nomeArquivo)) {
      falhou.push([p.nome, `imagem genérica do site (${nomeArquivo})`]);
      continue;
    }

    if (ENSAIO) {
      achou.push([p.nome, nomeArquivo, '(ensaio)']);
      continue;
    }

    const resp = await fetch(url, { headers: UA });
    if (!resp.ok) {
      falhou.push([p.nome, `imagem HTTP ${resp.status}`]);
      continue;
    }
    const buf = Buffer.from(await resp.arrayBuffer());

    // trim tira a margem branca da página do PDF; sem isso a capa entra na
    // vitrine com moldura clara que as outras não têm
    const saida = path.join(CAPAS, `${p.id}.webp`);
    const info = await sharp(buf)
      .trim({ threshold: 10 })
      .resize({ width: LARGURA, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(saida);

    capas[p.id] = { src: `/capas/${p.id}.webp`, width: info.width, height: info.height };
    achou.push([p.nome, nomeArquivo, `${info.width}x${info.height}`]);
  }

  if (!ENSAIO && achou.length) {
    fs.writeFileSync(INDICE, JSON.stringify(indice, null, 2), 'utf8');
  }

  console.log(`\nCAPAS ENCONTRADAS: ${achou.length}`);
  achou.forEach(([nome, arq, dim]) => console.log(`   ${nome.slice(0, 44).padEnd(46)} ${dim.padEnd(10)} ${arq.slice(0, 42)}`));

  console.log(`\nSEM CAPA: ${falhou.length + semPagina.length}`);
  falhou.forEach(([nome, motivo]) => console.log(`   ${nome.slice(0, 44).padEnd(46)} ${motivo}`));
  semPagina.forEach((p) => console.log(`   ${p.nome.slice(0, 44).padEnd(46)} sem página de vendas`));

  if (!ENSAIO && achou.length) console.log(`\níndice atualizado: ${INDICE}`);
})();
