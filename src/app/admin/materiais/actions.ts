'use server';

import { revalidatePath } from 'next/cache';
import { criarSupabaseServer } from '@/lib/supabase/server';
import { exigirAdmin } from '@/lib/supabase/admin-guard';

export type ResultadoAjuste = { ok: boolean; erro?: string };

/**
 * Ajustes de produto feitos no painel.
 *
 * O catálogo continua vindo da planilha do Sérgio. Aqui grava-se SÓ o que for
 * alterado, na tabela produtos_ajustes. Se os dois fossem fonte de verdade,
 * reimportar a planilha apagaria em silêncio o que foi editado no painel.
 */

function revalidarLoja() {
  revalidatePath('/');
  revalidatePath('/vitrine');
  revalidatePath('/admin/materiais');
}

export async function salvarAjuste(formData: FormData): Promise<ResultadoAjuste> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const supabase = await criarSupabaseServer();

  const produto_id = String(formData.get('produto_id') ?? '').trim();
  if (!produto_id) return { ok: false, erro: 'Produto não identificado.' };

  const precoTexto = String(formData.get('preco') ?? '').trim().replace(',', '.');
  const preco = precoTexto ? Number(precoTexto) : null;
  if (precoTexto && (Number.isNaN(preco) || preco! <= 0)) {
    return { ok: false, erro: 'Preço inválido. Use apenas números, por exemplo 597 ou 597,00.' };
  }

  const descricao = String(formData.get('descricao') ?? '').trim() || null;
  const observacao = String(formData.get('observacao') ?? '').trim() || null;
  const oculto = String(formData.get('oculto') ?? '') === 'on';
  const destaque = String(formData.get('destaque') ?? '') === 'on';

  const { error } = await supabase.from('produtos_ajustes').upsert(
    {
      produto_id,
      preco,
      descricao,
      observacao,
      oculto,
      destaque,
      atualizado_por: permissao.email,
    },
    { onConflict: 'produto_id' },
  );

  if (error) return { ok: false, erro: error.message };

  revalidarLoja();
  return { ok: true };
}

/** Devolve o produto ao que a planilha diz, apagando o ajuste inteiro. */
export async function limparAjuste(produto_id: string): Promise<ResultadoAjuste> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const supabase = await criarSupabaseServer();
  const { error } = await supabase.from('produtos_ajustes').delete().eq('produto_id', produto_id);
  if (error) return { ok: false, erro: error.message };
  revalidarLoja();
  return { ok: true };
}
