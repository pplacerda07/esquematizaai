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
          Cupom de <strong>10% OFF</strong> na sua primeira compra. Use o código{' '}
          <span className={styles.urgencyCupom}>ESQ10</span> em qualquer produto do site,
          menos a mentoria.
        </span>
        {/* Relógio e botão andam juntos num bloco só.
            A copy do cupom é longa: o conjunto pede 1.302px numa faixa de
            1.139px, então em telas comuns ele quebra em duas linhas de
            qualquer jeito. Soltos, o relógio ficava pendurado no fim da
            primeira linha e o botão sozinho embaixo. Agrupados, a quebra
            vira leitura: o recado em cima, o prazo e a ação embaixo. */}
        <span className={styles.urgencyAcao}>
          {/* Minutos e segundos, não mais horas: o prazo agora é de 10 minutos
              e um "00:09:58" faria a pessoa ler as horas primeiro. */}
          <span className={styles.urgencyClock}>
            {remaining ? `${pad(remaining.minutes)}:${pad(remaining.seconds)}` : '--:--'}
          </span>
          <a href="/vitrine" className={styles.urgencyCta}>
            QUERO MEU DESCONTO →
          </a>
        </span>
      </div>
    </div>
  );
}
