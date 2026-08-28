/**
 * Busca a capa dos produtos que estão sem, direto da página de vendas.
 *
 * Uso:  node scripts/build-capas-faltantes.js [--teste]
 *       --teste  faz só os 5 primeiros, para conferir antes de valer
 *
 * POR QUE ESTE SCRIPT EXISTE. As 107 capas de hoje vieram de uma planilha
 * antiga que tinha uma coluna com a URL da imagem de cada produto. A planilha
 * atual não tem mais essa coluna, então os 69 produtos que entraram na
 * importação de 27/08 nasceram sem capa, e 61 dos 150 da vitrine caem no
 * desenho de reserva. O Sérgio viu e perguntou por quê.
 *
 * A página de vendas de cada produto no WordPress traz a imagem no `og:image`,
 * que é a mesma arte do produto. Testado em 10 páginas: as 10 tinham.
 *
 * SÓ ACRESCENTA. Produto que já tem capa não é tocado, e o índice antigo é lido
 * e reescrito com as novas somadas. O outro script, build-capas-completo.js,
 * reescreve tudo do zero a partir daquela coluna que não existe mais, e rodar
 * ele hoje apagaria as 107.
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const DIR_CATALOGO = path.join(__dirname, '..', 'src', 'data', 'catalogo');
const OUT_IMG = path.join(__dirname, '..', 'public', 'capas');
const SO_TESTE = process.argv.includes('--teste');

// 3:4, que é a proporção que os cards do site já reservam
const LARGURA = 452;
const ALTURA = 640;

const produtos = require(path.join(DIR_CATALOGO, 'produtos.json')).produtos;
const indice = require(path.join(DIR_CATALOGO, 'capas.json'));
const capas = { ...(indice.capas ?? {}) };

const cabecalho = { 'User-Agent': 'Mozilla/5.0 (compatible; EsquematizaBuild/1.0)' };

function extrairOgImage(html) {
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1];
  // algumas páginas põem o content antes do property
  const invertido = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return invertido ? invertido[1] : null;
}

/** a imagem anunciada pela página de vendas, seja ela própria ou herdada */
async function urlDaCapa(paginaDeVendas) {
  const res = await fetch(paginaDeVendas, { headers: cabecalho });
  if (!res.ok) throw new Error(`página HTTP ${res.status}`);
  const url = extrairOgImage(await res.text());
  if (!url) throw new Error('página sem og:image');
  return url;
}

/**
 * Quantos produtos podem dividir a mesma imagem antes de ela ser considerada
 * genérica.
 *
 * Produto sem arte cadastrada no WordPress herda uma imagem padrão do site, e
 * usar isso como capa seria PIOR que o desenho de reserva: dezenas de cards
 * mostrariam a mesma tarja com o logo e o catálogo pareceria defeituoso.
 *
 * Tentei descobrir essa imagem perguntando à home, e não serve: a home anuncia
 * "Capa-Imagem-destaque-Home.jpg" enquanto as páginas de produto herdam
 * "Esquematiza-Ai_Horizontal_Fundo_Preto.jpg". São padrões diferentes.
 *
 * O sinal confiável é a REPETIÇÃO: arte de produto é única, imagem herdada
 * aparece em dezenas. O limite é 2 porque o Sérgio reaproveita a mesma capa
 * entre irmãos de um mesmo concurso, e isso é legítimo.
 */
const LIMITE_DE_REPETICAO = 2;

(async () => {
  fs.mkdirSync(OUT_IMG, { recursive: true });

  const vendaveis = produtos.filter(
    (p) =>
      p.categoria !== 'oferta-personalizada' &&
      p.status !== 'inativo' &&
      (p.checkouts?.normal || p.checkouts?.black || p.urlSite),
  );

  const faltando = vendaveis.filter((p) => !capas[p.id] && p.urlSite);
  const semPagina = vendaveis.filter((p) => !capas[p.id] && !p.urlSite);

  console.log(`na vitrine: ${vendaveis.length} | já com capa: ${vendaveis.length - faltando.length - semPagina.length}`);
  console.log(`a buscar  : ${faltando.length}`);
  console.log(`sem página: ${semPagina.length}  (esses não têm de onde tirar)\n`);

  const lista = SO_TESTE ? faltando.slice(0, 5) : faltando;
  const falhas = [];
  let feitas = 0;

  // PRIMEIRA PASSADA: só descobre qual imagem cada página anuncia, sem baixar
  // nada. É o que permite contar repetições antes de decidir o que é arte de
  // produto e o que é imagem herdada do site.
  console.log('lendo as páginas...');
  const anunciadas = new Map();
  for (const p of lista) {
    try {
      anunciadas.set(p.id, await urlDaCapa(p.urlSite));
    } catch (e) {
      falhas.push({ nome: p.nome, motivo: e.message });
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  const vezes = new Map();
  for (const url of anunciadas.values()) vezes.set(url, (vezes.get(url) ?? 0) + 1);

  const genericas = [...vezes.entries()].filter(([, n]) => n > LIMITE_DE_REPETICAO);
  if (genericas.length) {
    console.log('\nimagens que se repetem e serão rejeitadas por não serem do produto:');
    genericas.forEach(([u, n]) => console.log(`   ${n}x  ${u.split('/').pop()}`));
  }
  console.log();

  for (const [n, p] of lista.entries()) {
    const url = anunciadas.get(p.id);
    if (!url) continue;

    if ((vezes.get(url) ?? 0) > LIMITE_DE_REPETICAO) {
      falhas.push({ nome: p.nome, motivo: 'sem arte própria; herdou a imagem padrão do site' });
      continue;
    }

    try {
      const res = await fetch(url, { headers: cabecalho });
      if (!res.ok) throw new Error(`imagem HTTP ${res.status}`);
      const bin = Buffer.from(await res.arrayBuffer());

      const destino = path.join(OUT_IMG, `${p.id}.webp`);
      await sharp(bin)
        // "contain" e não "cover": as artes vêm em proporções diferentes, e
        // cortar decepa o título impresso na capa
        .resize(LARGURA, ALTURA, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .webp({ quality: 82 })
        .toFile(destino);

      capas[p.id] = { src: `/capas/${p.id}.webp`, width: LARGURA, height: ALTURA };
      feitas++;

      if (SO_TESTE) console.log(`  ok  ${p.nome.slice(0, 46)}\n      ${url.slice(0, 90)}`);
      else if ((n + 1) % 10 === 0) console.log(`  ${n + 1}/${lista.length}...`);
    } catch (e) {
      falhas.push({ nome: p.nome, motivo: e.message });
    }
    await new Promise((r) => setTimeout(r, 150)); // gentil com o servidor do cliente
  }

  if (SO_TESTE) {
    console.log(`\n(teste, nada foi gravado no índice) capas geradas: ${feitas}`);
    return;
  }

  fs.writeFileSync(
    path.join(DIR_CATALOGO, 'capas.json'),
    JSON.stringify(
      {
        geradoEm: new Date().toISOString().slice(0, 10),
        fonte: 'og:image das páginas de venda, somado ao índice anterior',
        capas,
      },
      null,
      1,
    ),
    'utf8',
  );

  console.log(`\ncapas novas: ${feitas}`);
  console.log(`total no índice: ${Object.keys(capas).length}`);
  if (falhas.length) {
    console.log(`\nfalhas (${falhas.length}):`);
    falhas.forEach((f) => console.log(`   ${f.nome.slice(0, 50)} | ${f.motivo}`));
  }
})();
