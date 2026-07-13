'use client';

import { useRef } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

// Prints reais de alunos (WhatsApp), uniformizados por scripts/build-reviews.js
const reviews = [
  { src: '/reviews/review-1.webp', alt: 'Aluno elogiando a rapidez na entrega dos resumos do combo fiscal: superou minhas expectativas' },
  { src: '/reviews/review-2.webp', alt: 'Aluno elogiando a qualidade dos resumos e a jurisprudência relacionada ao assunto' },
  { src: '/reviews/review-3.webp', alt: 'Aluna aprovada em 19º lugar para procuradora contando que o material do Esquematiza Aí é o melhor entre os flashcards que testou' },
  { src: '/reviews/review-4.webp', alt: 'Aluno elogiando a organização e os layouts impecáveis: não tem nada igual no mercado' },
  { src: '/reviews/review-5.webp', alt: 'Aluno dizendo que confia no trabalho do Esquematiza Aí' },
];

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  const rolar = (direcao: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('figure');
    const passo = card ? card.getBoundingClientRect().width + 28 : 388;
    track.scrollBy({ left: direcao * passo, behavior: 'smooth' });
  };

  return (
    <section className={styles.testimonialsSection}>
      <h2 className={styles.title}>
        O Que Dizem Nossos <span className={styles.titleAccent}>Alunos</span>
      </h2>

      <div className={styles.carousel}>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => rolar(-1)}
          aria-label="Reviews anteriores"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className={styles.track} ref={trackRef}>
          {reviews.map((review) => (
            <figure key={review.src} className={styles.card}>
              <Image
                src={review.src}
                alt={review.alt}
                width={720}
                height={560}
                className={styles.print}
              />
            </figure>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => rolar(1)}
          aria-label="Próximas reviews"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </section>
  );
}
