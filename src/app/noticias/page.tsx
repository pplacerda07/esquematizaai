import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getNoticias, formatarData } from '@/lib/blog';
import { SITE_URL } from '@/config';
import styles from './styles.module.css';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Notícias de concursos | Esquematiza Aí',
  description:
    'Curadoria das principais notícias de concursos públicos das áreas fiscal, controle, tribunais e mais, com link direto para a fonte.',
  alternates: { canonical: `${SITE_URL}/noticias` },
};

export default async function NoticiasPage() {
  const noticias = await getNoticias();

  return (
    <main className={styles.main}>
      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>
            Últimas <span className={styles.titleAccent}>notícias</span>
          </h1>
          <p className={styles.subtitle}>
            O que está acontecendo nos concursos que importam para você. Cada manchete leva
            direto para a matéria completa na fonte.
          </p>
        </div>
      </header>

      <section className={styles.lista}>
        {noticias.length === 0 ? (
          <p className={styles.empty}>Nenhuma notícia por aqui ainda. Volte em breve.</p>
        ) : (
          noticias.map((n) => (
            <a
              key={n.id}
              className={styles.item}
              href={n.url_fonte ?? '#'}
              target={n.url_fonte ? '_blank' : undefined}
              rel={n.url_fonte ? 'noopener noreferrer' : undefined}
            >
              <div className={styles.itemBody}>
                <h2 className={styles.itemTitulo}>{n.titulo}</h2>
                <div className={styles.itemMeta}>
                  <span className={styles.itemData}>{formatarData(n.publicado_em)}</span>
                  {n.fonte && <span className={styles.itemFonte}>Fonte: {n.fonte}</span>}
                </div>
              </div>
              <span className={styles.itemSeta} aria-hidden="true">→</span>
            </a>
          ))
        )}
      </section>

      <Footer />
    </main>
  );
}
