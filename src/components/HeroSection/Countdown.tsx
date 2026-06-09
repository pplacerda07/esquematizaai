'use client';

import React from 'react';
import styles from './styles.module.css';
import { useCountdown, pad } from './useCountdown';

export default function Countdown() {
  const remaining = useCountdown();
  if (!remaining) return null;

  return (
    <div className={styles.countdown}>
      <div className={styles.countdownLabel}>
        <span className={styles.countdownDot}></span>
        A promoção acaba em
      </div>
      <div className={styles.countdownTime}>
        <div className={styles.countdownUnit}>
          <span className={styles.countdownValue}>{pad(remaining.hours)}</span>
          <span className={styles.countdownUnitLabel}>horas</span>
        </div>
        <span className={styles.countdownSep}>:</span>
        <div className={styles.countdownUnit}>
          <span className={styles.countdownValue}>{pad(remaining.minutes)}</span>
          <span className={styles.countdownUnitLabel}>min</span>
        </div>
        <span className={styles.countdownSep}>:</span>
        <div className={styles.countdownUnit}>
          <span className={styles.countdownValue}>{pad(remaining.seconds)}</span>
          <span className={styles.countdownUnitLabel}>seg</span>
        </div>
      </div>
    </div>
  );
}
