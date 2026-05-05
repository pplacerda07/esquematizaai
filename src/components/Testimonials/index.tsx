import React from 'react';
import styles from './styles.module.css';

const testimonials = [
  { name: 'Lucas Silva', role: 'Auditor-Fiscal (RFB)', text: '"Os mapas mentais de Tributário e Legislação Aduaneira foram o divisor de águas. Simplificam o impossível."', image: '/assets/22.png' },
  { name: 'Mariana Costa', role: 'Aprovada SEFAZ-MG', text: '"Estudar Contabilidade pelos resumos da plataforma me fez sair do zero aos 85% de acertos na FGV."', image: '/assets/22.png' },
  { name: 'João Mendes', role: 'Concurseiro Fiscal', text: '"Material enxuto e certeiro. Focar no que realmente cai me economizou anos de estudo para a área fiscal."', image: '/assets/22.png' },
];

export default function Testimonials() {
  return (
    <section className={styles.testimonialsSection}>
      <span className={styles.sectionTag}>Depoimentos</span>
      <h2 className={styles.title}>
        O Que Dizem Nossos <span className={styles.titleAccent}>Alunos</span>
      </h2>
      
      <div className={styles.grid}>
        {testimonials.map((testi, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.photoBlob}>
                <img src={testi.image} alt={testi.name} className={styles.photo} />
              </div>
              <div className={styles.userInfo}>
                <span className={styles.name}>{testi.name}</span>
                <span className={styles.role}>{testi.role}</span>
                <div className={styles.stars}>★★★★★</div>
              </div>
            </div>
            <p className={styles.text}>{testi.text}</p>
          </div>
        ))}
      </div>
      
      <div className={styles.dots}>
        <div className={`${styles.dot} ${styles.active}`}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </section>
  );
}
