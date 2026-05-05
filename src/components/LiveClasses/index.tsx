import React from 'react';
import styles from './styles.module.css';

const classes = [
  { title: 'Revisão RFB - Contabilidade', duration: '1h 30m', image: '/assets/16.png' },
  { title: 'Resolução de Questões CEBRASPE', duration: '45m', image: '/assets/16.png' },
  { title: 'Mentoria: Ciclo de Estudos Fiscal', duration: '1h', image: '/assets/16.png' },
];

export default function LiveClasses() {
  return (
    <section className={styles.liveSection} id="aulas">
      <span className={styles.sectionTag}>Aulas ao Vivo</span>
      <h2 className={styles.title}>
        Estude com os Melhores <span className={styles.titleAccent}>Em Tempo Real</span>
      </h2>
      
      <div className={styles.container}>
        <div className={styles.mainPlayer}>
          <img src="/assets/15.png" alt="Aula ao vivo" className={styles.playerThumb} />
          <div className={styles.playBtn}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
        
        <div className={styles.sidebar}>
          {classes.map((cls, idx) => (
            <div key={idx} className={styles.thumbnailCard}>
              <img src={cls.image} alt={cls.title} className={styles.thumbImg} />
              <div className={styles.thumbInfo}>
                <h4 className={styles.thumbTitle}>{cls.title}</h4>
                <span className={styles.thumbDuration}>{cls.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
