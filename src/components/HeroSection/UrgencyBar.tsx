'use client';

import React from 'react';
import styles from './styles.module.css';
import { useCountdown, pad } from './useCountdown';

export default function UrgencyBar() {
  const remaining = useCountdown();

  return (
    <div className={styles.urgencyBar}>
      <div className={styles.urgencyBarInner}>
        <span className={styles.urgencyFlash}>🔥</span>
        <span className={styles.urgencyText}>
          <strong>ÚLTIMA CHANCE</strong> · Matrículas com até <strong>40% OFF</strong> encerram em
        </span>
        <span className={styles.urgencyClock}>
          {remaining ? `${pad(remaining.hours)}:${pad(remaining.minutes)}:${pad(remaining.seconds)}` : '--:--:--'}
        </span>
        <a href="/vitrine" className={styles.urgencyCta}>
          QUERO MEU DESCONTO →
        </a>
      </div>
    </div>
  );
}
