import React from 'react';
import styles from './styles.module.css';
import Countdown from './Countdown';
import UrgencyBar from './UrgencyBar';
import LiveTicker from './LiveTicker';
import OfferCarousel, { type OfertaHero } from './OfferCarousel';
import { produtoPor, ofertaAtual } from '@/data/catalogo';

// Ofertas reais que giram no card do hero: o combo completo de cada área + a
// assinatura mais completa. Se um produto perder preço ou destino de compra no
// catálogo, sai do carrossel sozinho.
// Por slug e não por ID da Eduzz: depois da planilha de jul/2026 só 31 dos 107
// produtos têm ID Eduzz, então o slug é a chave estável.
const HERO_OFERTA_IDS = [
  'combo-resumos-flashcards-fiscal-regular',
  'combo-resumos-flashcards-controle-regular',
  'combo-resumos-flashcards-policial-regular',
  'combo-resumos-flashcards-tribunais-regular',
  'assinatura-resumos-regular-flashcards-regular',
];

/**
 * Marcador da lista de benefícios: UMA camada do símbolo do Esquematiza.
 * Lidas de cima para baixo (azul, laranja, verde), as três remontam o logo.
 */
const CamadaDaMarca = ({ className }: { className: string }) => (
  <svg className={className} width="24" height="18" viewBox="0 0 24 18" aria-hidden="true">
    <path d="M4.6 3.2 L22 2.2 L21.1 7.6 L11.6 8.2 L9.6 14.4 L2 15.4 Z" />
  </svg>
);

export default function HeroSection() {
  const ofertas: OfertaHero[] = HERO_OFERTA_IDS.flatMap((id) => {
    const p = produtoPor(id);
    const o = p ? ofertaAtual(p) : null;
    return p && o
      ? [{
          id: p.id,
          nome: p.nome,
          area: p.area,
          preco: o.preco,
          precoAntigo: o.precoAntigo,
          percentualOff: o.percentualOff,
          checkout: o.checkout,
        }]
      : [];
  });

  return (
    <>
      <UrgencyBar />

      <section className={styles.hero}>
        <div className={`${styles.decoration} ${styles.decorationTopLeft}`}></div>
        <div className={`${styles.decoration} ${styles.decorationBottomRight}`}></div>

        <div className={styles.container}>
          <div className={styles.columnLeft}>
            <h1 className={styles.title}>
              Cansado de estudar conteúdos{' '}
              <span className={styles.titleHighlight}>desnecessários</span>?
            </h1>

            <p className={styles.subtitle}>
              Aqui no Esquematiza Aí utilizamos uma metodologia baseada no histórico de
              cobrança em provas para direcionar seus estudos e encurtar o tempo até a
              aprovação!
            </p>

            <div className={styles.benefitList}>
              <div className={styles.benefitItem}>
                <CamadaDaMarca className={`${styles.benefitMark} ${styles.markAzul}`} />
                Material atualizado conforme cada edital
              </div>
              <div className={styles.benefitItem}>
                <CamadaDaMarca className={`${styles.benefitMark} ${styles.markLaranja}`} />
                Professores aprovados em concursos fiscais
              </div>
              <div className={styles.benefitItem}>
                <CamadaDaMarca className={`${styles.benefitMark} ${styles.markVerde}`} />
                Acesso vitalício + garantia de 7 dias
              </div>
            </div>

            <div className={styles.actionButtons}>
              <a href="/vitrine" className={styles.btnMain}>
                QUERO MINHA VAGA AGORA
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>

            <LiveTicker />

            {/* saíram os avatares genéricos: a nota real ancora o bloco melhor
                do que três bolinhas coloridas sem rosto nenhum atrás */}
            <div className={styles.socialProof}>
              <span className={styles.proofScore}>
                4,9<span className={styles.proofScoreMax}>/5</span>
              </span>
              <div className={styles.proofText}>
                <div className={styles.stars}>★★★★★</div>
                <span><strong>+2.500 auditores</strong> já passaram com o Esquematiza</span>
              </div>
            </div>
          </div>

          <div className={styles.columnRight}>
            <div className={styles.blobBackground}></div>

            <div className={styles.offerStack}>
              <Countdown />
              <OfferCarousel ofertas={ofertas} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
