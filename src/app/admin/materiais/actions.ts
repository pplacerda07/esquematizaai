'use server';

import { revalidatePath } from 'next/cache';
import { criarSupabaseServer } from '@/lib/supabase/server';
import { exigirAdmin } from '@/lib/supabase/admin-guard';
import { enviarImagem } from '@/lib/supabase/enviar-imagem';

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

/**
 * Cria um material que ainda não existe na planilha.
 *
 * Hoje produto novo depende de mandar a planilha e rodar a importação, e nesta
 * semana isso deixou material lançado dias fora do ar. Aqui o Sérgio cadastra e
 * a vitrine pega em até um minuto.
 *
 * A PLANILHA GANHA QUANDO ALCANÇAR: quando o mesmo produto vier nela, casado
 * pelo checkout ou pela página de vendas, o daqui sai da vitrine sozinho. Por
 * isso a validação abaixo recusa checkout ou página que já pertençam a alguém.
 */
export async function criarMaterial(formData: FormData): Promise<ResultadoAjuste> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const nome = String(formData.get('nome') ?? '').trim();
  if (!nome) return { ok: false, erro: 'Escreva o nome do material.' };

  const categoria = String(formData.get('categoria') ?? '').trim();
  if (!['assinatura', 'combo', 'isolado'].includes(categoria)) {
    return { ok: false, erro: 'Escolha se é assinatura, combo ou material isolado.' };
  }

  const precoTexto = String(formData.get('preco') ?? '').trim().replace(/\./g, '').replace(',', '.');
  const preco = Number(precoTexto);
  if (!precoTexto || Number.isNaN(preco) || preco <= 0) {
    return { ok: false, erro: 'Preço inválido. Use apenas números, por exemplo 597 ou 597,00.' };
  }

  const deTexto = String(formData.get('preco_de') ?? '').trim().replace(/\./g, '').replace(',', '.');
  const precoDe = deTexto ? Number(deTexto) : null;
  if (deTexto && (Number.isNaN(precoDe) || precoDe! <= preco)) {
    return {
      ok: false,
      erro: 'O preço "de" precisa ser MAIOR que o preço de venda, senão o desconto vira piada.',
    };
  }

  const checkout = String(formData.get('checkout') ?? '').trim() || null;
  const urlSite = String(formData.get('url_site') ?? '').trim() || null;
  if (!checkout && !urlSite) {
    return {
      ok: false,
      erro: 'Falta o caminho de compra: o link da Eduzz ou o link da página de vendas. Sem um dos dois o botão não teria para onde ir.',
    };
  }

  const paraLink = (v: string | null) => {
    if (!v) return null;
    if (!/^https?:\/\//i.test(v)) return `https://${v}`;
    return v;
  };

  const supabase = await criarSupabaseServer();

  // o id é o endereço da página; sai do nome, como na planilha
  const id = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  if (!id) return { ok: false, erro: 'O nome precisa ter letras ou números.' };

  const { error } = await supabase.from('produtos_novos').insert({
    id,
    nome,
    categoria,
    area: String(formData.get('area') ?? '').trim() || null,
    ferramenta: String(formData.get('ferramenta') ?? '').trim() || null,
    formato: String(formData.get('formato') ?? '').trim() || null,
    preco,
    preco_de: precoDe,
    checkout: paraLink(checkout),
    url_site: paraLink(urlSite),
    capa_url: String(formData.get('capa_url') ?? '').trim() || null,
    capa_largura: Number(formData.get('capa_largura')) || null,
    capa_altura: Number(formData.get('capa_altura')) || null,
    descricao: String(formData.get('descricao') ?? '').trim() || null,
    atualizado_por: permissao.email,
  });

  if (error) {
    if (error.code === '23505') {
      return { ok: false, erro: `Já existe um material com o endereço "${id}". Mude o nome.` };
    }
    return { ok: false, erro: 'Não foi possível cadastrar: ' + error.message };
  }

  revalidarLoja();
  return { ok: true };
}

/** Apaga um material criado no painel. Não mexe nos que vêm da planilha. */
export async function apagarMaterialDoPainel(id: string): Promise<ResultadoAjuste> {
  const permissao = await exigirAdmin();
  if (!permissao.ok) return { ok: false, erro: permissao.erro };

  const supabase = await criarSupabaseServer();
  const { error } = await supabase.from('produtos_novos').delete().eq('id', id);
  if (error) return { ok: false, erro: error.message };

  revalidarLoja();
  return { ok: true };
}

/**
 * Envia a capa e devolve a URL pública.
 *
 * Fica aqui porque o formulário de material é quem chama, mas o trabalho todo é
 * de lib/supabase/enviar-imagem, que o blog vai usar igual quando chegar a vez
 * dele: mesma função, só mudando a pasta.
 */
export async function enviarCapa(formData: FormData) {
  const pasta = String(formData.get('pasta') ?? 'produtos');
  return enviarImagem(pasta === 'blog' ? 'blog' : 'produtos', formData, 'imagem');
}
