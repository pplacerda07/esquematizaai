import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './styles.module.css';

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
          {/* Foto única, de propósito. Antes alternava com uma do Sérgio de terno
              num evento; como ele aparecia bem diferente nas duas, quem chegava
              no meio da troca achava que eram duas pessoas. Uma foto só resolve,
              e ainda tira JavaScript da home: isto voltou a ser server component. */}
          <div className={styles.imageWrapper}>
            <Image
              src="/mentores/sergio.jpg"
              alt="Sérgio Furtado, auditor-fiscal e criador do método de revisão"
              fill
              sizes="(max-width: 900px) 100vw, 480px"
              priority
              className={styles.aboutImage}
            />
          </div>
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
