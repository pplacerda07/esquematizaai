import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/'], // painel não deve ser indexado
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
