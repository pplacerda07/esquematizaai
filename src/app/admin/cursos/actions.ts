'use server';

import { revalidatePath } from 'next/cache';
import { criarSupabaseServer } from '@/lib/supabase/server';
import { exigirAdmin } from '@/lib/supabase/admin-guard';

export type Resultado = { ok: boolean; erro?: string };

function revalidarTudo() {
  revalidatePath('/vitrine/produto/[id]', 'page');
  revalidatePath('/admin/cursos');
}

/**
 * Grava as disciplinas escolhidas para um curso.
 *
 * Apaga e repõe, porque é uma lista: descobrir o que entrou e o que saiu para
 * fazer dois lotes de comando custaria mais do que reescrever algumas dezenas
 * de linhas.
 *
 * Lista vazia apaga o vínculo e o curso volta a seguir a regra automática. É de
 * propósito: é o caminho de volta para quem mexeu e se arrependeu.
 */
export async function salvarDisciplinasDoCurso(formData: FormData): Promise<Resultado> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const produto_id = String(formData.get('produto_id') ?? '').trim();
  if (!produto_id) return { ok: false, erro: 'Curso não identificado.' };

  const escolhidas = formData.getAll('disciplina').map(String).filter(Boolean);

  const supabase = await criarSupabaseServer();

  const { error: erroApagar } = await supabase
    .from('curso_disciplinas')
    .delete()
    .eq('produto_id', produto_id);
  if (erroApagar) return { ok: false, erro: 'Não foi possível salvar: ' + erroApagar.message };

  if (escolhidas.length > 0) {
    const { error } = await supabase.from('curso_disciplinas').insert(
      escolhidas.map((disciplina_id, i) => ({ produto_id, disciplina_id, ordem: i })),
    );
    if (error) return { ok: false, erro: 'Não foi possível salvar: ' + error.message };
  }

  revalidarTudo();
  return { ok: true };
}

/** volta o curso para a regra automática */
export async function limparDisciplinasDoCurso(formData: FormData): Promise<Resultado> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const produto_id = String(formData.get('produto_id') ?? '').trim();
  if (!produto_id) return { ok: false, erro: 'Curso não identificado.' };

  const supabase = await criarSupabaseServer();
  const { error } = await supabase.from('curso_disciplinas').delete().eq('produto_id', produto_id);
  if (error) return { ok: false, erro: error.message };

  revalidarTudo();
  return { ok: true };
}
