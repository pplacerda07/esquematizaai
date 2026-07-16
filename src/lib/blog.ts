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
}

/** Manchetes de concursos (curadoria), mais novas primeiro. */
export async function getNoticias(limite?: number): Promise<Noticia[]> {
  let query = supabase
    .from('noticias')
    .select('id, titulo, url_fonte, fonte, publicado_em')
    .order('publicado_em', { ascending: false });

  if (limite) query = query.limit(limite);

  const { data, error } = await query;
  if (error) {
    console.error('[blog] erro ao listar notícias:', error.message);
    return [];
  }
  return (data ?? []) as Noticia[];
}
