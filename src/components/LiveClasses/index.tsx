import React from 'react';
import styles from './styles.module.css';
import YouTubeEmbed from '@/components/YouTubeEmbed';

const classes = [
  { title: 'Revisão RFB - Contabilidade', duration: '1h 30m', image: '/assets/16.png' },
  { title: 'Resolução de Questões CEBRASPE', duration: '45m', image: '/assets/16.png' },
  { title: 'Mentoria: Ciclo de Estudos Fiscal', duration: '1h', image: '/assets/16.png' },
];

export default function LiveClasses() {
  return (
    <section className={styles.liveSection} id="aulas">
      <h2 className={styles.title}>
        Estude com os Melhores <span className={styles.titleAccent}>Em Tempo Real</span>
      </h2>

      <div className={styles.container}>
        <div className={styles.mainPlayer}>
          <YouTubeEmbed
            id="4KHfkSuV8WI"
            title="Aula do Esquematiza Aí no YouTube"
            badge="Assista à aula"
            alt="Aula do Esquematiza Aí"
          />
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
