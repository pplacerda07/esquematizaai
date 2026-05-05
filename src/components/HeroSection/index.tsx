import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.decoration} ${styles.decorationTopLeft}`}></div>
      <div className={`${styles.decoration} ${styles.decorationBottomRight}`}></div>

      <div className={styles.container}>
        <div className={styles.columnLeft}>
          <div className={styles.badge}>A Maior Plataforma Fiscal</div>

          <h1 className={styles.title}>
            Sua Aprovação na<br />
            Receita Federal de Forma<br />
            <span className={styles.titleAccent}>Esquematizada</span>
          </h1>

          <p className={styles.subtitle}>
            Aprenda de forma cirúrgica e eficiente. Nossos materiais foram desenvolvidos
            para você gabaritar as provas de Fisco (RFB, SEFAZ, ISS) com mapas mentais e resumos visuais.
          </p>

          <div className={styles.searchBar}>
            <input type="text" placeholder="Qual matéria você precisa dominar?" className={styles.searchInput} />
            <button className={styles.searchBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <div className={styles.tags}>
            <span className={styles.tag}>Receita Federal</span>
            <span className={styles.tag}>SEFAZ</span>
            <span className={styles.tag}>Tributário</span>
            <span className={styles.tag}>Auditoria</span>
          </div>

          <div className={styles.actionButtons}>
            <a href="/vitrine" className={styles.btnMain} style={{ textDecoration: 'none', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>Ver Materiais</a>
            <button className={styles.btnSec}>Planos de Assinatura</button>
          </div>

          <div className={styles.socialProof}>
            <div className={styles.avatars}>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
            </div>
            <div className={styles.proofText}>
              <div className={styles.stars}>★★★★★</div>
              Mais de 2.500 auditores aprovados
            </div>
          </div>
        </div>

        <div className={styles.columnRight}>
          <div className={styles.blobBackground}></div>
          <div className={styles.floatingCard}>
            <Image
              src="/logos/logo-horizontal-azul.png"
              alt="Esquematiza Aí"
              width={240}
              height={62}
              style={{ objectFit: 'contain', marginBottom: '1.25rem' }}
              priority
            />
            <div className={styles.cardStars}>★★★★★</div>
            <div className={styles.cardText}>
              "A melhor plataforma para<br />quem busca resultados rápidos!"
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
