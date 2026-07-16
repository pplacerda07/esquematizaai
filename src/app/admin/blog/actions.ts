'use server';

import { revalidatePath } from 'next/cache';
import { criarSupabaseServer } from '@/lib/supabase/server';

export type ResultadoPost = { ok: boolean; erro?: string; slug?: string };

/** Gera slug a partir do título (sem acento, minúsculo, com hifens). */
function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// revalida as páginas que mostram posts para o novo conteúdo aparecer na hora
function revalidarBlog() {
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}

/**
 * Cria (sem id) ou atualiza (com id) um post. Slug é derivado do título;
 * publicado_em é preenchido na primeira vez que vira "publicado".
 */
export async function salvarPost(formData: FormData): Promise<ResultadoPost> {
  const supabase = await criarSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: 'Sessão expirada. Faça login de novo.' };

  const id = String(formData.get('id') ?? '').trim();
  const titulo = String(formData.get('titulo') ?? '').trim();
  const resumo = String(formData.get('resumo') ?? '').trim();
  const conteudo = String(formData.get('conteudo') ?? '').trim();
  const categoria = String(formData.get('categoria') ?? 'Dicas').trim();
  const autor = String(formData.get('autor') ?? 'Equipe Esquematiza Aí').trim();
  const capa_url = String(formData.get('capa_url') ?? '').trim() || null;
  const status = String(formData.get('status') ?? 'rascunho') === 'publicado' ? 'publicado' : 'rascunho';

  if (!titulo) return { ok: false, erro: 'O título é obrigatório.' };

  const slug = slugify(titulo);

  if (id) {
    // update. Se está publicando agora e ainda não tinha data, marca publicado_em.
    const { data: atual } = await supabase.from('posts').select('publicado_em').eq('id', id).maybeSingle();
    const publicado_em =
      status === 'publicado' ? atual?.publicado_em ?? new Date().toISOString() : atual?.publicado_em ?? null;

    const { error } = await supabase
      .from('posts')
      .update({ slug, titulo, resumo, conteudo, categoria, autor, capa_url, status, publicado_em })
      .eq('id', id);

    if (error) return { ok: false, erro: traduzErro(error.message) };
  } else {
    const publicado_em = status === 'publicado' ? new Date().toISOString() : null;
    const { error } = await supabase
      .from('posts')
      .insert({ slug, titulo, resumo, conteudo, categoria, autor, capa_url, status, publicado_em });

    if (error) return { ok: false, erro: traduzErro(error.message) };
  }

  revalidarBlog();
  return { ok: true, slug };
}

export async function excluirPost(id: string): Promise<ResultadoPost> {
  const supabase = await criarSupabaseServer();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { ok: false, erro: error.message };
  revalidarBlog();
  return { ok: true };
}

/** Alterna publicado <-> rascunho direto da lista. */
export async function alternarPublicacao(id: string, novoStatus: 'publicado' | 'rascunho'): Promise<ResultadoPost> {
  const supabase = await criarSupabaseServer();

  const patch: Record<string, unknown> = { status: novoStatus };
  if (novoStatus === 'publicado') {
    const { data: atual } = await supabase.from('posts').select('publicado_em').eq('id', id).maybeSingle();
    patch.publicado_em = atual?.publicado_em ?? new Date().toISOString();
  }

  const { error } = await supabase.from('posts').update(patch).eq('id', id);
  if (error) return { ok: false, erro: error.message };
  revalidarBlog();
  return { ok: true };
}

function traduzErro(msg: string): string {
  if (msg.includes('duplicate key') && msg.includes('slug')) {
    return 'Já existe um artigo com um título muito parecido. Mude um pouco o título.';
  }
  return msg;
}
