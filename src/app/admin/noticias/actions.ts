'use server';

import { revalidatePath } from 'next/cache';
import { criarSupabaseServer } from '@/lib/supabase/server';

export type ResultadoNoticia = { ok: boolean; erro?: string; slug?: string };

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// as notícias aparecem na home, na listagem e na própria matéria
function revalidarNoticias() {
  revalidatePath('/');
  revalidatePath('/noticias');
  revalidatePath('/admin/noticias');
}

/**
 * Cria (sem id) ou atualiza (com id) uma notícia.
 *
 * Toda notícia daqui nasce com slug e conteúdo, ou seja, com página própria.
 * O site não tem mais notícia que joga o leitor para fora: se ela não tem
 * matéria nossa, não aparece em lugar nenhum.
 */
export async function salvarNoticia(formData: FormData): Promise<ResultadoNoticia> {
  const supabase = await criarSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: 'Sessão expirada. Faça login de novo.' };

  const id = String(formData.get('id') ?? '').trim();
  const titulo = String(formData.get('titulo') ?? '').trim();
  const resumo = String(formData.get('resumo') ?? '').trim();
  const conteudo = String(formData.get('conteudo') ?? '').trim();
  const fonte = String(formData.get('fonte') ?? '').trim() || null;
  const url_fonte = String(formData.get('url_fonte') ?? '').trim() || null;
  const autor = String(formData.get('autor') ?? '').trim() || 'Redação Esquematiza Aí';
  const capa_url = String(formData.get('capa_url') ?? '').trim() || null;
  const status = String(formData.get('status') ?? 'rascunho') === 'publicado' ? 'publicado' : 'rascunho';

  if (!titulo) return { ok: false, erro: 'O título é obrigatório.' };
  if (!resumo) return { ok: false, erro: 'O resumo é obrigatório: é ele que aparece no Google e no card da home.' };
  if (!conteudo) {
    return {
      ok: false,
      erro: 'O texto da matéria é obrigatório. Notícia sem texto vira uma página vazia indexada pelo Google.',
    };
  }

  const slugManual = String(formData.get('slug') ?? '').trim();
  const slug = slugManual ? slugify(slugManual) : slugify(titulo);

  const campos = { slug, titulo, resumo, conteudo, fonte, url_fonte, autor, capa_url, status };

  if (id) {
    const { error } = await supabase.from('noticias').update(campos).eq('id', id);
    if (error) return { ok: false, erro: traduzErro(error.message) };
  } else {
    const { error } = await supabase
      .from('noticias')
      .insert({ ...campos, publicado_em: new Date().toISOString() });
    if (error) return { ok: false, erro: traduzErro(error.message) };
  }

  revalidarNoticias();
  return { ok: true, slug };
}

export async function excluirNoticia(id: string): Promise<ResultadoNoticia> {
  const supabase = await criarSupabaseServer();
  const { error } = await supabase.from('noticias').delete().eq('id', id);
  if (error) return { ok: false, erro: error.message };
  revalidarNoticias();
  return { ok: true };
}

export async function alternarPublicacaoNoticia(
  id: string,
  novoStatus: 'publicado' | 'rascunho',
): Promise<ResultadoNoticia> {
  const supabase = await criarSupabaseServer();
  const { error } = await supabase.from('noticias').update({ status: novoStatus }).eq('id', id);
  if (error) return { ok: false, erro: error.message };
  revalidarNoticias();
  return { ok: true };
}

function traduzErro(msg: string): string {
  if (msg.includes('duplicate key') && msg.includes('slug')) {
    return 'Já existe uma notícia com um título muito parecido. Mude um pouco o título.';
  }
  return msg;
}
