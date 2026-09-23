'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { GTM_CONTAINER_ID } from '@/config';
import { guardarCampanha } from '@/lib/rastreio';

/**
 * Google Tag Manager, o container da TAOS.
 *
 * Entrou em 23/09, quando o tráfego pago começou. É o MESMO container que já
 * roda na loja, o que faz a visita no site e a compra na loja aparecerem como
 * uma jornada só, em vez de duas pessoas diferentes.
 *
 * O PIXEL DO META NÃO ESTÁ AQUI, e não deve estar: quem configura tag é a
 * agência, por dentro do GTM. Se cada pedido deles virasse código nosso, cada
 * teste de campanha viraria um deploy.
 *
 * TRÊS DECISÕES, duas herdadas do Analytics ao lado e uma nova:
 *
 * 1. next/script com "afterInteractive", igual ao Analytics. O trecho que o
 *    Google entrega usa <script async> solto, fora do ciclo de vida da página.
 *
 * 2. NÃO CARREGA EM /admin. O painel é área interna. Aqui pesa mais do que no
 *    Analytics: o GTM roda o que a agência publicar nele, e o painel tem a
 *    lista de acessos, o texto dos produtos e os ids do que está sendo editado.
 *    A regra é a mesma do Analytics, pelo mesmo motivo, e vale a pena ter sido
 *    escrita duas vezes.
 *
 * 3. A campanha é guardada aqui, na mesma passada. Precisa acontecer em toda
 *    navegação e em toda página, que é exatamente onde este componente já está.
 *
 * O SNIPPET PADRÃO DO GTM TEM UM <noscript> com iframe, e ele ficou de fora.
 * Serve para navegador sem JavaScript, onde pixel de anúncio não funciona de
 * qualquer jeito: seria um iframe em toda página do site sem medir nada.
 */
export default function TagManager() {
  const pathname = usePathname();
  const noPainel = pathname?.startsWith('/admin') ?? false;

  // guarda a utm da visita a cada troca de página, inclusive na primeira
  useEffect(() => {
    if (!noPainel) guardarCampanha();
  }, [pathname, noPainel]);

  if (!GTM_CONTAINER_ID || noPainel) return null;

  return (
    <Script id="gtm" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
      `}
    </Script>
  );
}
