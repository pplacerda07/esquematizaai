import Image from 'next/image';
import instagram from '@/data/instagram.json';
import styles from './styles.module.css';

const INSTAGRAM_URL = 'https://www.instagram.com/esquematizaai/';

// Publicações reais do perfil. As imagens moram em public/instagram e são geradas
// por scripts/build-instagram.js a partir dos links dos posts.
const TILES = instagram.itens;

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
            href={tile.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver no Instagram: ${tile.alt}`}
          >
            <Image
              src={tile.src}
              alt={tile.alt}
              width={tile.width}
              height={tile.height}
              sizes="(max-width: 900px) 60vw, 20vw"
              className={styles.tileImg}
            />
            <span className={styles.tileOverlay} aria-hidden="true">
              <IconInstagram size={26} />
              <span className={styles.tileHandle}>ver publicação</span>
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
