'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

// Fotos reais do mentor em ação (public/mentores).
const FOTOS = [
  { src: '/mentores/sergio-evento.jpg', alt: 'Sérgio Furtado em evento do Estratégia Concursos' },
  { src: '/mentores/sergio.jpg', alt: 'Sérgio Furtado, auditor-fiscal e criador do método de revisão' },
];

const ROTACAO_MS = 4000;

export default function MentorPhotos() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % FOTOS.length), ROTACAO_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.imageWrapper}>
      {FOTOS.map((foto, i) => (
        <Image
          key={foto.src}
          src={foto.src}
          alt={foto.alt}
          fill
          sizes="(max-width: 900px) 100vw, 480px"
          priority={i === 0}
          className={`${styles.aboutImage} ${i === idx ? styles.aboutImageActive : ''}`}
        />
      ))}

      <div className={styles.photoDots} role="tablist" aria-label="Fotos dos mentores">
        {FOTOS.map((foto, i) => (
          <button
            key={foto.src}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-label={foto.alt}
            className={`${styles.photoDot} ${i === idx ? styles.photoDotActive : ''}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </div>
  );
}
