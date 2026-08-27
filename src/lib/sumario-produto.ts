import sumarios from '@/data/catalogo/sumarios.json';
import type { Produto } from '@/data/catalogo';
import {
  chaveDisciplina,
  SOBREPOSICAO_VAZIA,
  type SobreposicaoSumario,
} from '@/lib/sumarios-painel';

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

/**
 * Como a área aparece escrita no nome de um produto.
 * Duas entradas em Controle porque o catálogo usa as duas formas.
 */
const AREA_ESCRITA_NO_NOME: Record<string, string[]> = {
  Fiscal: ['fiscal'],
  Controle: ['gestao e controle', 'controle'],
  Policial: ['policial'],
  Tribunais: ['tribunais', 'tribunal'],
  Bancária: ['bancaria'],
  Legislativo: ['legislativo'],
};

/**
 * O combo leva mesmo TODAS as disciplinas da área?
 *
 * Só o combo da linha regular leva, e ele se identifica sozinho: nomeia a área
 * que vende. "Combo Resumos Fiscal Regular", "Combo Flashcards Área Tribunais
 * Regular". Combo que nomeia um concurso ou um assunto é recorte, não linha.
 *
 * A regra antiga era "combo leva a área inteira", e prometia o que o produto
 * não entrega. O Combo TJ-SP anunciava as 18 disciplinas da área Tribunais
 * quando vende 12 do edital de Escrevente, e ainda escondia Atualidades e
 * Legislação Interna, que vende. O Combo Regimentos da Câmara, que é Vade Mecum
 * mais resumos de regimento, anunciava Matemática Financeira e AFO. Os cinco de
 * Legislação Tributária, o de Reforma Tributária e o novo de Receita Federal
 * anunciavam de 24 a 28 disciplinas cada um.
 *
 * Prometer disciplina que não está no produto é o pior erro que uma página de
 * venda pode ter, então aqui se falha fechado: na dúvida, sem seção. Isso
 * também entrega o que o Sérgio pediu, que Reforma Tributária, Legislação
 * Tributária e Receita Federal ficassem de fora, sem precisar de lista à parte.
 */
function comboCobreAAreaInteira(produto: Produto): boolean {
  const termos = AREA_ESCRITA_NO_NOME[produto.area ?? ''];
  if (!termos) return false;

  const nome = normalizar(produto.nome);
  return termos.some((t) => nome.includes(t));
}

/**
 * Produto e planilha escrevendo a mesma disciplina com nomes diferentes.
 *
 * Só entram casos em que a equivalência é evidente e verificável, não palpite:
 * abreviação, ano escrito por extenso, erro de digitação na planilha. Onde há
 * dúvida real de conteúdo o produto continua sem sumário, e a lista dessas
 * dúvidas foi para o Sérgio decidir. Inventar sumário é pior do que não ter.
 *
 * A chave é o nome do produto sem o prefixo do formato, normalizado.
 */
const MESMA_DISCIPLINA: Record<string, string> = {
  // o catálogo diz "Português", a planilha diz "Língua Portuguesa"
  'portugues': 'Língua Portuguesa',
  // a planilha traz a lei; o produto traz a sigla
  'lei de responsabilidade fiscal lrf': 'Lei de Responsabilidade Fiscal (LC 101/00)',
  // mesma lei, ano por extenso de um lado e abreviado do outro
  'licitacoes e contratos lei 14 133 2021': 'Licitações e Contratos (Lei 14.133/21)',
  // "Governaça" está escrito assim na planilha, sem o "n"
  'gestao e governanca ti': 'TI - Gestão e Governaça',
};

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
  // o "de" opcional é o de "Resumo DE Licitações": sem tirá-lo, a chave começa
  // com uma preposição e nenhum apelido casa
  const semPrefixo = nomeProduto.replace(
    /^(flashcards?|resumos?|vade\s*mecum|combo|assinatura)\s+(de\s+)?/i,
    '',
  );
  const alvo = normalizar(semPrefixo);
  if (!alvo) return null;

  // apelido conhecido vence a comparação por palavras: "Português" jamais
  // alcançaria "Língua Portuguesa" contando palavras em comum
  const apelido = MESMA_DISCIPLINA[alvo];
  if (apelido && candidatos.includes(apelido)) return apelido;

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

/**
 * Aplica por cima de uma disciplina o que o painel diz sobre ela.
 *
 * Disciplina adotada no painel troca os tópicos e as medidas; disciplina que
 * ninguém encostou continua com o que veio da planilha. A área vem do painel
 * sempre que estiver definida lá, porque taguear é uma das telas que o Sérgio
 * pediu e não existe equivalente na planilha para muitas disciplinas.
 */
function comSobreposicao(
  d: DisciplinaSumario,
  sobre: SobreposicaoSumario,
): DisciplinaSumario {
  const k = chaveDisciplina(d.disciplina, d.formato);
  const doPainel = sobre.topicos.get(k);
  const medida = sobre.medidas.get(k);

  if (!doPainel && !medida) return d;

  return {
    ...d,
    topicos: doPainel ?? d.topicos,
    paginas: medida ? (medida.paginas ?? undefined) : d.paginas,
    cards: medida ? (medida.cards ?? undefined) : d.cards,
  };
}

export function sumarioDoProduto(
  produto: Produto,
  temResumos: boolean,
  temFlashcards: boolean,
  sobre: SobreposicaoSumario = SOBREPOSICAO_VAZIA,
): DisciplinaSumario[] {
  const saida: DisciplinaSumario[] = [];

  /**
   * Disciplinas escolhidas à mão no painel vencem qualquer regra automática.
   *
   * É o pedido do Sérgio de selecionar o curso e depois marcar as disciplinas
   * dele. Enquanto ele não mexer num curso, valem as regras de sempre: a
   * assinatura leva a linha inteira, o combo da linha regular leva a área, o
   * isolado casa pelo nome.
   */
  const escolhidas = sobre.cursos.get(produto.id);
  if (escolhidas && escolhidas.length > 0) {
    const todas = [...RESUMOS.map(comoResumo), ...FLASHCARDS.map(comoFlashcards)];
    for (const k of escolhidas) {
      const achada = todas.find((d) => chaveDisciplina(d.disciplina, d.formato) === k);
      if (!achada) continue;
      const pronta = comSobreposicao(achada, sobre);
      if (pronta.topicos.length > 0) saida.push(pronta);
    }
    return saida;
  }

  const juntar = (formato: 'Resumo' | 'Flashcards') => {
    const base: DisciplinaSumario[] = (
      formato === 'Resumo' ? RESUMOS.map(comoResumo) : FLASHCARDS.map(comoFlashcards)
    ).map((d) => comSobreposicao(d, sobre));
    const comConteudo = base.filter((d) => d.topicos.length > 0);

    if (produto.categoria === 'assinatura') {
      // assinatura dá acesso à linha inteira daquele formato
      saida.push(...comConteudo);
      return;
    }

    if (produto.categoria === 'combo') {
      if (!comboCobreAAreaInteira(produto)) return;
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
