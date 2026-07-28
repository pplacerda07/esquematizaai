import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPostsPublicados } from '@/lib/blog';
import { dataPorExtenso } from '@/lib/artigo';
import { SITE_URL } from '@/config';
import styles from './styles.module.css';

// ISR: página estática que se atualiza sozinha a cada 60s (posts novos aparecem sem rebuild).
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog | Esquematiza Aí',
  description:
    'Notícias de concurso, estratégia de estudo e análise de editais das áreas Fiscal, Controle, Policial e Tribunais. Conteúdo de quem já passou.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog do Esquematiza Aí',
    description: 'Notícias de concurso, estratégia de estudo e análise de editais.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

export default async function BlogPage() {
  const posts = await getPostsPublicados();

  return (
    <main className={styles.main}>
      <Navbar />

      {/* Faixa em Azul Marinho #26344f, o tom de seção escura do Brand Guide.
          Sem laranja e sem azul médio aqui: uma cor só, com o símbolo da marca
          rebaixado ao fundo. */}
      <header className={styles.faixa}>
        <Image
          src="/logos/logo-simbolo-3cores.png"
          alt=""
          width={420}
          height={504}
          className={styles.faixaMarca}
          aria-hidden="true"
          priority
        />
        <div className={styles.faixaConteudo}>
          <h1 className={styles.faixaTitulo}>Blog</h1>
          <p className={styles.faixaSub}>
            Notícias de concurso, análise de edital e estratégia de estudo.
          </p>
        </div>
      </header>

      <section className={styles.listaSection}>
        <h2 className={styles.listaTitulo}>Posts recentes</h2>

        {posts.length === 0 ? (
          <p className={styles.vazio}>Os primeiros artigos estão a caminho. Volte em breve.</p>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <article key={post.id} className={styles.card}>
                {/* A capa é DESENHADA a partir do próprio post (categoria + título),
                    não uma foto. Assim todo post nasce com capa e a grade fica
                    uniforme, sem depender de alguém subir imagem. */}
                <Link href={`/blog/${post.slug}`} className={styles.capa}>
                  {post.capa_url && (
                    <Image
                      src={post.capa_url}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 100vw, 33vw"
                      className={styles.capaFoto}
                    />
                  )}
                  <span className={styles.capaCategoria}>{post.categoria}</span>
                  <span className={styles.capaTitulo}>{post.titulo}</span>
                  <Image
                    src="/logos/logo-horizontal-branco.png"
                    alt=""
                    width={118}
                    height={30}
                    className={styles.capaLogo}
                  />
                </Link>

                <div className={styles.corpo}>
                  <time className={styles.data} dateTime={post.publicado_em ?? undefined}>
                    {dataPorExtenso(post.publicado_em)}
                  </time>
                  {post.resumo && <p className={styles.resumo}>{post.resumo}</p>}
                  <Link href={`/blog/${post.slug}`} className={styles.leiaMais}>
                    Leia mais
                  </Link>
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
