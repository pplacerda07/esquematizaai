'use server';

import { revalidatePath } from 'next/cache';
import { criarSupabaseServer } from '@/lib/supabase/server';
import { exigirAdmin } from '@/lib/supabase/admin-guard';

export type Resultado = { ok: boolean; erro?: string };

/**
 * Edição dos sumários pelo painel.
 *
 * SALVAR ADOTA A DISCIPLINA. A partir do primeiro salvamento, `adotada_em` fica
 * preenchido e as reimportações da planilha param de mexer NAQUELA disciplina.
 * É o que permite as duas fontes conviverem enquanto a migração acontece: o
 * Sérgio migra no ritmo dele, uma disciplina por vez, sem que a planilha desfaça
 * o trabalho dele pelas costas.
 *
 * O caminho de volta existe: devolverParaPlanilha apaga os tópicos do banco e
 * limpa a marca, e a disciplina volta a seguir a planilha.
 */

function revalidarTudo() {
  // o sumário aparece na página de cada produto
  revalidatePath('/vitrine/produto/[id]', 'page');
  revalidatePath('/admin/sumarios');
  revalidatePath('/admin/cursos');
}

/** uma linha por tópico, na ordem em que a pessoa escreveu */
function emLinhas(texto: string): string[] {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function salvarSumario(formData: FormData): Promise<Resultado> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { ok: false, erro: 'Disciplina não identificada.' };

  const topicos = emLinhas(String(formData.get('topicos') ?? ''));
  if (topicos.length === 0) {
    return {
      ok: false,
      erro: 'O sumário está vazio. Para voltar ao da planilha, use o botão "devolver para a planilha".',
    };
  }

  const area = String(formData.get('area') ?? '').trim() || null;

  const medidaTexto = String(formData.get('medida') ?? '').trim();
  const medida = medidaTexto ? Number(medidaTexto) : null;
  if (medidaTexto && (Number.isNaN(medida) || medida! < 0)) {
    return { ok: false, erro: 'Páginas ou cards deve ser um número.' };
  }
  const formato = String(formData.get('formato') ?? '');

  const supabase = await criarSupabaseServer();

  const { error: erroDisciplina } = await supabase
    .from('disciplinas')
    .update({
      area,
      paginas: formato === 'Resumo' ? medida : null,
      cards: formato === 'Flashcards' ? medida : null,
      adotada_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      atualizado_por: permissao.email,
    })
    .eq('id', id);

  if (erroDisciplina) return { ok: false, erro: 'Não foi possível salvar: ' + erroDisciplina.message };

  // apaga e repõe: é uma lista ordenada, e comparar item a item para descobrir
  // o que mudou custaria mais do que reescrever as poucas dezenas de linhas
  const { error: erroApagar } = await supabase
    .from('disciplina_topicos')
    .delete()
    .eq('disciplina_id', id);
  if (erroApagar) return { ok: false, erro: 'Não foi possível salvar: ' + erroApagar.message };

  const { error: erroInserir } = await supabase
    .from('disciplina_topicos')
    .insert(topicos.map((texto, i) => ({ disciplina_id: id, ordem: i + 1, texto })));
  if (erroInserir) return { ok: false, erro: 'Não foi possível salvar: ' + erroInserir.message };

  revalidarTudo();
  return { ok: true };
}

/**
 * Desfaz a adoção: a disciplina volta a seguir a planilha.
 *
 * Existe porque adotar é fácil de fazer sem querer, e sem volta o Sérgio
 * ficaria preso mantendo à mão uma disciplina que ele só queria espiar.
 */
export async function devolverParaPlanilha(formData: FormData): Promise<Resultado> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { ok: false, erro: 'Disciplina não identificada.' };

  const supabase = await criarSupabaseServer();

  const { error: erroApagar } = await supabase
    .from('disciplina_topicos')
    .delete()
    .eq('disciplina_id', id);
  if (erroApagar) return { ok: false, erro: erroApagar.message };

  const { error } = await supabase
    .from('disciplinas')
    .update({
      adotada_em: null,
      atualizado_em: new Date().toISOString(),
      atualizado_por: permissao.email,
    })
    .eq('id', id);

  if (error) return { ok: false, erro: error.message };

  revalidarTudo();
  return { ok: true };
}

/**
 * Taguear a disciplina por área, sem adotar o sumário dela.
 *
 * O Sérgio pediu as duas coisas separadas, e são mesmo: dá para querer
 * organizar as 46 disciplinas que estão sem área hoje sem ter a menor intenção
 * de reescrever o sumário delas.
 */
export async function salvarArea(formData: FormData): Promise<Resultado> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { ok: false, erro: 'Disciplina não identificada.' };

  const area = String(formData.get('area') ?? '').trim() || null;

  const supabase = await criarSupabaseServer();
  const { error } = await supabase
    .from('disciplinas')
    .update({
      area,
      atualizado_em: new Date().toISOString(),
      atualizado_por: permissao.email,
    })
    .eq('id', id);

  if (error) return { ok: false, erro: error.message };

  revalidarTudo();
  return { ok: true };
}
