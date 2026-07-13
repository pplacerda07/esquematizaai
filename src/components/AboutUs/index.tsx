import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';
import MentorPhotos from './MentorPhotos';

// Cada tópico é uma alternativa de gabarito marcada (A, B...), como num cartão-resposta.
const blocks = [
  {
    title: 'Nossa missão',
    text: 'Facilitar a aprovação em concursos através de materiais esquematizados, diretos ao ponto e com alta taxa de retenção.',
  },
  {
    title: 'Aprovações em 2026',
    text: 'Nossos alunos passaram na SEFAZ-SP, na SEFA-PA, na SEFAZ-MT e na SEFAZ-RN estudando com resumos e flashcards da Esquematiza.',
  },
];

export default function AboutUs() {
  return (
    <section className={styles.aboutSection} id="sobre">
      <span className={styles.sectionWatermark} aria-hidden="true">método que aprova</span>

      <div className={styles.container}>
        <div className={styles.imageColumn}>
          <MentorPhotos />
          <div className={styles.floatingBadge}>
            <span className={styles.badgeNumber}>+29 mil</span>
            <span className={styles.badgeLabel}>alunos já estudaram<br/>com o método</span>
          </div>
        </div>

        <div className={styles.contentColumn}>
          <h2 className={styles.title}>Feito por quem já passou.</h2>

          <p className={styles.intro}>
            A Esquematiza Aí nasceu das mãos de auditores aprovados que viveram a rotina de
            concurseiro por dentro. O método que você estuda foi construído por quem senta na
            cadeira do cargo e sabe exatamente o que cada banca cobra.
          </p>

          <div className={styles.blocksGrid}>
            {blocks.map((block, i) => (
              <div key={block.title} className={styles.block}>
                <span className={`${styles.gabLetter} ${styles.gabMarked}`} aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <div className={styles.blockContent}>
                  <h3>{block.title}</h3>
                  <p>{block.text}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/mentoria" className={styles.btnCta}>Conheça a mentoria</Link>
        </div>
      </div>
    </section>
  );
}
