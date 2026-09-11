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

/**
 * Descrição do post para a busca e para o cartão de compartilhamento.
 *
 * O Google mostra cerca de 155 caracteres e corta o resto onde calhar. Medido
 * em 11/09: 6 dos 8 posts passavam de 200, e o do ISS Aracati tinha 726, com o
 * corte caindo no meio de "R$ 3.347,94". Os outros 571 caracteres não
 * apareciam em busca nenhuma.
 *
 * Por que não bastava deixar o Google cortar: ele corta no caractere, não na
 * palavra. Aqui o corte é sempre num espaço, e só entra reticência quando
 * sobrou texto de fora.
 *
 * A ordem é: descrição escrita à mão para a busca, depois o resumo cortado,
 * depois o título. O resumo continua inteiro no card da listagem, que tem CSS
 * limitando a quatro linhas e não precisa deste corte.
 */
export function descricaoParaBusca(
  descricaoSeo: string | null | undefined,
  resumo: string | null | undefined,
  titulo: string,
  limite = 155,
): string {
  const propria = descricaoSeo?.trim();
  if (propria) return propria;

  const base = resumo?.trim();
  if (!base) return `${titulo} | Esquematiza Aí.`;
  if (base.length <= limite) return base;

  // corta no último espaço antes do limite, para não partir palavra nem valor
  const pedaco = base.slice(0, limite);
  const espaco = pedaco.lastIndexOf(' ');
  const cortado = (espaco > limite * 0.6 ? pedaco.slice(0, espaco) : pedaco).replace(
    /[\s.,;:·-]+$/,
    '',
  );
  return `${cortado}...`;
}
