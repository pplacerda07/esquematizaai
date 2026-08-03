'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { GA_MEDICAO_ID } from '@/config';

/**
 * Google Analytics 4.
 *
 * Três decisões que valem ser lembradas:
 *
 * 1. Usa next/script com strategy "afterInteractive". O trecho que o Google
 *    entrega usa <script async> solto, que o Next não controla: fica fora do
 *    ciclo de vida da página e atrasa a primeira renderização. Assim ele só
 *    carrega depois que a página já está utilizável.
 *
 * 2. NÃO carrega em /admin. O painel é área interna; medir audiência lá não
 *    diz nada de útil e ainda manda para o Google os endereços internos e os
 *    ids dos produtos que estão sendo editados.
 *
 * 3. Anonimiza o IP e desliga os sinais de publicidade. O site é brasileiro e
 *    a LGPD trata IP como dado pessoal; sem isso o Esquematiza precisaria de
 *    banner de consentimento antes de qualquer medição. Com isso, a medição é
 *    estatística e o risco cai muito.
 */
export default function Analytics() {
  const pathname = usePathname();

  if (!GA_MEDICAO_ID) return null;
  // painel fora da medição: são páginas internas, e os endereços carregam o
  // id do produto que está sendo editado
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEDICAO_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEDICAO_ID}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
