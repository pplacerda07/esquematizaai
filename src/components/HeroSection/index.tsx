import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import Countdown from './Countdown';
import UrgencyBar from './UrgencyBar';
import LiveTicker from './LiveTicker';

export default function HeroSection() {
  return (
    <>
      <UrgencyBar />

      <section className={styles.hero}>
        <div className={`${styles.decoration} ${styles.decorationTopLeft}`}></div>
        <div className={`${styles.decoration} ${styles.decorationBottomRight}`}></div>

        <div className={styles.container}>
          <div className={styles.columnLeft}>
            <div className={styles.urgencyBadge}>
              <span className={styles.pulseDot}></span>
              Últimas vagas — turma 2026
            </div>

            <h1 className={styles.title}>
              VOCÊ É O <span className={styles.titleHighlight}>PRÓXIMO</span>
              <br />
              aprovado no Fisco
              <br />
              com o método <span className={styles.titleAccent}>Esquematizado</span>
            </h1>

            <p className={styles.subtitle}>
              Pare de perder meses estudando errado. Mapas mentais, resumos visuais e
              questões comentadas para você gabaritar <strong>RFB, SEFAZ e ISS</strong> —
              em metade do tempo.
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

              <div className={styles.offerCard}>
                <div className={styles.offerTag}>OFERTA DE LANÇAMENTO</div>
                <div className={styles.pixStamp}>
                  <span className={styles.pixStampLabel}>PIX</span>
                  <span className={styles.pixStampValue}>+10%<br/>OFF</span>
                </div>

                <Image
                  src="/logos/logo-horizontal-azul.png"
                  alt="Esquematiza Aí"
                  width={200}
                  height={52}
                  className={styles.offerLogo}
                  priority
                />

                <div className={styles.offerLabel}>
                  <span className={styles.bestseller}>★ MAIS VENDIDO ★</span>
                  Plano Anual Completo
                </div>

                <div className={styles.offerPriceRow}>
                  <span className={styles.offerOldPrice}>De R$ 1.997</span>
                  <span className={styles.offerDiscount}>−40%</span>
                </div>

                <div className={styles.offerPrice}>
                  <span className={styles.offerCurrency}>12x</span>
                  <span className={styles.offerAmount}>R$ 99</span>
                  <span className={styles.offerSuffix}>,90</span>
                </div>

                <div className={styles.offerCash}>
                  <span className={styles.noFees}>sem juros</span> · ou R$ 1.197 à vista
                </div>

                <div className={styles.bonusBox}>
                  <div className={styles.bonusHeader}>🎁 Bônus de lançamento</div>
                  <ul className={styles.bonusList}>
                    <li>1.000 questões CEBRASPE comentadas</li>
                    <li>Mentoria em grupo no 1º mês</li>
                    <li>Pacote de flashcards (R$ 197)</li>
                  </ul>
                </div>

                <a href="/vitrine" className={styles.offerBtn}>
                  GARANTIR MINHA VAGA
                  <span className={styles.offerBtnArrow}>→</span>
                </a>

                <div className={styles.offerFooter}>
                  <span className={styles.lockIcon}>🔒</span>
                  Compra segura · 7 dias de garantia · Mercado Pago
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
