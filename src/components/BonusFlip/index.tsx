'use client';

import { useState } from 'react';
import styles from './styles.module.css';

type Bonus = { tag: string; title: string; desc: string; val: string };

const BONUS: Bonus[] = [
  {
    tag: 'Bônus 1',
    title: 'Estudo Esquematizado',
    desc: 'O curso completo de técnicas de estudo e planejamento, com treze módulos, que entra como a sua primeira tarefa pra você estudar do jeito certo desde o primeiro dia.',
    val: 'Valor: R$ 397,00',
  },
  {
    tag: 'Bônus 2',
    title: 'Sala de Estudos Virtual',
    desc: 'O ambiente onde você estuda junto com outros mentorados, com presença e foco, como uma biblioteca online da turma.',
    val: 'Exclusivo dos mentorados',
  },
  {
    tag: 'Bônus 3',
    title: 'Revisão Esquematizada',
    desc: 'O treinamento de técnicas de revisão pra você transformar o nosso material no seu, com os seus erros e os seus pontos fracos mapeados.',
    val: 'Valor: R$ 397,00',
  },
];

export default function BonusFlip() {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <div className={styles.grid}>
      {BONUS.map((b, i) => {
        const isFlipped = flipped === i;
        return (
          <div
            key={b.title}
            className={`${styles.scene} ${isFlipped ? styles.flipped : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`${b.tag}: ${b.title}. Veja os detalhes.`}
            onClick={() => setFlipped(isFlipped ? null : i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlipped(isFlipped ? null : i);
              }
            }}
          >
            <div className={styles.tilt} style={{ animationDelay: `${i * 0.7}s` }}>
              <div className={styles.inner}>
                <div className={`${styles.face} ${styles.front}`}>
                  <span className={styles.tag}>{b.tag}</span>
                  <h3 className={styles.frontTitle}>{b.title}</h3>
                  <span className={styles.hint}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Passe o mouse ou toque
                  </span>
                </div>
                <div className={`${styles.face} ${styles.back}`}>
                  <h3 className={styles.frontTitle}>{b.title}</h3>
                  <p className={styles.desc}>{b.desc}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
