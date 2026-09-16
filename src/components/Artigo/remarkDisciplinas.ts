/**
 * Dá à lista de disciplinas o formato da página de vendas antiga.
 *
 * O texto raspado dos produtos traz o sumário assim:
 *
 *   01. Língua Portuguesa · 166 páginas
 *   02. Raciocínio Lógico · 31 páginas
 *
 * Renderizado como lista comum, o navegador joga fora o zero da frente (vira
 * "1.", "2.") e o número de páginas sai com o mesmo peso e a mesma cor do nome
 * da disciplina. O Sérgio apontou isso em 16/09: nos materiais o padrão é
 * "01. Língua Portuguesa → 166 páginas", com o número em destaque e a medida
 * em azul claro, e é esse formato que liga a página ao produto que a pessoa
 * recebe.
 *
 * O que este plugin faz é só MARCAR: separa o nome da medida e avisa o CSS que
 * aquela lista é de disciplinas. O zero à esquerda quem devolve é o contador do
 * CSS, com decimal-leading-zero, e a seta é desenhada lá também. Nada disso
 * mexe no texto guardado.
 *
 * SÓ PEGA A LISTA INTEIRA, NUNCA UM ITEM SOLTO: se um único item da lista não
 * for "alguma coisa · N páginas", a lista fica como estava. Artigo do blog tem
 * lista numerada de outras coisas, e enfeitar por engano uma lista de requisitos
 * de edital seria pior que não enfeitar nada.
 */
import type { Plugin } from 'unified';

type No = {
  type: string;
  ordered?: boolean;
  children?: No[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
  value?: string;
};

/**
 * "Contabilidade Geral e Avançada · 207 páginas" -> nome + medida.
 *
 * O separador varia conforme de onde o texto foi raspado: ponto do meio, bolinha
 * ou hífen. A medida é sempre número seguido de páginas ou cards, que são as
 * duas unidades que os produtos usam.
 */
const LINHA = /^\s*(.+?)\s*[·•–—-]\s*([\d.]+\s+(?:páginas?|cards?|flashcards?))\s*$/i;

function textoDe(no: No): string {
  if (typeof no.value === 'string') return no.value;
  return (no.children ?? []).map(textoDe).join('');
}

function percorrer(no: No, visitar: (n: No) => void) {
  visitar(no);
  for (const filho of no.children ?? []) percorrer(filho, visitar);
}

/** O parágrafo único de um item de lista, que é onde o texto mora. */
function paragrafoUnico(item: No): No | null {
  const filhos = item.children ?? [];
  if (filhos.length !== 1 || filhos[0].type !== 'paragraph') return null;
  return filhos[0];
}

const remarkDisciplinas: Plugin = () => (arvore) => {
  percorrer(arvore as No, (no) => {
    if (no.type !== 'list' || !no.ordered) return;

    const itens = no.children ?? [];
    if (itens.length < 2) return;

    const partes: Array<{ item: No; paragrafo: No; nome: string; medida: string }> = [];
    for (const item of itens) {
      const paragrafo = paragrafoUnico(item);
      if (!paragrafo) return;
      const m = LINHA.exec(textoDe(paragrafo));
      if (!m) return;
      partes.push({ item, paragrafo, nome: m[1], medida: m[2] });
    }

    no.data = { ...no.data, hProperties: { ...no.data?.hProperties, 'data-disciplinas': 'sim' } };

    for (const { paragrafo, nome, medida } of partes) {
      paragrafo.children = [
        {
          type: 'emphasis',
          data: { hName: 'span', hProperties: { 'data-nome': 'sim' } },
          children: [{ type: 'text', value: nome }],
        },
        {
          type: 'emphasis',
          data: { hName: 'span', hProperties: { 'data-medida': 'sim' } },
          children: [{ type: 'text', value: medida }],
        },
      ];
    }
  });
};

export default remarkDisciplinas;
