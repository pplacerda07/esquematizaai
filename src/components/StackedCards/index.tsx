'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

type Item = { title: string; desc: string };
type Props = { items: Item[]; eyebrow?: string; title?: string };

const STEP_VH = 44; // quanto de scroll cada card "consome" (quanto maior, mais devagar)
const pad = (n: number) => String(n).padStart(2, '0');

export default function StackedCards({ items, eyebrow = 'O que está incluso', title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setReduce(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        setP(total > 0 ? scrolled / total : 0);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, []);

  const N = items.length;

  // Fallback acessível: lista normal empilhada, sem pin nem scroll-jacking.
  if (reduce) {
    return (
      <section className={styles.section}>
        <div className={styles.head}>
          <span className={styles.label}>{eyebrow}</span>
          {title && <h2 className={styles.title}>{title}</h2>}
        </div>
        <div className={styles.fallbackGrid}>
          {items.map((it, i) => (
            <Card key={it.title} item={it} index={i} static />
          ))}
        </div>
      </section>
    );
  }

  const active = p * N; // 0..N
  const idx = Math.min(N, Math.floor(active) + 1);

  return (
    <section ref={ref} className={styles.section} style={{ height: `${N * STEP_VH + 100}vh` }}>
      <div className={styles.sticky}>
        <div className={styles.head}>
          <span className={styles.label}>{eyebrow}</span>
          {title && <h2 className={styles.title}>{title}</h2>}
        </div>

        <div className={styles.meter}>
          <span className={styles.counter}>
            <span className={styles.cur}>{pad(idx)}</span>
            <span className={styles.sep}> / </span>
            {pad(N)}
          </span>
          <div className={styles.progress}>
            <span className={styles.progressFill} style={{ width: `${p * 100}%` }} />
          </div>
        </div>

        <div className={styles.stage}>
          {items.map((it, i) => {
            const local = active - i;
            let transform: string;
            let opacity = 1;

            if (local <= 0) {
              // ainda não entrou: espera embaixo, invisível
              transform = 'translate(-50%, calc(-50% + 70px)) scale(0.96)';
              opacity = 0;
            } else if (local < 1) {
              // entrando: sobe e fica OPACO rápido (por ~28% do passo),
              // assim cobre o card anterior de forma sólida e legível
              const t = local;
              const ty = (1 - t) * 70;
              const sc = 0.96 + t * 0.04;
              transform = `translate(-50%, calc(-50% + ${ty}px)) scale(${sc})`;
              opacity = Math.min(1, t / 0.28);
            } else {
              // já passou pra trás: encolhe e sobe um pouco, formando o deck.
              // fica 100% opaco (e coberto pelo da frente); só os bem fundos somem
              const back = local - 1;
              const capped = Math.min(back, 3);
              const off = capped * 14;
              const sc = 1 - capped * 0.05;
              transform = `translate(-50%, calc(-50% - ${off}px)) scale(${sc})`;
              opacity = back > 3.2 ? Math.max(0, 1 - (back - 3.2)) : 1;
            }

            return (
              <div
                key={it.title}
                className={styles.cardWrap}
                style={{ transform, opacity, zIndex: i + 1 }}
              >
                <Card item={it} index={i} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Card({ item, index, static: isStatic }: { item: Item; index: number; static?: boolean }) {
  return (
    <article className={`${styles.card} ${isStatic ? styles.cardStatic : ''}`}>
      <span className={styles.num}>{pad(index + 1)}</span>
      <span className={styles.check}>✓</span>
      <h4 className={styles.cardTitle}>{item.title}</h4>
      <p className={styles.cardDesc}>{item.desc}</p>
    </article>
  );
}
