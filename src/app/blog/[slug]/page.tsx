import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPostPorSlug, getSlugsPublicados, formatarData } from '@/lib/blog';
import { SITE_URL } from '@/config';
import styles from './styles.module.css';

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

  // JSON-LD: ajuda Google e motores de IA (ChatGPT, Perplexity) a entenderem o artigo.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.titulo,
    description: post.resumo ?? undefined,
    datePublished: post.publicado_em ?? undefined,
    dateModified: post.atualizado_em,
    author: { '@type': 'Organization', name: post.autor },
    publisher: {
      '@type': 'Organization',
      name: 'Esquematiza Aí',
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(post.capa_url ? { image: post.capa_url } : {}),
  };

  return (
    <main className={styles.main}>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className={styles.article}>
        <nav className={styles.breadcrumb} aria-label="Você está em">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog">Blog</Link>
        </nav>

        <header className={styles.header}>
          <span className={styles.badge}>{post.categoria}</span>
          <h1 className={styles.title}>{post.titulo}</h1>
          <div className={styles.meta}>
            <span className={styles.autor}>{post.autor}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publicado_em ?? undefined}>{formatarData(post.publicado_em)}</time>
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

        <div className={styles.conteudo}>
          <ReactMarkdown>{post.conteudo}</ReactMarkdown>
        </div>

        <div className={styles.footerCta}>
          <Link href="/blog" className={styles.voltar}>← Ver todos os artigos</Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
