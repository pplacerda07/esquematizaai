import Link from 'next/link';
import Image from 'next/image';
import { getPostsPublicados, getNoticias, formatarDataCurta } from '@/lib/blog';
import styles from './styles.module.css';

// "13/Maio" — formato do card de destaque das notícias
function dataDestaque(iso: string) {
  const d = new Date(iso);
  const mes = d.toLocaleDateString('pt-BR', { month: 'long' });
  return `${String(d.getDate()).padStart(2, '0')}/${mes.charAt(0).toUpperCase()}${mes.slice(1)}`;
}

function dataArtigo(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function Dots({ active = 2, count = 5 }: { active?: number; count?: number }) {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}></span>
      ))}
    </div>
  );
}

export default async function BlogPreview() {
  const [noticias, posts] = await Promise.all([getNoticias(5), getPostsPublicados(6)]);

  const destaque = noticias[0];
  const demais = noticias.slice(1, 5);

  if (noticias.length === 0 && posts.length === 0) return null;

  return (
    <section className={styles.blogSection} id="blog">
      <div className={styles.container}>

        {/* Últimas notícias (curadoria: manchete + link para a fonte) */}
        {destaque && (
          <div className={styles.block}>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h2 className={styles.title}>
                  Últimas <span className={styles.titleAccent}>notícias</span>
                </h2>
                <Dots active={2} count={5} />
              </div>
              <Link href="/noticias" className={styles.outlineBtn}>Ver todas as notícias</Link>
            </div>

            <div className={styles.newsGrid}>
              <a
                className={styles.featuredCard}
                href={destaque.url_fonte ?? '/noticias'}
                target={destaque.url_fonte ? '_blank' : undefined}
                rel={destaque.url_fonte ? 'noopener noreferrer' : undefined}
              >
                <span className={styles.featuredDate}>
                  <span className={styles.dateDash}>·</span> {dataDestaque(destaque.publicado_em)}
                </span>
                <h3 className={styles.featuredTitle}>{destaque.titulo}</h3>
              </a>

              <div className={styles.newsSmallGrid}>
                {demais.map((item) => (
                  <a
                    key={item.id}
                    className={styles.newsCard}
                    href={item.url_fonte ?? '/noticias'}
                    target={item.url_fonte ? '_blank' : undefined}
                    rel={item.url_fonte ? 'noopener noreferrer' : undefined}
                  >
                    <h4 className={styles.newsTitle}>{item.titulo}</h4>
                    <span className={styles.newsDate}>{formatarDataCurta(item.publicado_em)}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Artigos em destaque (blog próprio) */}
        {posts.length > 0 && (
          <div className={styles.block}>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h2 className={styles.title}>
                  Artigos em <span className={styles.titleAccent}>destaque</span>
                </h2>
                <Dots active={2} count={5} />
              </div>
              <Link href="/blog" className={styles.outlineBtn}>Ver todos os artigos</Link>
            </div>

            <div className={styles.articlesRow}>
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className={styles.articleCard}>
                  <div className={styles.articleIconWrap}>
                    <Image
                      src="/logos/logo-simbolo-semlinhas.png"
                      alt=""
                      width={56}
                      height={56}
                      className={styles.articleIcon}
                    />
                  </div>
                  <h4 className={styles.articleTitle}>{post.titulo}</h4>
                  <div className={styles.articleMeta}>
                    <span className={styles.articleDate}>{dataArtigo(post.publicado_em)}</span>
                    <span className={styles.articleAuthor}>por {post.autor}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
