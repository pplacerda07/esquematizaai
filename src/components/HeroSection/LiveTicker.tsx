'use client';

import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const PURCHASES = [
  { name: 'Marina R.', city: 'Recife', plan: 'Plano Anual', minutes: 2 },
  { name: 'João P.', city: 'São Paulo', plan: 'Plano 2 Anos', minutes: 4 },
  { name: 'Ana B.', city: 'Curitiba', plan: 'Combo Fiscal', minutes: 7 },
  { name: 'Carlos M.', city: 'Belo Horizonte', plan: 'Plano Anual', minutes: 11 },
  { name: 'Letícia S.', city: 'Fortaleza', plan: 'Mentoria 1:1', minutes: 14 },
  { name: 'Rodrigo A.', city: 'Brasília', plan: 'Plano 2 Anos', minutes: 18 },
];

export default function LiveTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % PURCHASES.length);
        setVisible(true);
      }, 280);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const current = PURCHASES[index];

  return (
    <div className={styles.liveTicker}>
      <div className={styles.liveDot}></div>
      <div className={`${styles.liveContent} ${visible ? styles.liveVisible : styles.liveHidden}`}>
        <strong>{current.name}</strong> de {current.city} comprou
        <strong> {current.plan}</strong>
        <span className={styles.liveTime}>há {current.minutes} min</span>
      </div>
    </div>
  );
}
