import React from 'react';
import styles from './styles.module.css';

const phrases = [
  'MAIS DE 10 MIL APROVADOS',
  'MATERIAL 100% ATUALIZADO',
  'MÉTODO ESQUEMATIZADO',
  'AULAS AO VIVO',
  'SUPORTE DEDICADO',
];

// Marquee infinito: cada metade (2 conjuntos) mais larga que a tela evita o vazio no fim.
const SETS = 4;

export default function SocialTicker() {
  const repeatedPhrases = Array.from({ length: SETS }).flatMap(() => phrases);

  return (
    <section className={styles.tickerWrapper}>
      <div className={styles.tickerContent}>
        {repeatedPhrases.map((phrase, index) => (
          <div key={index} className={styles.tickerItem} aria-hidden={index >= phrases.length ? 'true' : undefined}>
            <span className={styles.text}>{phrase}</span>
            <span className={styles.star}>★</span>
          </div>
        ))}
      </div>
    </section>
  );
}
