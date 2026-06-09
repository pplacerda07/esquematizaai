'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

type Item = { name: string; meta: string; action: string; initials: string };

const ITEMS: Item[] = [
  { name: 'Luana M.', meta: 'Fortaleza · CE', action: 'entrou no grupo VIP do pré-edital CGU', initials: 'LM' },
  { name: 'Rafael A.', meta: 'Goiânia · GO', action: 'acabou de assistir à aula gratuita', initials: 'RA' },
  { name: 'Camila S.', meta: 'Recife · PE', action: 'entrou no grupo do pré-edital CGU', initials: 'CS' },
  { name: 'Thiago B.', meta: 'Curitiba · PR', action: 'pegou o ciclo de estudos no grupo', initials: 'TB' },
  { name: 'Patrícia L.', meta: 'Belo Horizonte · MG', action: 'entrou no grupo VIP da CGU', initials: 'PL' },
  { name: 'Diego F.', meta: 'Manaus · AM', action: 'começou a base antes do edital', initials: 'DF' },
  { name: 'Aline R.', meta: 'Porto Alegre · RS', action: 'entrou no grupo do pré-edital CGU', initials: 'AR' },
  { name: 'Marcos V.', meta: 'Salvador · BA', action: 'garantiu o lugar no grupo VIP', initials: 'MV' },
];

const FIRST_DELAY = 3800;
const VISIBLE_MS = 5200;
const GAP_MS = 9000;

export default function SocialProofToasts() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let i = 0;

    const run = () => {
      setIndex(i);
      setShow(true);
      timer.current = setTimeout(() => {
        setShow(false);
        i = (i + 1) % ITEMS.length;
        timer.current = setTimeout(run, GAP_MS);
      }, VISIBLE_MS);
    };

    timer.current = setTimeout(run, FIRST_DELAY);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const item = ITEMS[index];

  return (
    <div
      className={`${styles.toast} ${show ? styles.show : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={!show}
    >
      <span className={styles.avatar}>{item.initials}</span>
      <div className={styles.body}>
        <span className={styles.name}>{item.name}</span>
        <span className={styles.action}>{item.action}</span>
        <span className={styles.meta}>
          <span className={styles.dot} />
          {item.meta} · agora
        </span>
      </div>
      <span className={styles.check} aria-hidden="true">✓</span>
    </div>
  );
}
