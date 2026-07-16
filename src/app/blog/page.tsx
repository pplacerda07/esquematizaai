import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPostsPublicados, formatarData } from '@/lib/blog';
import { SITE_URL } from '@/config';
import styles from './styles.module.css';

// ISR: página estática que se atualiza sozinha a cada 60s (posts novos aparecem sem rebuild).
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog | Esquematiza Aí',
  description:
    'Dicas de estudo, estratégia para concursos e novidades de editais da área fiscal, controle, tribunais e mais. Conteúdo de quem já passou.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog do Esquematiza Aí',
    description: 'Dicas de estudo, estratégia e novidades de concursos.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

const CATEGORIA_CLASSE: Record<string, string> = {
  Dicas: 'catDicas',
  Estratégia: 'catEstrategia',
  Legislação: 'catLegislacao',
  Guias: 'catGuias',
  Novidades: 'catNovidades',
};

export default async function BlogPage() {
  const posts = await getPostsPublicados();

  return (
    <main className={styles.main}>
      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>
            O <span className={styles.titleAccent}>blog</span> do Esquematiza
          </h1>
          <p className={styles.subtitle}>
            Estratégia, dicas de estudo e novidades de concursos, escritas por quem senta na
            cadeira do cargo e conhece o jogo por dentro.
          </p>
        </div>
      </header>

      <section className={styles.listSection}>
        {posts.length === 0 ? (
          <p className={styles.empty}>Os primeiros artigos estão a caminho. Volte em breve.</p>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <article key={post.id} className={styles.card}>
                <Link href={`/blog/${post.slug}`} className={styles.capaWrap} tabIndex={-1} aria-hidden="true">
                  {post.capa_url ? (
                    <Image
                      src={post.capa_url}
                      alt=""
                      width={640}
                      height={360}
                      className={styles.capa}
                    />
                  ) : (
                    <span className={`${styles.capaFallback} ${styles[CATEGORIA_CLASSE[post.categoria] ?? 'catDicas']}`}>
                      {post.categoria}
                    </span>
                  )}
                </Link>

                <div className={styles.cardBody}>
                  <span className={`${styles.badge} ${styles[CATEGORIA_CLASSE[post.categoria] ?? 'catDicas']}`}>
                    {post.categoria}
                  </span>
                  <h2 className={styles.cardTitle}>
                    <Link href={`/blog/${post.slug}`} className={styles.cardTitleLink}>
                      {post.titulo}
                    </Link>
                  </h2>
                  {post.resumo && <p className={styles.cardResumo}>{post.resumo}</p>}
                  <div className={styles.cardMeta}>
                    <span className={styles.autor}>{post.autor}</span>
                    <span className={styles.data}>{formatarData(post.publicado_em)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
