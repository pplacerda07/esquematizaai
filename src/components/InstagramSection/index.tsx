import Image from 'next/image';
import styles from './styles.module.css';

const INSTAGRAM_URL = 'https://www.instagram.com/esquematizaai/';

// Mosaico estilo feed com imagens reais da marca (fotos, materiais e capas).
const TILES = [
  { src: '/mentores/sergio-evento.jpg', alt: 'Sérgio Furtado em evento do Estratégia Concursos' },
  { src: '/capas/combo-resumo-fiscal-regular.webp', alt: 'Capa do Combo Resumo Fiscal Regular' },
  { src: '/amostras-produto/9.png', alt: 'Página de um resumo esquematizado' },
  { src: '/mentores/sergio.jpg', alt: 'Sérgio Furtado, do time Esquematiza Aí' },
  { src: '/capas/combo-resumos-flashcards-controle-regular.webp', alt: 'Capa do Combo Resumos e Flashcards Controle' },
  { src: '/amostras-produto/13.png', alt: 'Página de um resumo esquematizado com quadros' },
];

const IconInstagram = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function InstagramSection() {
  return (
    <section className={styles.instaSection} id="instagram">
      <div className={styles.header}>
        <h2 className={styles.title}>
          Todo dia no seu <span className={styles.titleAccent}>feed</span>
        </h2>
        <p className={styles.subtitle}>
          Mais de 113 mil concurseiros acompanham o @esquematizaai: dicas de revisão,
          alertas de edital e bastidores dos materiais, todos os dias.
        </p>
      </div>

      <div className={styles.grid}>
        {TILES.map((tile) => (
          <a
            key={tile.src}
            className={styles.tile}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir o Instagram do Esquematiza Aí: ${tile.alt}`}
          >
            <Image
              src={tile.src}
              alt={tile.alt}
              width={400}
              height={400}
              className={styles.tileImg}
            />
            <span className={styles.tileOverlay} aria-hidden="true">
              <IconInstagram size={26} />
              <span className={styles.tileHandle}>@esquematizaai</span>
            </span>
          </a>
        ))}
      </div>

      <div className={styles.ctaRow}>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaBtn}
        >
          <IconInstagram size={19} />
          Seguir @esquematizaai
        </a>
        <span className={styles.ctaNota}>113 mil seguidores e contando</span>
      </div>
    </section>
  );
}
