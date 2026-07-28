import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Conteudo from '@/components/Artigo/Conteudo';
import Sumario from '@/components/Artigo/Sumario';
import Compartilhar from '@/components/Artigo/Compartilhar';
import { getPostPorSlug, getSlugsPublicados, getPostsPublicados } from '@/lib/blog';
import { extrairSumario, tempoDeLeitura, dataPorExtenso } from '@/lib/artigo';
import { SITE_URL } from '@/config';
import styles from '@/components/Artigo/artigo.module.css';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getSlugsPublicados();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostPorSlug(slug);
  if (!post) return { title: 'Artigo não encontrado | Esquematiza Aí' };

  const descricao = post.resumo ?? `${post.titulo} — Esquematiza Aí.`;
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${post.titulo} | Esquematiza Aí`,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      title: post.titulo,
      description: descricao,
      url,
      type: 'article',
      publishedTime: post.publicado_em ?? undefined,
      modifiedTime: post.atualizado_em,
      authors: [post.autor],
      images: post.capa_url ? [{ url: post.capa_url }] : undefined,
    },
  };
}

export default async function ArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostPorSlug(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const sumario = extrairSumario(post.conteudo);
  const minutos = tempoDeLeitura(post.conteudo);
  const publicado = dataPorExtenso(post.publicado_em);
  const atualizado = dataPorExtenso(post.atualizado_em);
  // só anuncia "atualizado em" quando a data mudou de fato
  const mostrarAtualizacao = atualizado && atualizado !== publicado;

  const relacionados = (await getPostsPublicados(4)).filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.titulo,
    description: post.resumo ?? undefined,
    datePublished: post.publicado_em ?? undefined,
    dateModified: post.atualizado_em,
    author: { '@type': 'Person', name: post.autor },
    publisher: { '@type': 'Organization', name: 'Esquematiza Aí', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: post.categoria,
    wordCount: post.conteudo.split(/\s+/).filter(Boolean).length,
    ...(post.capa_url ? { image: post.capa_url } : {}),
  };

  return (
    <main>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.faixa}>
        <span className={styles.faixaMarca} aria-hidden="true">
          <Image
            src="/logos/logo-simbolo-3cores.png"
            alt=""
            width={90}
            height={108}
            className={styles.faixaSimbolo}
          />
          esquematiza aí
        </span>
      </div>

      <article className={styles.artigo}>
        <nav className={styles.breadcrumb} aria-label="Você está em">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog">Blog</Link>
        </nav>

        <header>
          <span className={styles.categoria}>{post.categoria}</span>
          <h1 className={styles.titulo}>{post.titulo}</h1>
          {post.resumo && <p className={styles.linhaFina}>{post.resumo}</p>}

          <div className={styles.assinatura}>
            <Image
              src="/mentores/sergio.jpg"
              alt=""
              width={44}
              height={44}
              className={styles.assinaturaFoto}
            />
            <p className={styles.assinaturaTexto}>
              Por <span className={styles.assinaturaAutor}>{post.autor}</span>
              <span className={styles.assinaturaSep}>·</span>
              <time dateTime={post.publicado_em ?? undefined}>{publicado}</time>
              {mostrarAtualizacao && (
                <>
                  <span className={styles.assinaturaSep}>·</span>
                  Atualizado em <time dateTime={post.atualizado_em}>{atualizado}</time>
                </>
              )}
              <span className={styles.assinaturaSep}>·</span>
              leitura de {minutos} min
            </p>
          </div>
        </header>

        {post.capa_url && (
          <div className={styles.capaWrap}>
            <Image
              src={post.capa_url}
              alt={`Capa do artigo ${post.titulo}`}
              width={1200}
              height={630}
              priority
              className={styles.capa}
            />
          </div>
        )}

        <Sumario itens={sumario} />

        <Conteudo markdown={post.conteudo} />

        <p className={styles.verificacao}>
          Informações conferidas nas fontes citadas e atualizadas em{' '}
          {mostrarAtualizacao ? atualizado : publicado}.
        </p>

        <Compartilhar url={url} titulo={post.titulo} />
      </article>

      {relacionados.length > 0 && (
        <section className={styles.relacionados}>
          <h2 className={styles.relacionadosTitulo}>Outros conteúdos do blog</h2>
          <div className={styles.relacionadosGrid}>
            {relacionados.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className={styles.relacionadoCard}>
                {p.capa_url ? (
                  <Image
                    src={p.capa_url}
                    alt=""
                    width={400}
                    height={148}
                    className={styles.relacionadoCapa}
                  />
                ) : (
                  <span className={styles.relacionadoCapa} aria-hidden="true" />
                )}
                <div className={styles.relacionadoCorpo}>
                  <span className={styles.relacionadoCategoria}>{p.categoria}</span>
                  <h3 className={styles.relacionadoTitulo}>{p.titulo}</h3>
                  <span className={styles.relacionadoData}>{dataPorExtenso(p.publicado_em)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
