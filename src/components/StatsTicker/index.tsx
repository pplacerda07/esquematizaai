import React from 'react';
import styles from './styles.module.css';

const stats = [
  { number: '2.5K', label: 'Auditores Aprovados' },
  { number: '100+', label: 'Mapas de Legislação' },
  { number: '95%', label: 'Índice de Acertos' },
  { number: '24/7', label: 'Atualização Constante' },
];

export default function StatsTicker() {
  // Duplicating the array to create a seamless infinite scroll effect
  const repeatedStats = [...stats, ...stats];

  return (
    <section className={styles.tickerWrapper}>
      <div className={styles.tickerContent}>
        {repeatedStats.map((stat, index) => (
          <div key={index} className={styles.tickerItem}>
            <span className={styles.number}>{stat.number}</span>
            <span className={styles.label}>{stat.label}</span>
            {index < repeatedStats.length - 1 && (
              <span className={styles.separator}>+</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
