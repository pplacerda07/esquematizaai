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
  // "simple" = mobile ou reduced-motion → lista normal (sem pin/scroll-jacking),
  // que no celular rola muito mais fluido que o deck travado.
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    // deck travado é experiência de desktop (mouse). Toque (celular/tablet),
    // tela pequena ou reduced-motion caem na lista simples, que rola liso.
    const queries = [
      window.matchMedia('(max-width: 768px)'),
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];
    const update = () => setSimple(queries.some((q) => q.matches));
    update();
    queries.forEach((q) => q.addEventListener('change', update));
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);

  useEffect(() => {
    if (simple) return; // no modo lista não precisa de scroll listener
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
  }, [simple]);

  const N = items.length;

  // ===== Mobile / reduced-motion: lista vertical simples (rola liso) =====
  if (simple) {
    return (
      <section className={styles.section}>
        <div className={styles.head}>
          <span className={styles.label}>{eyebrow}</span>
          {title && <h2 className={styles.title}>{title}</h2>}
        </div>
        <div className={styles.list}>
          {items.map((it, i) => (
            <Card key={it.title} item={it} index={i} flat />
          ))}
        </div>
      </section>
    );
  }

  // ===== Desktop: deck travado (pin) com os cards se sobrepondo =====
  const active = p * N;
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
              transform = 'translate(-50%, calc(-50% + 70px)) scale(0.96)';
              opacity = 0;
            } else if (local < 1) {
              const t = local;
              const ty = (1 - t) * 70;
              const sc = 0.96 + t * 0.04;
              transform = `translate(-50%, calc(-50% + ${ty}px)) scale(${sc})`;
              opacity = Math.min(1, t / 0.28);
            } else {
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

function Card({ item, index, flat }: { item: Item; index: number; flat?: boolean }) {
  return (
    <article className={`${styles.card} ${flat ? styles.cardFlat : ''}`}>
      <span className={styles.num}>{pad(index + 1)}</span>
      <span className={styles.check}>✓</span>
      <h4 className={styles.cardTitle}>{item.title}</h4>
      <p className={styles.cardDesc}>{item.desc}</p>
    </article>
  );
}
