import React from 'react';
import styles from './styles.module.css';

const stats = [
  { number: '2.5K', label: 'Auditores Aprovados' },
  { number: '100+', label: 'Mapas de Legislação' },
  { number: '95%', label: 'Índice de Acertos' },
  { number: '24/7', label: 'Atualização Constante' },
];

// Marquee infinito: cada "metade" (3 conjuntos) precisa ser mais larga que a tela para
// nunca aparecer vazio ao rolar. 6 conjuntos + animação de -50% dão loop sem emenda.
const SETS = 6;

export default function StatsTicker() {
  const repeatedStats = Array.from({ length: SETS }).flatMap(() => stats);

  return (
    <section className={styles.tickerWrapper}>
      <div className={styles.tickerContent}>
        {repeatedStats.map((stat, index) => (
          <div key={index} className={styles.tickerItem} aria-hidden={index >= stats.length ? 'true' : undefined}>
            <span className={styles.number}>{stat.number}</span>
            <span className={styles.label}>{stat.label}</span>
            <span className={styles.separator}>+</span>
          </div>
        ))}
      </div>
    </section>
  );
}
