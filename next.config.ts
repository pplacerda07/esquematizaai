import type { NextConfig } from "next";
import { SITE_URL, URL_DA_LOJA } from "./src/config";
import regrasDoWordPress from "./src/data/redirects-wordpress.json";

/**
 * Redirecionamentos da virada do domínio.
 *
 * Quando esquematizaai.com passar a ser atendido por este site, os 208
 * endereços que hoje existem no WordPress deixam de responder: link salvo nos
 * favoritos, resultado do Google e link em anúncio viram erro. Estas regras
 * levam cada um deles ao lugar certo, sem a pessoa perceber.
 *
 * ELAS SÓ LIGAM QUANDO A LOJA MUDAR DE ENDEREÇO, e isso é proposital. Hoje
 * URL_DA_LOJA e SITE_URL são o mesmo domínio; emitir agora uma regra de
 * /produto/x para esquematizaai.com/produto/x criaria um laço infinito no
 * instante em que o domínio virasse. Com a comparação abaixo, as regras nascem
 * junto com o subdomínio da loja e nunca antes.
 *
 * A lista sai de scripts/, gerada a partir do mapa do site do WordPress. São 68
 * regras porque quatro delas usam curinga e cobrem sozinhas 140 endereços.
 */
type RegraBruta = { origem: string; destino: string };

function redirecionamentosDaVirada() {
  if (URL_DA_LOJA === SITE_URL) return [];

  /**
   * Rede de segurança para os arquivos do WordPress.
   *
   * Depois de trocar o endereço da loja, sobraram duas imagens apontando para
   * esquematizaai.com/wp-content/... Elas não estavam no banco, e sim gravadas
   * no tema, então a substituição do WordPress não as alcançou. Hoje funcionam;
   * depois da virada bateriam neste site e dariam erro.
   *
   * Em vez de caçar uma a uma, todo caminho de arquivo do WordPress passa a
   * apontar para a loja. Vale para o que já existe e para o que aparecer depois.
   */
  const arquivosDoWordPress = [
    '/wp-content/:caminho*',
    '/wp-includes/:caminho*',
    '/wp-json/:caminho*',
    // /wp-admin entra como rede de segurança para quem tem o painel nos
    // favoritos. NÃO serve para o aviso de pagamento da Pagar.me, que chega por
    // POST em admin-ajax.php e não segue redirecionamento com o corpo intacto:
    // esse endereço foi corrigido no painel da Pagar.me em 06/09, e é lá que
    // ele tem que continuar certo.
    '/wp-admin/:caminho*',
    '/wp-login.php',
  ];

  return [
    ...arquivosDoWordPress.map((source) => ({
      source,
      destination: `${URL_DA_LOJA}${source}`,
      permanent: true,
    })),
    ...(regrasDoWordPress as RegraBruta[]).map(({ origem, destino }) => ({
      source: origem,
      destination: destino.replace(/^LOJA/, URL_DA_LOJA),
      // 301: diz ao Google que a mudança é definitiva e transfere a reputação da
      // página antiga. 302 faria o buscador continuar indexando o endereço morto.
      permanent: true,
    })),
  ];
}

/**
 * Cabeçalhos de segurança.
 *
 * O Next não manda nenhum deles por padrão, além do HSTS que a Vercel injeta.
 * Cada linha abaixo fecha um buraco concreto:
 *
 * X-Frame-Options      impede o site ser carregado dentro de um iframe. Sem
 *                      isso dá para montar uma página de golpe que exibe o
 *                      Esquematiza por baixo e captura os cliques.
 * X-Content-Type-Options
 *                      impede o navegador de "adivinhar" o tipo do arquivo.
 *                      Importa aqui porque servimos PDFs de amostra.
 * Referrer-Policy      para de mandar a URL completa para sites de terceiros.
 * Permissions-Policy   desliga câmera, microfone, localização e pagamento. O
 *                      site não usa nada disso, e um script invasor também não vai.
 */
const cabecalhosDeSeguranca = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // esconde a versão do Next na resposta: não ajuda em nada e entrega
  // ao atacante qual falha conhecida tentar
  poweredByHeader: false,

  /**
   * Única origem externa liberada para o otimizador de imagens: a pasta pública
   * do NOSSO Supabase, de onde vêm as capas dos vídeos de depoimento.
   *
   * O padrão do Next é recusar qualquer endereço de fora, e é por isso que ele
   * não pode ser usado como conversor de imagem de terceiros: alguém pediria
   * /_next/image?url=site-de-outra-pessoa e gastaria a nossa banda processando
   * arquivo alheio, além de expor o processador de imagem a arquivos preparados
   * para atacar.
   *
   * Por isso a liberação é estreita: só este host, só https, e só o caminho de
   * arquivo público. Nem o resto da API do Supabase entra.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xjcasijvuzjtnaxxvunm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async redirects() {
    return redirecionamentosDaVirada();
  },

  async headers() {
    return [
      { source: "/:path*", headers: cabecalhosDeSeguranca },
      {
        // o painel não pode ser enquadrado por ninguém, nem por nós, e não
        // deve aparecer em busca
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // resposta de API não é para ficar guardada em cache de ninguém
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
