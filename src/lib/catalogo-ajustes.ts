import { createClient } from '@supabase/supabase-js';
import { produtos, ofertaAtual, type Produto, type Oferta } from '@/data/catalogo';
import {
  lerProdutosDoPainel,
  somenteOsQueFaltam,
  capasDoPainel,
  referenciasDoPainel,
} from '@/lib/produtos-do-painel';

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
  /**
   * Capa do produto criado no painel. Os da planilha continuam com a do
   * capas.json, resolvida por capaDe(); só os do painel guardam a imagem no
   * Supabase, porque o painel não escreve no repositório.
   */
  capaDoPainel?: { src: string; width: number; height: number } | null;
}

/**
 * Catálogo pronto para a vitrine: sem os ocultos, com preço e descrição já
 * ajustados, e sinalizando quais foram marcados como destaque no painel.
 */
export async function catalogoParaVitrine(): Promise<ProdutoAjustado[]> {
  const [ajustes, doPainel] = await Promise.all([buscarAjustes(), lerProdutosDoPainel()]);
  const saida: ProdutoAjustado[] = [];

  // os criados no painel entram no fim: a planilha continua sendo a base, e
  // quando ela alcançar um deles, ele sai daqui sozinho
  const todos = [...produtos, ...somenteOsQueFaltam(doPainel, produtos)];
  const capas = capasDoPainel(doPainel);
  const referencias = referenciasDoPainel(doPainel);

  for (const p of todos) {
    const a = ajustes.get(p.id);
    if (a?.oculto) continue;
    if (p.categoria === 'oferta-personalizada' || p.status === 'inativo') continue;

    const ajustado = aplicar(p, a);
    // o preço "de" do painel é digitado pelo Sérgio e não passa pelo mapa de
    // referências da planilha, então entra por aqui
    const oferta = ofertaAtual(ajustado, referencias.get(p.id) ?? null);
    if (!oferta) continue;

    saida.push({
      produto: ajustado,
      oferta,
      destaque: Boolean(a?.destaque),
      capaDoPainel: capas.get(p.id) ?? null,
    });
  }

  return saida;
}

/** Um produto com ajuste, para a página dele. null = oculto ou inexistente. */
export async function produtoAjustado(id: string): Promise<ProdutoAjustado | null> {
  let base = produtos.find((p) => p.id === id || p.idEduzz === id);

  // uma leitura só, usada tanto para achar o produto quanto para a capa dele
  const doPainel = await lerProdutosDoPainel();

  // não está na planilha: pode ser um cadastrado no painel
  if (!base) base = somenteOsQueFaltam(doPainel, produtos).find((p) => p.id === id);
  if (!base) return null;

  const ajustes = await buscarAjustes();
  const a = ajustes.get(base.id);
  if (a?.oculto) return null;

  const ajustado = aplicar(base, a);
  const oferta = ofertaAtual(ajustado, referenciasDoPainel(doPainel).get(base.id) ?? null);
  if (!oferta) return null;

  return {
    produto: ajustado,
    oferta,
    destaque: Boolean(a?.destaque),
    capaDoPainel: capasDoPainel(doPainel).get(base.id) ?? null,
  };
}
