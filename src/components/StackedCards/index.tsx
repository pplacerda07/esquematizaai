'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

type Item = { title: string; desc: string };
type Props = { items: Item[]; eyebrow?: string; title?: string };

const STEP_VH = 44; // quanto de scroll cada card "consome" (quanto maior, mais devagar)
const pad = (n: number) => String(n).padStart(2, '0');

export default function StackedCards({ items, title }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Animação do deck escrita DIRETO no DOM (sem setState por frame) — roda
  // liso no desktop e no mobile.
  useEffect(() => {
    if (reduce) return;
    const el = sectionRef.current;
    if (!el) return;
    const N = items.length;
    let raf = 0;

    const render = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      const active = p * N;

      for (let i = 0; i < N; i++) {
        const node = cardRefs.current[i];
        if (!node) continue;
        const local = active - i;
        let transform: string;
        let opacity: number;

        if (local <= 0) {
          transform = 'translate(-50%, calc(-50% + 70px)) scale(0.96)';
          opacity = 0;
        } else if (local < 1) {
          const t = local;
          transform = `translate(-50%, calc(-50% + ${(1 - t) * 70}px)) scale(${0.96 + t * 0.04})`;
          opacity = Math.min(1, t / 0.28);
        } else {
          const back = local - 1;
          const capped = Math.min(back, 3);
          transform = `translate(-50%, calc(-50% - ${capped * 14}px)) scale(${1 - capped * 0.05})`;
          opacity = back > 3.2 ? Math.max(0, 1 - (back - 3.2)) : 1;
        }

        node.style.transform = transform;
        node.style.opacity = String(opacity);
      }

      if (counterRef.current) counterRef.current.textContent = pad(Math.min(N, Math.floor(active) + 1));
      if (progressRef.current) progressRef.current.style.width = `${p * 100}%`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduce, items.length]);

  const N = items.length;

  // Acessibilidade: quem prefere menos movimento vê uma lista normal, sem pin.
  if (reduce) {
    return (
      <section className={styles.section}>
        <div className={styles.head}>
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

  return (
    <section ref={sectionRef} className={styles.section} style={{ height: `${N * STEP_VH + 100}vh` }}>
      <div className={styles.sticky}>
        <div className={styles.head}>
          {title && <h2 className={styles.title}>{title}</h2>}
        </div>

        <div className={styles.meter}>
          <span className={styles.counter}>
            <span ref={counterRef} className={styles.cur}>
              01
            </span>
            <span className={styles.sep}> / </span>
            {pad(N)}
          </span>
          <div className={styles.progress}>
            <span ref={progressRef} className={styles.progressFill} />
          </div>
        </div>

        <div className={styles.stage}>
          {items.map((it, i) => (
            <div
              key={it.title}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={styles.cardWrap}
              style={{ zIndex: i + 1, opacity: 0 }}
            >
              <Card item={it} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ item, index, flat }: { item: Item; index: number; flat?: boolean }) {
  return (
    <article className={`${styles.card} ${flat ? styles.cardFlat : ''}`}>
      <span className={styles.num}>{pad(index + 1)}</span>
      <h4 className={styles.cardTitle}>{item.title}</h4>
      <p className={styles.cardDesc}>{item.desc}</p>
    </article>
  );
}
