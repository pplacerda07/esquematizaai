import { criarSupabaseServer } from '@/lib/supabase/server';
import type { Post, PostResumo, NoticiaCompleta } from '@/lib/blog';

/**
 * Consultas do PAINEL (usuário autenticado). Diferente de lib/blog.ts, aqui o cliente
 * carrega a sessão do admin, então enxerga também rascunhos.
 */

const CAMPOS_LISTA =
  'id, slug, titulo, resumo, categoria, capa_url, autor, status, publicado_em, criado_em, atualizado_em';

/** Todos os posts (publicados e rascunhos), mais recentes primeiro. */
export async function listarPostsAdmin(): Promise<PostResumo[]> {
  const supabase = await criarSupabaseServer();
  const { data, error } = await supabase
    .from('posts')
    .select(CAMPOS_LISTA)
    .order('atualizado_em', { ascending: false });

  if (error) {
    console.error('[admin] erro ao listar posts:', error.message);
    return [];
  }
  return (data ?? []) as PostResumo[];
}

/** Todas as notícias (publicadas e rascunhos), mais recentes primeiro. */
export async function listarNoticiasAdmin(): Promise<NoticiaCompleta[]> {
  const supabase = await criarSupabaseServer();
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .order('publicado_em', { ascending: false });

  if (error) {
    console.error('[admin] erro ao listar notícias:', error.message);
    return [];
  }
  return (data ?? []) as NoticiaCompleta[];
}

/** Um post completo por id (para editar), independente do status. */
export async function getPostAdmin(id: string): Promise<Post | null> {
  const supabase = await criarSupabaseServer();
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('[admin] erro ao buscar post:', error.message);
    return null;
  }
  return (data as Post) ?? null;
}
