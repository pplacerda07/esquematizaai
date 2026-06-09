'use client';

import { useEffect, useState } from 'react';
import styles from './styles.module.css';

/**
 * Rastro minimalista vertical que "desenha" conforme a página rola.
 * Fica na lateral, some no mobile e respeita prefers-reduced-motion.
 */
export default function ScrollTrail() {
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setP(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
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

  return (
    <div className={styles.trail} aria-hidden="true">
      <div className={styles.track} />
      <div className={styles.fill} style={{ height: `${p * 100}%` }} />
      <div className={styles.dot} style={{ top: `${p * 100}%` }} />
    </div>
  );
}
