/**
 * Monta o mosaico do Instagram da home a partir das publicações reais do perfil.
 *
 * O script baixa a imagem de cada publicação, redimensiona no formato 4:5 (o mesmo
 * formato que o feed do Instagram usa hoje) e otimiza em WebP. As imagens ficam
 * locais: o site não depende do Instagram para carregar, fica rápido e não quebra
 * quando a URL temporária do Instagram expira.
 *
 * Uso:  node scripts/build-instagram.js
 *       (edite a lista POSTS abaixo com os links que você quer destacar)
 *
 * DE ONDE VEM A IMAGEM (importante para quem for atualizar isso depois):
 *   1) `imagem` — a URL da imagem original, em resolução cheia e SEM CORTE.
 *      É o caminho bom. Essas URLs saem do scraper de Instagram da Apify
 *      (apify/instagram-scraper, campo `displayUrl`), rodado com os links abaixo.
 *      Elas expiram em poucos dias, então servem só para gerar o arquivo local:
 *      depois de rodar o script uma vez, o site vive do WebP em public/instagram/.
 *   2) Sem `imagem`, o script cai na capa de preview do link (og:image). Funciona,
 *      MAS o Instagram entrega essa capa já cortada em quadrado, o que decepa as
 *      palavras dos posts que são cards de texto. Só use como último recurso.
 *   3) `imagemManual` — um arquivo que você mesmo salvou em public/instagram/.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_IMG = path.join(__dirname, '..', 'public', 'instagram');
const OUT_JSON = path.join(__dirname, '..', 'src', 'data', 'instagram.json');

// Cole aqui os links das publicações que devem aparecer na home (6 fica ideal).
const POSTS = [
  {
    url: 'https://www.instagram.com/p/Da60mBgjfOu/',
    alt: 'Publicação sobre os Flashcards do Esquematiza Aí para o Anki, com 27 disciplinas',
    imagem:
      'https://scontent-ord5-2.cdninstagram.com/v/t51.82787-15/748592691_18017732567857251_5949898958968293610_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=104&ig_cache_key=Mzk0MzY5NTcxNzY4ODUxNDEyNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMjE2MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=YpYCGogM4SUQ7kNvwGM1Yzj&_nc_oc=AdpRSKHTvQkTIR1QLLUyuIfeMnKL_OECLr0N0Cqn3y0SUEvWZKEmQkjrOdL2ikfqBcE&_nc_zt=23&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_gid=v2AHVqObnWxl-rYvh53Wew&_nc_ss=72a8c&oh=00_AQD4CFRGHd4BWL903iDqHf1P0e6whtheu76Vh8081mNAVA&oe=6A6596B8',
  },
  {
    url: 'https://www.instagram.com/p/Dau5fpNET_3/',
    alt: 'Publicação com os concursos da área de controle no radar: TCE MA, TCDF, TCE SP e outros',
    imagem:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/747613126_18017124278857251_1436387741478065972_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=101&ig_cache_key=Mzk0MDMzOTMzMzE1NTUwNjk2Ng%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMzI3NC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=-kf531DB2TsQ7kNvwEm7oMY&_nc_oc=AdofsqDn2KznlzebzqHAiF3TwppLI3tCDDAgS2sFhRezbpgg9Kl1II6Cf18Qv6nUc0l_IDXgbBCuuYlgPskjyaa0&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_gid=FWAh2JYrb1Or-pBmIVxJeg&_nc_ss=72689&oh=00_AQCDhj7MoBuBDk1pJpzlTuzGWcPpoForhn_bQYarEJoO4A&oe=6A65A013',
  },
  {
    url: 'https://www.instagram.com/p/DaaVWi6kYs_/',
    alt: 'Publicação sobre como começar na área fiscal do zero com uma rotina de estudos',
    imagem:
      'https://scontent-atl3-1.cdninstagram.com/v/t51.82787-15/735969898_18016090097857251_6132143733317780722_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=100&ig_cache_key=MzkzNDU1MDUyMDE5MDI0MDg3OQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=H3J6vlleY9AQ7kNvwGwfc6I&_nc_oc=AdppjOdo4vj998B9WVjRp0BPSzjMjmZB-M-HWzG9dLB8xdHMRQzLt9fhWZMge3k6hFrnSx8lk6ZluqWComoKW3DO&_nc_zt=23&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_gid=jjL_Ti4y9LJkQ13oFoeiPg&_nc_ss=7d689&oh=00_AQA5vP3PIKrvoDxq8Cf8JF4J0LKo1jk0AgO8F0eEo5p87g&oe=6A65AFBC',
  },
  {
    url: 'https://www.instagram.com/p/DaibFpopthA/',
    alt: 'Publicação sobre constância nos estudos: o que pesa é o que você faz quando ninguém está olhando',
    imagem:
      'https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/736108818_18016499747857251_4288636317686210946_n.jpg?stp=dst-jpg_e35_p1080x1080_sh2.08_tt6&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2gHswC8YiWPVlwxs8IQJQZxOEz9VdHz8rDegwkwChO35TDDw4d2Ug2PQZ1USRpDagZLatiWEMmMYQksAJzPbAOBY&_nc_ohc=_wKy6mlAoyMQ7kNvwEhEGxO&_nc_gid=KiDVR0SgVRAI-OATEZz2ew&edm=ADp7STQBAAAA&ccb=7-5&oh=00_AQC2-aVqolMCUEkvptAkoyGsJo8Xb9af8UsYl4Hk4fSzKQ&oe=6A65AB00&_nc_sid=c6f216',
  },
  {
    url: 'https://www.instagram.com/p/Da2trvxEd3e/',
    alt: 'Publicação sobre escolhas na preparação: cada sim carrega alguns nãos',
    imagem:
      'https://scontent-lga3-3.cdninstagram.com/v/t51.82787-15/748385377_18017522762857251_6664439529914834815_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ig_cache_key=Mzk0MjUzOTIxODg4NjM1ODkyOA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMzI2My5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=BOPJV-RTEo0Q7kNvwEzlxHw&_nc_oc=Adr2WJw0TN31FTgLhvOlGAWGTFWIVAeMYnBTd6erhQ0ulV7w2IL7cssUlaDPo-Ae1c_NE0XchQyFjatikzfKYLji&_nc_zt=23&_nc_ht=scontent-lga3-3.cdninstagram.com&_nc_gid=8MscPNJkF2jigKZ9gFRqYg&_nc_ss=7c689&oh=00_AQBRGhFUotpz1klYBIGXf4tL7s0-nTPbhY6z7m-DqlsVDA&oe=6A65A392',
  },
];

// IMPORTANTE: o Instagram só devolve a capa (og:image) para robôs de preview de link,
// os mesmos que o WhatsApp e o Facebook usam. Com User-Agent de navegador ele responde
// a página do app (com login) e a capa não aparece. Testado em julho/2026.
const UA = 'facebookexternalhit/1.1';

/** Extrai a URL da capa (og:image) da página pública da publicação. */
async function capaDoPost(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9' } });
  if (!res.ok) throw new Error(`página respondeu ${res.status}`);
  const html = await res.text();
  const m = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (!m) throw new Error('capa não encontrada (o Instagram pode ter exigido login)');
  return m[1].replace(/&amp;/g, '&');
}

/** Código curto do post, usado como nome do arquivo. */
function codigoDoPost(url) {
  const m = url.match(/\/(p|reel)\/([^/?]+)/);
  return m ? m[2] : String(Date.now());
}

(async () => {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  const itens = [];
  let ok = 0, falhas = 0;

  for (const post of POSTS) {
    const codigo = codigoDoPost(post.url);
    const destino = path.join(OUT_IMG, `${codigo}.webp`);

    if (post.imagemManual) {
      itens.push({ src: `/instagram/${post.imagemManual}`, url: post.url, alt: post.alt });
      console.log(`${codigo}: usando imagem manual (${post.imagemManual})`);
      ok++;
      continue;
    }

    try {
      const urlCapa = post.imagem ?? (await capaDoPost(post.url));
      const bin = Buffer.from(await (await fetch(urlCapa, { headers: { 'User-Agent': UA } })).arrayBuffer());
      // 4:5 é o formato que o próprio feed do Instagram usa, e é o formato em que
      // as artes do Esquematiza são feitas: nada de texto se perde na borda.
      const info = await sharp(bin)
        .resize(720, 900, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toFile(destino);

      itens.push({ src: `/instagram/${codigo}.webp`, url: post.url, alt: post.alt, width: 720, height: 900 });
      console.log(`${codigo}.webp: ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`);
      ok++;
    } catch (e) {
      falhas++;
      console.error(`FALHOU ${post.url}: ${e.message}`);
      console.error('  -> salve o print em public/instagram/ e use "imagemManual" nesse post.');
    }
  }

  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), itens }, null, 1),
    'utf8',
  );
  console.log(`\ncapas: ${ok} | falhas: ${falhas}`);
  console.log('índice:', OUT_JSON);
})();
