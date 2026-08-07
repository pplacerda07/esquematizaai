import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getNoticiaPorSlug, getSlugsNoticias, formatarData } from '@/lib/blog';
import { SITE_URL } from '@/config';
import { jsonLdSeguro } from '@/lib/json-ld';
import styles from './styles.module.css';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getSlugsNoticias();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const noticia = await getNoticiaPorSlug(slug);
  if (!noticia) return { title: 'Notícia não encontrada | Esquematiza Aí' };

  const descricao = noticia.resumo ?? `${noticia.titulo} — Esquematiza Aí.`;
  const url = `${SITE_URL}/noticias/${noticia.slug}`;

  return {
    title: `${noticia.titulo} | Esquematiza Aí`,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      title: noticia.titulo,
      description: descricao,
      url,
      type: 'article',
      publishedTime: noticia.publicado_em,
      authors: [noticia.autor],
      images: noticia.capa_url ? [{ url: noticia.capa_url }] : undefined,
    },
  };
}

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const noticia = await getNoticiaPorSlug(slug);
  if (!noticia) notFound();

  const url = `${SITE_URL}/noticias/${noticia.slug}`;

  // NewsArticle: o schema que o Google e os motores de IA esperam de uma matéria.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: noticia.titulo,
    description: noticia.resumo ?? undefined,
    datePublished: noticia.publicado_em,
    dateModified: noticia.atualizado_em,
    author: { '@type': 'Organization', name: noticia.autor },
    publisher: { '@type': 'Organization', name: 'Esquematiza Aí', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(noticia.capa_url ? { image: noticia.capa_url } : {}),
  };

  return (
    <main className={styles.main}>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      <article className={styles.article}>
        <nav className={styles.breadcrumb} aria-label="Você está em">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <Link href="/noticias">Notícias</Link>
        </nav>

        <header className={styles.header}>
          <span className={styles.badge}>Notícia</span>
          <h1 className={styles.title}>{noticia.titulo}</h1>
          {noticia.resumo && <p className={styles.linhaFina}>{noticia.resumo}</p>}
          <div className={styles.meta}>
            <span className={styles.autor}>{noticia.autor}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={noticia.publicado_em}>{formatarData(noticia.publicado_em)}</time>
          </div>
        </header>

        {noticia.capa_url && (
          <div className={styles.capaWrap}>
            <Image
              src={noticia.capa_url}
              alt={`Imagem da notícia ${noticia.titulo}`}
              width={1200}
              height={630}
              priority
              className={styles.capa}
            />
          </div>
        )}

        {noticia.conteudo && (
          <div className={styles.conteudo}>
            <ReactMarkdown>{noticia.conteudo}</ReactMarkdown>
          </div>
        )}

        {noticia.url_fonte && (
          <aside className={styles.fonteBox}>
            <span className={styles.fonteLabel}>Fonte consultada</span>
            <a
              className={styles.fonteLink}
              href={noticia.url_fonte}
              target="_blank"
              rel="noopener noreferrer"
            >
              {noticia.fonte ?? 'Ver matéria original'} →
            </a>
          </aside>
        )}

        <div className={styles.ctaEstudo}>
          <p className={styles.ctaTexto}>
            Quer transformar essa notícia em aprovação? Comece pelos materiais de revisão que
            já prepararam mais de 30 mil alunos.
          </p>
          <Link href="/#vitrine" className={styles.ctaBtn}>Ver materiais →</Link>
        </div>

        <div className={styles.footerNav}>
          <Link href="/noticias" className={styles.voltar}>← Todas as notícias</Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
