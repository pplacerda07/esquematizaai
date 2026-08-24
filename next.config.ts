import type { NextConfig } from "next";

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
