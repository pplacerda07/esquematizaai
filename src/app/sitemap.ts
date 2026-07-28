import type { MetadataRoute } from 'next';
import { getPostsPublicados, getNoticias } from '@/lib/blog';
import { SITE_URL } from '@/config';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginasFixas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/vitrine`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/mentoria`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/noticias`, changeFrequency: 'daily', priority: 0.8 },
  ];

  const [posts, noticias] = await Promise.all([getPostsPublicados(), getNoticias()]);

  const paginasBlog: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.atualizado_em,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // só as matérias próprias entram (curadoria aponta para fora)
  const paginasNoticias: MetadataRoute.Sitemap = noticias
    .filter((n) => n.slug)
    .map((n) => ({
      url: `${SITE_URL}/noticias/${n.slug}`,
      lastModified: n.atualizado_em,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [...paginasFixas, ...paginasBlog, ...paginasNoticias];
}
