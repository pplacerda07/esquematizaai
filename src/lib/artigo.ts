/**
 * Utilidades de leitura do Markdown do artigo: sumário, âncoras e tempo de leitura.
 *
 * O sumário ("Neste guia") é DERIVADO dos títulos do texto, não escrito à mão.
 * Assim ele nunca fica dessincronizado quando alguém edita uma seção, e o autor
 * não precisa manter duas listas.
 */

/** Vira âncora de URL. A mesma função gera o id do título e o link do sumário. */
export function ancora(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface ItemSumario {
  nivel: 2 | 3;
  texto: string;
  id: string;
}

/**
 * Títulos de nível 2 e 3 do Markdown, na ordem em que aparecem.
 * Ignora o que estiver dentro de bloco de código (``` ... ```), senão um
 * comentário `# assim` de um exemplo entraria no sumário.
 */
export function extrairSumario(markdown: string): ItemSumario[] {
  const itens: ItemSumario[] = [];
  let dentroDeCodigo = false;

  for (const linha of markdown.split('\n')) {
    if (/^\s*```/.test(linha)) {
      dentroDeCodigo = !dentroDeCodigo;
      continue;
    }
    if (dentroDeCodigo) continue;

    const m = linha.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;

    // tira marcação inline do título (**negrito**, `código`, [link](url))
    const texto = m[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim();
    if (!texto) continue;

    itens.push({ nivel: m[1].length === 2 ? 2 : 3, texto, id: ancora(texto) });
  }

  return itens;
}

/**
 * Minutos de leitura, arredondado para cima e nunca menor que 1.
 * 200 palavras/min é a média usada para leitura em tela de texto informativo.
 */
export function tempoDeLeitura(markdown: string): number {
  const palavras = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|:\-\[\]()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(palavras / 200));
}

/** "27 de julho de 2026" (determinístico: mesmo texto no servidor e no navegador) */
export function dataPorExtenso(iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
