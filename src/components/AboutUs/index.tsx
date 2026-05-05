import React from 'react';
import styles from './styles.module.css';

export default function AboutUs() {
  return (
    <section className={styles.aboutSection} id="sobre">
      <div className={styles.container}>
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <img src="/assets/10.png" alt="Sobre Nós - Esquematiza Aí" className={styles.aboutImage} style={{backgroundColor: 'var(--color-cold-light)'}} />
          </div>
          <div className={styles.floatingBadge}>
            <span className={styles.badgeNumber}>10+</span>
            <span className={styles.badgeLabel}>Anos de<br/>Experiência</span>
          </div>
        </div>
        
        <div className={styles.contentColumn}>
          <span className={styles.sectionTag}>Sobre Nós</span>
          <h2 className={styles.title}>
            Especialistas na<br />
            Área <span className={styles.titleAccent}>Fiscal</span>
          </h2>
          
          <div className={styles.blocksGrid}>
            <div className={styles.block}>
              <div className={styles.blockIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className={styles.blockContent}>
                <h3>Nossa Missão</h3>
                <p>Facilitar a aprovação em concursos fiscais complexos através de materiais esquematizados, diretos ao ponto e com alta taxa de retenção.</p>
              </div>
            </div>
            
            <div className={styles.block}>
              <div className={styles.blockIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </div>
              <div className={styles.blockContent}>
                <h3>Nossa Visão</h3>
                <p>Ser a maior e mais eficiente plataforma de estudos para provas da Receita Federal, SEFAZ e ISS do Brasil.</p>
              </div>
            </div>
          </div>
          
          <button className={styles.btnCta}>Conheça Nossa História</button>
        </div>
      </div>
    </section>
  );
}
