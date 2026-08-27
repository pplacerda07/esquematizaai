import { createClient } from '@supabase/supabase-js';

/**
 * O que o painel diz sobre os sumários, por cima do que a planilha diz.
 *
 * Mesma ideia do catalogo-ajustes: a planilha continua sendo a base, o banco
 * sobrepõe o que foi editado. O Pedro pediu as duas fontes convivendo, porque
 * a migração da planilha para o painel leva um tempo.
 *
 * A REGRA DE QUEM GANHA, POR DISCIPLINA: enquanto ninguém salvou aquela
 * disciplina no painel, ela vem da planilha e as reimportações atualizam ela
 * normalmente. Salvou uma vez, o campo `adotada_em` é preenchido e a partir
 * dali só o painel manda naquela, e só naquela. Sem essa marca, uma hora as
 * duas fontes discordariam e ninguém saberia qual vale.
 *
 * Banco fora do ar devolve tudo vazio, e a página cai na planilha inteira. É
 * melhor mostrar o sumário de ontem do que derrubar a página de vendas.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHAVE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** a mesma disciplina existe nos dois formatos, com sumários diferentes */
export function chaveDisciplina(nome: string, formato: string): string {
  return `${formato}::${nome}`;
}

export interface SobreposicaoSumario {
  /** disciplinas adotadas no painel: chave -> tópicos, na ordem */
  topicos: Map<string, string[]>;
  /** área definida no painel: chave -> área */
  areas: Map<string, string>;
  /** medidas editadas no painel: chave -> páginas ou cards */
  medidas: Map<string, { paginas: number | null; cards: number | null }>;
  /** cursos com disciplinas escolhidas à mão: id do produto -> chaves */
  cursos: Map<string, string[]>;
}

export const SOBREPOSICAO_VAZIA: SobreposicaoSumario = {
  topicos: new Map(),
  areas: new Map(),
  medidas: new Map(),
  cursos: new Map(),
};

type LinhaDisciplina = {
  id: string;
  nome: string;
  formato: string;
  area: string | null;
  paginas: number | null;
  cards: number | null;
  adotada_em: string | null;
};

type LinhaTopico = { disciplina_id: string; ordem: number; texto: string };
type LinhaCurso = { produto_id: string; disciplina_id: string; ordem: number };

export async function lerSobreposicaoSumario(): Promise<SobreposicaoSumario> {
  if (!URL || !CHAVE) return SOBREPOSICAO_VAZIA;

  try {
    const supabase = createClient(URL, CHAVE, { auth: { persistSession: false } });

    const [disc, top, cur] = await Promise.all([
      supabase.from('disciplinas').select('id, nome, formato, area, paginas, cards, adotada_em'),
      supabase.from('disciplina_topicos').select('disciplina_id, ordem, texto').order('ordem'),
      supabase.from('curso_disciplinas').select('produto_id, disciplina_id, ordem').order('ordem'),
    ]);

    if (disc.error) {
      console.error('[sumarios] disciplinas indisponíveis:', disc.error.message);
      return SOBREPOSICAO_VAZIA;
    }

    const disciplinas = (disc.data ?? []) as LinhaDisciplina[];
    const porId = new Map(disciplinas.map((d) => [d.id, d]));

    const areas = new Map<string, string>();
    const medidas = new Map<string, { paginas: number | null; cards: number | null }>();
    for (const d of disciplinas) {
      const k = chaveDisciplina(d.nome, d.formato);
      if (d.area) areas.set(k, d.area);
      // medida só conta como sobreposição se veio do painel; da planilha ela
      // já está no JSON e repetir aqui não muda nada
      if (d.adotada_em) medidas.set(k, { paginas: d.paginas, cards: d.cards });
    }

    const topicos = new Map<string, string[]>();
    if (!top.error) {
      for (const t of (top.data ?? []) as LinhaTopico[]) {
        const d = porId.get(t.disciplina_id);
        // tópico de disciplina não adotada é resto de importação: quem manda
        // ainda é a planilha, então ele é ignorado
        if (!d || !d.adotada_em) continue;
        const k = chaveDisciplina(d.nome, d.formato);
        const lista = topicos.get(k);
        if (lista) lista.push(t.texto);
        else topicos.set(k, [t.texto]);
      }
    }

    const cursos = new Map<string, string[]>();
    if (!cur.error) {
      for (const c of (cur.data ?? []) as LinhaCurso[]) {
        const d = porId.get(c.disciplina_id);
        if (!d) continue;
        const k = chaveDisciplina(d.nome, d.formato);
        const lista = cursos.get(c.produto_id);
        if (lista) lista.push(k);
        else cursos.set(c.produto_id, [k]);
      }
    }

    return { topicos, areas, medidas, cursos };
  } catch (e) {
    console.error('[sumarios] falha ao ler o painel:', e instanceof Error ? e.message : e);
    return SOBREPOSICAO_VAZIA;
  }
}
