import { createClient } from '@supabase/supabase-js';
import { produtos, ofertaAtual, type Produto, type Oferta } from '@/data/catalogo';

/**
 * Aplica no catálogo os ajustes feitos no painel.
 *
 * O catálogo (107 produtos) continua vindo da planilha do Sérgio. Esta camada
 * lê a tabela produtos_ajustes e sobrepõe o que foi editado no admin: preço,
 * descrição, produto oculto e produto em destaque.
 *
 * Se o Supabase estiver fora do ar, devolve o catálogo da planilha sem ajuste
 * nenhum. A loja continua vendendo: é melhor mostrar o preço da planilha do
 * que derrubar a vitrine porque o banco não respondeu.
 */

export interface Ajuste {
  produto_id: string;
  preco: number | null;
  descricao: string | null;
  oculto: boolean;
  destaque: boolean;
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHAVE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function buscarAjustes(): Promise<Map<string, Ajuste>> {
  if (!URL || !CHAVE) return new Map();

  try {
    const supabase = createClient(URL, CHAVE, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('produtos_ajustes')
      .select('produto_id, preco, descricao, oculto, destaque');

    if (error) {
      console.error('[catalogo] ajustes indisponíveis:', error.message);
      return new Map();
    }
    return new Map((data ?? []).map((a) => [a.produto_id as string, a as unknown as Ajuste]));
  } catch (e) {
    console.error('[catalogo] ajustes indisponíveis:', (e as Error).message);
    return new Map();
  }
}

/** Produto com o ajuste já aplicado por cima da planilha. */
function aplicar(p: Produto, a: Ajuste | undefined): Produto {
  if (!a) return p;
  return {
    ...p,
    precos: a.preco != null ? { ...p.precos, cheio: a.preco, black: null } : p.precos,
    sobre: a.descricao ?? p.sobre,
    // ajuste de preço invalida o checkout Black, que cobra o valor antigo;
    // sem isso o site mostraria o preço novo com o link do preço velho
    checkouts: a.preco != null ? { ...p.checkouts, black: null } : p.checkouts,
  };
}

export interface ProdutoAjustado {
  produto: Produto;
  oferta: Oferta;
  destaque: boolean;
}

/**
 * Catálogo pronto para a vitrine: sem os ocultos, com preço e descrição já
 * ajustados, e sinalizando quais foram marcados como destaque no painel.
 */
export async function catalogoParaVitrine(): Promise<ProdutoAjustado[]> {
  const ajustes = await buscarAjustes();
  const saida: ProdutoAjustado[] = [];

  for (const p of produtos) {
    const a = ajustes.get(p.id);
    if (a?.oculto) continue;
    if (p.categoria === 'oferta-personalizada' || p.status === 'inativo') continue;

    const ajustado = aplicar(p, a);
    const oferta = ofertaAtual(ajustado);
    if (!oferta) continue;

    saida.push({ produto: ajustado, oferta, destaque: Boolean(a?.destaque) });
  }

  return saida;
}

/** Um produto com ajuste, para a página dele. null = oculto ou inexistente. */
export async function produtoAjustado(id: string): Promise<ProdutoAjustado | null> {
  const base = produtos.find((p) => p.id === id || p.idEduzz === id);
  if (!base) return null;

  const ajustes = await buscarAjustes();
  const a = ajustes.get(base.id);
  if (a?.oculto) return null;

  const ajustado = aplicar(base, a);
  const oferta = ofertaAtual(ajustado);
  if (!oferta) return null;

  return { produto: ajustado, oferta, destaque: Boolean(a?.destaque) };
}
