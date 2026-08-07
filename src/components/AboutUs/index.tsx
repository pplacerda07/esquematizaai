import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './styles.module.css';

// Cada tópico é uma alternativa de gabarito marcada (A, B...), como num cartão-resposta.
//
// O texto é do Sérgio, escrito corrido para servir também de roteiro de VSL.
// Aqui ele foi quebrado nos três passos do argumento (para que serve, como é
// filtrado, o que a pessoa ganha) porque sete parágrafos seguidos numa coluna
// viram um paredão que ninguém lê até o fim. As frases são as dele; caíram só
// os conectores que amarravam um parágrafo no anterior ("Ou seja", "Portanto"),
// que perdem sentido quando o texto deixa de ser corrido.
const blocks = [
  {
    title: 'Feito para revisar',
    text: 'Todos os nossos materiais foram preparados com um único propósito: fazer você revisar mais rápido os assuntos mais importantes de cada disciplina.',
  },
  {
    title: 'Filtrado pelo que cai',
    text: 'E como filtramos o que é importante? Através do histórico de incidência de questões em provas. Montamos o material a partir de questões que já caíram em provas recentes, e que certamente cairão novamente.',
  },
  {
    title: 'Revisão sem pausas',
    text: 'Com os nossos materiais você consegue revisar de forma leve, fluida e sem pausas os assuntos mais importantes de cada matéria.',
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
            <span className={styles.badgeNumber}>+30 mil</span>
            <span className={styles.badgeLabel}>alunos já estudaram<br/>com o método</span>
          </div>
        </div>

        <div className={styles.contentColumn}>
          <h2 className={styles.title}>
            O maior desafio dos estudos para concurso: a revisão.
          </h2>

          <p className={styles.intro}>
            Para acertar questões no dia da prova, você precisa consolidar as informações
            que estudou durante meses, às vezes anos.
          </p>

          <p className={styles.intro}>
            O material que você usou para <strong>aprender</strong> uma matéria nova não
            será necessariamente o <strong>mesmo</strong> material que você vai levar para
            as últimas semanas antes da sua prova. Você precisa de algo direcionado, enxuto
            e, o principal, com informações que realmente caem em concurso.
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

          <p className={styles.fecho}>
            Estamos há 5 anos no mercado, já aprovamos milhares de alunos nos mais diversos
            concursos do país e somos referência em Resumos e Flashcards para concursos.
          </p>

          <Link href="/mentoria" className={styles.btnCta}>Conheça a mentoria</Link>
        </div>
      </div>
    </section>
  );
}
