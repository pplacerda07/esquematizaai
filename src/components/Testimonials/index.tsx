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

// Marquee infinito: cada metade (2 conjuntos) fica mais larga que a tela,
// e a animação de -50% fecha o loop sem emenda. Pausa no hover para leitura.
const SETS = 4;

export default function Testimonials() {
  const trilha = Array.from({ length: SETS }).flatMap(() => reviews);

  return (
    <section className={styles.testimonialsSection}>
      <h2 className={styles.title}>
        O Que Dizem Nossos <span className={styles.titleAccent}>Alunos</span>
      </h2>

      <div className={styles.marquee}>
        <div className={styles.track}>
          {trilha.map((review, i) => (
            <figure
              key={`${review.src}-${i}`}
              className={styles.card}
              aria-hidden={i >= reviews.length ? 'true' : undefined}
            >
              <Image
                src={review.src}
                alt={i < reviews.length ? review.alt : ''}
                width={720}
                height={560}
                className={styles.print}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
