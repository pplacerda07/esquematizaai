/**
 * Gera o cartão de compartilhamento (src/app/opengraph-image.png).
 *
 * É a imagem que aparece quando alguém cola o link do site no WhatsApp, no
 * Instagram ou no LinkedIn. O nome do arquivo e o lugar dele são convenção do
 * Next: é ele quem emite a tag og:image com largura e altura, e é a altura que
 * faz o WhatsApp escolher entre miniatura grande e ícone minúsculo.
 *
 *   node scripts/build-opengraph.js
 *
 * A versão anterior era fundo azul-escuro com a logo branca, a chamada e a
 * lista de áreas. O Sérgio pediu em 15/09 para trocar pela logomarca em fundo
 * claro, que é a marca oficial, e mandou a referência. Por isso o cartão hoje é
 * só a marca: quem diz o que o site vende é o título e a descrição do link, que
 * viajam ao lado da imagem.
 *
 * 1200x630 não é escolha de gosto: é a proporção que WhatsApp, Facebook e
 * LinkedIn recortam sem cortar nada.
 */
const sharp = require('sharp');
const path = require('path');

const LARGURA = 1200;
const ALTURA = 630;

// cinza quase branco, não branco puro: dá uma borda sutil contra o cartão
// branco do WhatsApp, que senão engole os limites da imagem
const FUNDO = { r: 245, g: 245, b: 245, alpha: 1 };

// 60% da largura deixa respiro dos dois lados e mantém o texto da marca legível
// na miniatura pequena, que é como a maioria das pessoas vê
const LARGURA_DA_LOGO = Math.round(LARGURA * 0.6);

const LOGO = path.join(__dirname, '..', 'public', 'logos', 'logo-horizontal-azul.png');
const SAIDA = path.join(__dirname, '..', 'src', 'app', 'opengraph-image.png');

async function main() {
  const logo = await sharp(LOGO)
    .resize({ width: LARGURA_DA_LOGO, fit: 'inside' })
    .toBuffer();
  const { height } = await sharp(logo).metadata();

  await sharp({ create: { width: LARGURA, height: ALTURA, channels: 4, background: FUNDO } })
    .composite([
      {
        input: logo,
        left: Math.round((LARGURA - LARGURA_DA_LOGO) / 2),
        top: Math.round((ALTURA - height) / 2),
      },
    ])
    .png()
    .toFile(SAIDA);

  const { size } = await sharp(SAIDA).metadata();
  console.log('gerado: src/app/opengraph-image.png');
  console.log(LARGURA + 'x' + ALTURA + ', ' + Math.round(size / 1024) + ' kB');
}

main();
