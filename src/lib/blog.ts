import { createClient } from '@supabase/supabase-js';

// Cliente Supabase de LEITURA pública (chave publishable; o RLS do banco só devolve
// posts publicados). Toda a UI pública do blog importa daqui.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export interface Post {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  conteudo: string;
  categoria: string;
  capa_url: string | null;
  autor: string;
  status: 'rascunho' | 'publicado';
  publicado_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

/** Resumo de post para listagens (sem o corpo, mais leve). */
export type PostResumo = Omit<Post, 'conteudo'>;

const CAMPOS_LISTA =
  'id, slug, titulo, resumo, categoria, capa_url, autor, status, publicado_em, criado_em, atualizado_em';

/** Posts publicados, do mais novo para o mais antigo. `limite` opcional. */
export async function getPostsPublicados(limite?: number): Promise<PostResumo[]> {
  let query = supabase
    .from('posts')
    .select(CAMPOS_LISTA)
    .eq('status', 'publicado')
    .order('publicado_em', { ascending: false });

  if (limite) query = query.limit(limite);

  const { data, error } = await query;
  if (error) {
    console.error('[blog] erro ao listar posts:', error.message);
    return [];
  }
  return (data ?? []) as PostResumo[];
}

/** Um post publicado pelo slug (para /blog/[slug]). null se não existir. */
export async function getPostPorSlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'publicado')
    .maybeSingle();

  if (error) {
    console.error('[blog] erro ao buscar post:', error.message);
    return null;
  }
  return (data as Post) ?? null;
}

/** Slugs de todos os posts publicados (para generateStaticParams). */
export async function getSlugsPublicados(): Promise<string[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'publicado');

  if (error) {
    console.error('[blog] erro ao listar slugs:', error.message);
    return [];
  }
  return (data ?? []).map((p) => p.slug as string);
}

/** Data de publicação formatada em pt-BR (ex.: "12 de julho de 2026"). */
export function formatarData(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Data curta para cards de notícia (ex.: "14/07"). */
export function formatarDataCurta(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export interface Noticia {
  id: string;
  titulo: string;
  url_fonte: string | null;
  fonte: string | null;
  publicado_em: string;
  /** preenchido só em matéria própria; sem slug, a notícia leva para a fonte externa */
  slug: string | null;
  resumo: string | null;
  capa_url: string | null;
  autor: string;
  atualizado_em: string;
}

export interface NoticiaCompleta extends Noticia {
  conteudo: string | null;
}

const CAMPOS_NOTICIA =
  'id, titulo, url_fonte, fonte, publicado_em, slug, resumo, capa_url, autor, atualizado_em';

/** Notícias publicadas (matérias próprias + curadoria), mais novas primeiro. */
export async function getNoticias(limite?: number): Promise<Noticia[]> {
  let query = supabase
    .from('noticias')
    .select(CAMPOS_NOTICIA)
    .eq('status', 'publicado')
    .order('publicado_em', { ascending: false });

  if (limite) query = query.limit(limite);

  const { data, error } = await query;
  if (error) {
    console.error('[blog] erro ao listar notícias:', error.message);
    return [];
  }
  return (data ?? []) as Noticia[];
}

/**
 * Para onde o card da notícia aponta. SEMPRE interno.
 *
 * Antes, notícia sem matéria própria mandava o leitor para a fonte original.
 * Isso entregava de graça o tráfego que o site quer reter e, para SEO/GEO,
 * apontava a autoridade do assunto para o concorrente. Hoje, notícia sem
 * página nossa simplesmente não vira card (ver `getNoticiasComPagina`).
 */
export function destinoDaNoticia(n: Noticia): { href: string; externo: boolean } {
  return { href: n.slug ? `/noticias/${n.slug}` : '/noticias', externo: false };
}

/** Item de conteúdo próprio, venha da tabela de notícias ou da de posts. */
export interface ItemProprio {
  id: string;
  titulo: string;
  href: string;
  publicado_em: string | null;
  categoria: string | null;
}

/**
 * Todo o conteúdo PRÓPRIO publicado, das duas tabelas, do mais novo para o mais
 * antigo. É a fonte do bloco "Últimas notícias" da home: os artigos que o time
 * publica são as notícias, e nada aqui leva para fora do site.
 */
export async function getConteudoProprio(limite?: number): Promise<ItemProprio[]> {
  const [noticias, posts] = await Promise.all([getNoticias(), getPostsPublicados()]);

  const itens: ItemProprio[] = [
    // só notícias com matéria própria: as de curadoria não têm página nossa
    ...noticias
      .filter((n) => n.slug)
      .map((n) => ({
        id: `noticia-${n.id}`,
        titulo: n.titulo,
        href: `/noticias/${n.slug}`,
        publicado_em: n.publicado_em,
        categoria: n.fonte,
      })),
    ...posts.map((p) => ({
      id: `post-${p.id}`,
      titulo: p.titulo,
      href: `/blog/${p.slug}`,
      publicado_em: p.publicado_em,
      categoria: p.categoria,
    })),
  ];

  itens.sort((a, b) => (b.publicado_em ?? '').localeCompare(a.publicado_em ?? ''));
  return limite ? itens.slice(0, limite) : itens;
}

/** Matéria própria pelo slug (para /noticias/[slug]). */
export async function getNoticiaPorSlug(slug: string): Promise<NoticiaCompleta | null> {
  const { data, error } = await supabase
    .from('noticias')
    .select(`${CAMPOS_NOTICIA}, conteudo`)
    .eq('slug', slug)
    .eq('status', 'publicado')
    .maybeSingle();

  if (error) {
    console.error('[blog] erro ao buscar notícia:', error.message);
    return null;
  }
  return (data as NoticiaCompleta) ?? null;
}

/** Slugs das matérias próprias publicadas (generateStaticParams + sitemap). */
export async function getSlugsNoticias(): Promise<string[]> {
  const { data, error } = await supabase
    .from('noticias')
    .select('slug')
    .eq('status', 'publicado')
    .not('slug', 'is', null);

  if (error) {
    console.error('[blog] erro ao listar slugs de notícia:', error.message);
    return [];
  }
  return (data ?? []).map((n) => n.slug as string);
}
