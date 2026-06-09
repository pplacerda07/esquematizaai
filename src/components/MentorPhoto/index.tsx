'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

export type Shot = { src: string; caption: string };

type Props = {
  shots: Shot[];
  alt: string;
  interval?: number;
};

export default function MentorPhoto({ shots, alt, interval = 3800 }: Props) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (shots.length <= 1) return;
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const id = setInterval(() => setI((p) => (p + 1) % shots.length), interval);
    return () => clearInterval(id);
  }, [shots.length, interval]);

  return (
    <div className={styles.photo}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.frame}>
        {shots.map((s, idx) => (
          <Image
            key={s.src}
            src={s.src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 460px"
            className={`${styles.img} ${idx === i ? styles.imgActive : ''}`}
            priority={idx === 0}
          />
        ))}

        <div className={styles.shade} aria-hidden="true" />

        <div className={styles.caption}>
          <span className={styles.captionDot} />
          {shots[i].caption}
        </div>

        {shots.length > 1 && (
          <div className={styles.dots} aria-hidden="true">
            {shots.map((s, idx) => (
              <span key={s.src} className={`${styles.dot} ${idx === i ? styles.dotActive : ''}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
