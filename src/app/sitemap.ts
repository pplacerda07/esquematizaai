import type { MetadataRoute } from 'next';
import { getPostsPublicados, getNoticias } from '@/lib/blog';
import { catalogoParaVitrine } from '@/lib/catalogo-ajustes';
import { AREAS } from '@/components/Navbar/areas';
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

  const [posts, noticias, catalogo] = await Promise.all([
    getPostsPublicados(),
    getNoticias(),
    catalogoParaVitrine(),
  ]);

  /**
   * Páginas de produto e de área.
   *
   * Sem elas o sitemap tinha 46 endereços, todos de blog e notícia, e nenhum do
   * que a empresa vende. Medido em 10/09: das 115 páginas de produto no ar, o
   * robô alcançava 50 seguindo link. As outras 65 eram órfãs, não por serem mal
   * feitas (cada uma sai do servidor com H1, nome e preço) mas porque nada
   * apontava para elas: a /vitrine monta o catálogo no navegador, então o HTML
   * que o Google recebe não tem nome de produto nenhum.
   *
   * A fonte é catalogoParaVitrine(), a mesma da vitrine, e isso importa: ela já
   * aplica o que o Sérgio ocultou no painel. Listar produto oculto aqui seria
   * entregar 404 ao Google, porque a página dele deixa de existir.
   */
  const vistos = new Set<string>();
  const paginasProduto: MetadataRoute.Sitemap = catalogo
    // produtos gêmeos (mesmo nome em cadastros Eduzz diferentes) viram um
    // endereço só: dois iguais no sitemap disputam a mesma busca entre si
    .filter(({ produto }) => (vistos.has(produto.nome) ? false : (vistos.add(produto.nome), true)))
    .map(({ produto }) => ({
      url: `${SITE_URL}/vitrine/produto/${produto.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // só área que tem produto: página vazia no sitemap é conteúdo magro,
  // e hoje /vitrine/inss não lista nada
  const comProduto = new Set(catalogo.map(({ produto }) => produto.area));
  const paginasArea: MetadataRoute.Sitemap = AREAS.filter(
    (a) => a.catalogoArea && comProduto.has(a.catalogoArea),
  ).map((a) => ({
    url: `${SITE_URL}/vitrine/${a.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

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

  return [...paginasFixas, ...paginasArea, ...paginasProduto, ...paginasBlog, ...paginasNoticias];
}
