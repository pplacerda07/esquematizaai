// Rótulos de exibição do catálogo.
// Arquivo separado do index.ts de propósito: não importa os JSONs, então pode
// ser usado em client components sem levar o catálogo inteiro para o navegador.

export const ROTULO_FERRAMENTA: Record<string, string> = {
  'Resumo': 'Resumos',
  'Flashcards': 'Flashcards',
  'R + F + Q + V': 'Combo completo',
  'Questões Inéditas': 'Questões inéditas',
  'Vademecum': 'Vade mecum',
  'Assinatura': 'Assinatura',
  'Combo': 'Combo',
};

export const ROTULO_CATEGORIA: Record<string, string> = {
  combo: 'Combo',
  isolado: 'Isolado',
  assinatura: 'Assinatura',
  treinamento: 'Treinamento',
};

export function rotuloDeFerramenta(ferramenta: string | null, categoria: string): string {
  if (ferramenta && ROTULO_FERRAMENTA[ferramenta]) return ROTULO_FERRAMENTA[ferramenta];
  return ROTULO_CATEGORIA[categoria] ?? 'Material';
}

/** Área do catálogo -> slug da rota /vitrine/[area] (null = sem rota própria). */
export const SLUG_DA_AREA: Record<string, string | null> = {
  'Fiscal': 'fiscal',
  'Controle': 'controle-e-gestao',
  'Policial': 'policial',
  'Tribunais': 'tribunais',
  'Bancária': 'bancaria',
  'Legislativo': null,
  'OAB': 'oab',
};
