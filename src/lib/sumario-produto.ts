import sumarios from '@/data/catalogo/sumarios.json';
import type { Produto } from '@/data/catalogo';

/**
 * Sumário por disciplina, para a sanfona da página de produto.
 *
 * O SÉRGIO NOTOU QUE FALTAVA, e faltava mesmo: o campo `disciplinas` do produto
 * vem preenchido nos isolados e VAZIO nas assinaturas e combos. Justamente nos
 * produtos caros, onde a pessoa mais precisa saber o que está levando.
 *
 * A planilha já tinha a resposta em outra aba: 37 disciplinas de resumo com
 * sumário e 81 de flashcard com árvore de assuntos, mais o mapa de quais
 * disciplinas compõem cada área. Isto aqui só amarra as duas pontas.
 */

export type DisciplinaSumario = {
  disciplina: string;
  formato: 'Resumo' | 'Flashcards';
  /** linhas do sumário, na ordem em que aparecem na planilha */
  topicos: string[];
  paginas?: number;
  cards?: number;
};

type ResumoBruto = { disciplina: string; versao: string; paginas: number; sumario: string | null };
type FlashBruto = { disciplina: string; versao: string; cards: number; arvoreAssuntos: string | null };
type Modulo = { formato: string; area: string; disciplina: string };

const RESUMOS = sumarios.resumosRegulares.disciplinas as ResumoBruto[];
const FLASHCARDS = sumarios.flashcardsRegulares as FlashBruto[];
const MODULOS = sumarios.modulosPorArea as Modulo[];

/**
 * A área no catálogo e a área na aba de módulos não usam o mesmo nome.
 * "Geral" fica de fora de propósito: é o que as assinaturas usam, e assinatura
 * leva todas as disciplinas, não as de uma área.
 */
const AREA_DO_CATALOGO_PARA_MODULOS: Record<string, string> = {
  Fiscal: 'Fiscal',
  Controle: 'Gestão e Controle',
  Policial: 'Policial',
  Tribunais: 'Tribunal',
  Bancária: 'Bancária',
  Legislativo: 'Legislativo',
};

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function emLinhas(texto: string | null): string[] {
  if (!texto) return [];
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function comoResumo(d: ResumoBruto): DisciplinaSumario {
  return {
    disciplina: d.disciplina,
    formato: 'Resumo',
    topicos: emLinhas(d.sumario),
    paginas: d.paginas,
  };
}

function comoFlashcards(d: FlashBruto): DisciplinaSumario {
  return {
    disciplina: d.disciplina,
    formato: 'Flashcards',
    topicos: emLinhas(d.arvoreAssuntos),
    cards: d.cards,
  };
}

/**
 * Nomes de disciplina que compõem uma área, por formato.
 *
 * A planilha só mapeia Flashcards para a área Fiscal; nas outras só há Resumo.
 * Por isso, quando o par área + formato não existe, vale a lista de disciplinas
 * da área em qualquer formato: quem define quais matérias entram é a área, o
 * formato só muda o jeito de estudar. Sem essa volta, todo combo de flashcards
 * fora do Fiscal ficaria sem sumário.
 */
function disciplinasDaArea(area: string, formato: 'Resumo' | 'Flashcards'): string[] {
  const areaModulos = AREA_DO_CATALOGO_PARA_MODULOS[area];
  if (!areaModulos) return [];

  const daArea = MODULOS.filter((m) => m.area === areaModulos);
  const doFormato = daArea.filter((m) => m.formato === formato);
  const escolhidos = doFormato.length > 0 ? doFormato : daArea;

  return [...new Set(escolhidos.map((m) => m.disciplina))];
}

/** palavras que não ajudam a distinguir uma disciplina de outra */
const PALAVRAS_VAZIAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'ao', 'em']);

function palavras(texto: string): string[] {
  return normalizar(texto)
    .split(' ')
    .filter((p) => p.length > 1 && !PALAVRAS_VAZIAS.has(p));
}

/**
 * Acha a disciplina de um produto isolado pelo nome.
 *
 * "Flashcards Direito Civil" -> "Direito Civil".
 *
 * A comparação é por PALAVRAS, não por trecho contínuo: a planilha e o catálogo
 * escrevem a mesma coisa em ordens diferentes. O produto diz "Banco de Dados
 * Dimensional (TI)" e a planilha diz "TI - Banco de Dados Dimensional"; comparar
 * como texto corrido não casa, comparar palavra a palavra casa.
 *
 * Disciplina que não existir na planilha simplesmente não casa, e o produto fica
 * sem a seção. É o certo: inventar sumário seria pior do que não ter.
 */
function acharPorNome(nomeProduto: string, candidatos: string[]): string | null {
  const semPrefixo = nomeProduto.replace(
    /^(flashcards?|resumos?|vade\s*mecum|combo|assinatura)\s+/i,
    '',
  );
  const alvo = normalizar(semPrefixo);
  if (!alvo) return null;

  const exato = candidatos.find((c) => normalizar(c) === alvo);
  if (exato) return exato;

  const palavrasAlvo = palavras(semPrefixo);
  if (palavrasAlvo.length === 0) return null;

  let melhor: { nome: string; nota: number } | null = null;

  for (const candidato of candidatos) {
    const palavrasCandidato = palavras(candidato);
    if (palavrasCandidato.length === 0) continue;

    const emComum = palavrasAlvo.filter((p) => palavrasCandidato.includes(p)).length;
    // exige que quase todo o nome do produto esteja no da disciplina, senão
    // "Direito Civil" casaria com "Direito Processual Civil"
    const cobertura = emComum / palavrasAlvo.length;
    const inverso = emComum / palavrasCandidato.length;
    if (cobertura < 0.85) continue;

    const nota = cobertura + inverso;
    if (!melhor || nota > melhor.nota) melhor = { nome: candidato, nota };
  }

  return melhor?.nome ?? null;
}

export function sumarioDoProduto(
  produto: Produto,
  temResumos: boolean,
  temFlashcards: boolean,
): DisciplinaSumario[] {
  const saida: DisciplinaSumario[] = [];

  const juntar = (formato: 'Resumo' | 'Flashcards') => {
    const base: DisciplinaSumario[] =
      formato === 'Resumo' ? RESUMOS.map(comoResumo) : FLASHCARDS.map(comoFlashcards);
    const comConteudo = base.filter((d) => d.topicos.length > 0);

    if (produto.categoria === 'assinatura') {
      // assinatura dá acesso à linha inteira daquele formato
      saida.push(...comConteudo);
      return;
    }

    if (produto.categoria === 'combo') {
      const nomes = disciplinasDaArea(produto.area ?? '', formato);
      saida.push(...comConteudo.filter((d) => nomes.includes(d.disciplina)));
      return;
    }

    // isolado: uma disciplina só, achada pelo nome do produto
    const nome = acharPorNome(
      produto.nome,
      comConteudo.map((d) => d.disciplina),
    );
    const achada = comConteudo.find((d) => d.disciplina === nome);
    if (achada) saida.push(achada);
  };

  if (temResumos) juntar('Resumo');
  if (temFlashcards) juntar('Flashcards');

  return saida;
}
