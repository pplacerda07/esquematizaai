import React from 'react';
import styles from './styles.module.css';
import Countdown from './Countdown';
import UrgencyBar from './UrgencyBar';
import LiveTicker from './LiveTicker';
import OfferCarousel, { type OfertaHero } from './OfferCarousel';
import { produtoPor, ofertaAtual } from '@/data/catalogo';

// Ofertas reais que giram no card do hero: os 4 combos por área + assinatura.
// Se um produto perder preço ou checkout no catálogo, sai do carrossel sozinho.
const HERO_OFERTA_IDS = ['2903930', '2903931', '2903935', '2903937', '2901041'];

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
              VOCÊ É O <span className={styles.titleHighlight}>PRÓXIMO</span>
              <br />
              aprovado no Fisco
              <br />
              com o método <span className={styles.titleAccent}>esquematizado</span>
            </h1>

            <p className={styles.subtitle}>
              Pare de perder meses estudando errado. Mapas mentais, resumos visuais e
              questões comentadas para você gabaritar <strong>RFB, SEFAZ e ISS</strong> em
              metade do tempo.
            </p>

            <div className={styles.benefitList}>
              <div className={styles.benefitItem}>
                <span className={styles.checkIcon}>✓</span>
                Material atualizado conforme cada edital
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.checkIcon}>✓</span>
                Professores aprovados em concursos fiscais
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.checkIcon}>✓</span>
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
              <a href="#planos" className={styles.btnSec}>Comparar planos</a>
            </div>

            <LiveTicker />

            <div className={styles.socialProof}>
              <div className={styles.avatars}>
                <div className={styles.avatar}></div>
                <div className={styles.avatar}></div>
                <div className={styles.avatar}></div>
              </div>
              <div className={styles.proofText}>
                <div className={styles.stars}>★★★★★ <span className={styles.proofRating}>4.9/5</span></div>
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
