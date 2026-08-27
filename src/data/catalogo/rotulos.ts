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

/**
 * O produto é da linha de Legislação Tributária?
 *
 * PELO NOME, E NÃO PELA COLUNA DA PLANILHA. O campo `formato` já chamou essa
 * linha de "Legislação Tributária" e na planilha de 27/08 passou a chamar de
 * "Específico", o que zerou o filtro da vitrine da noite para o dia, e foi o
 * Sérgio quem viu. Pior: "Específico" também marca os produtos da Câmara dos
 * Deputados, que não são legislação tributária, e 32 produtos da linha ficaram
 * sem formato nenhum.
 *
 * O nome do produto é escrito para o aluno ler e não muda de vocabulário entre
 * versões da planilha, então é o sinal mais estável que existe aqui.
 *
 * LTF é Legislação Tributária Federal e LTE é Legislação Tributária Estadual,
 * abreviações que o Sérgio usa em alguns nomes. Aduaneira e Comércio
 * Internacional entram porque são as disciplinas de legislação da Receita
 * Federal, vendidas como parte da mesma linha.
 */
export function ehLegislacaoTributaria(nome: string): boolean {
  const limpo = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

  return /legislacao tribut|reforma tribut|legislacao aduaneira|leg\.? aduaneira|comercio internacional|\blt[fe]\b/.test(
    limpo,
  );
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
