import React from 'react';
import styles from './styles.module.css';

/**
 * Prints das avaliações (reviews). Coloque as imagens em /public/assets e
 * liste os caminhos aqui. Por enquanto há um placeholder repetido só pra rodar
 * o carrossel; é só trocar/adicionar os prints reais.
 */
const REVIEWS: string[] = [
  '/assets/WhatsApp%20Image%202026-06-22%20at%2008.37.57.jpeg',
  '/assets/WhatsApp%20Image%202026-06-22%20at%2008.37.57.jpeg',
  '/assets/WhatsApp%20Image%202026-06-22%20at%2008.37.57.jpeg',
  '/assets/WhatsApp%20Image%202026-06-22%20at%2008.37.57.jpeg',
  '/assets/WhatsApp%20Image%202026-06-22%20at%2008.37.57.jpeg',
];

export default function ReviewsCarousel() {
  // duplica a lista pra o loop ficar contínuo (seamless)
  const track = [...REVIEWS, ...REVIEWS];

  return (
    <div className={styles.viewport}>
      <div className={styles.track}>
        {track.map((src, i) => (
          <figure className={styles.item} key={i} aria-hidden={i >= REVIEWS.length}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.img} src={src} alt="Avaliação de aluno da mentoria" loading="lazy" />
          </figure>
        ))}
      </div>
    </div>
  );
}
