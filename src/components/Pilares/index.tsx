import React from 'react';
import styles from './styles.module.css';

type Pilar = { letter: string; title: string; desc: string; tone: 't' | 'q' | 'r' | 's' };

const PILARES: Pilar[] = [
  { letter: 'T', title: 'Teoria', desc: 'Para entender o conceito', tone: 't' },
  { letter: 'Q', title: 'Questões', desc: 'Para treinar o que a banca cobra', tone: 'q' },
  { letter: 'R', title: 'Revisão', desc: 'Para não esquecer o que aprendeu', tone: 'r' },
  { letter: 'S', title: 'Simulados', desc: 'Para ensaiar a prova inteira', tone: 's' },
];

const TONE: Record<Pilar['tone'], string> = {
  t: styles.toneT,
  q: styles.toneQ,
  r: styles.toneR,
  s: styles.toneS,
};

export default function Pilares() {
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {PILARES.map((p, i) => (
          <div
            key={p.letter}
            className={`${styles.pilar} ${TONE[p.tone]}`}
            style={{ ['--i' as string]: i } as React.CSSProperties}
          >
            <span className={styles.icon}>{p.letter}</span>
            <h4 className={styles.title}>{p.title}</h4>
            <p className={styles.desc}>{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
