/**
 * Converte as diretivas do Markdown em elementos que o ReactMarkdown consegue
 * mapear para os componentes do artigo.
 *
 * A sintaxe que o time do Esquematiza escreve no texto:
 *
 *   :::importante
 *   As 848 vagas somam apenas os cinco fiscos estaduais...
 *   :::
 *
 *   :::dica[DICA DE PROVA]
 *   Não espere o edital para começar...
 *   :::
 *
 *   ::produto{id=combo-resumos-flashcards-fiscal-regular}
 *
 *   :marca[1.000 vagas]        <- grifo amarelo no meio da frase
 *
 * Por que diretiva e não HTML solto: o conteúdo de dentro continua sendo Markdown
 * de verdade (link, negrito e lista funcionam), e nada do que o autor escreve vira
 * HTML executável no site.
 */
import type { Plugin } from 'unified';

type No = {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: No[];
  data?: { hName?: string; hProperties?: Record<string, unknown>; directiveLabel?: boolean };
  value?: string;
};

/** Texto puro de uma subárvore, usado para pegar o rótulo entre colchetes. */
function textoDe(no: No): string {
  if (typeof no.value === 'string') return no.value;
  return (no.children ?? []).map(textoDe).join('');
}

function percorrer(no: No, visitar: (n: No) => void) {
  visitar(no);
  for (const filho of no.children ?? []) percorrer(filho, visitar);
}

const remarkBlocos: Plugin = () => (arvore) => {
  percorrer(arvore as No, (no) => {
    if (
      no.type !== 'containerDirective' &&
      no.type !== 'leafDirective' &&
      no.type !== 'textDirective'
    ) {
      return;
    }

    // O rótulo `:::dica[DICA DE PROVA]` chega como primeiro filho marcado;
    // tiro ele do corpo para não virar um parágrafo solto dentro da caixa.
    let rotulo: string | undefined;
    const filhos = no.children ?? [];
    if (filhos.length && filhos[0].data?.directiveLabel) {
      rotulo = textoDe(filhos[0]);
      no.children = filhos.slice(1);
    }

    const dados = no.data ?? (no.data = {});
    // `span` para diretiva de texto e `div` para as de bloco: um <div> dentro de
    // um parágrafo geraria HTML inválido e o React reclamaria de aninhamento.
    dados.hName = no.type === 'textDirective' ? 'span' : 'div';
    dados.hProperties = {
      ...no.attributes,
      'data-bloco': no.name,
      ...(rotulo ? { 'data-rotulo': rotulo } : {}),
    };
  });
};

export default remarkBlocos;
