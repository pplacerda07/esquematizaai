export type Area = {
  slug: string;
  name: string;
  /** Nome da área como aparece no catálogo (produtos.json). null = sem produtos ainda. */
  catalogoArea: string | null;
};

export const AREAS: Area[] = [
  { slug: 'fiscal', name: 'Fiscal', catalogoArea: 'Fiscal' },
  { slug: 'controle-e-gestao', name: 'Controle e Gestão', catalogoArea: 'Controle' },
  { slug: 'policial', name: 'Policial', catalogoArea: 'Policial' },
  { slug: 'tribunais', name: 'Tribunais', catalogoArea: 'Tribunais' },
  { slug: 'bancaria', name: 'Bancária', catalogoArea: 'Bancária' },
  { slug: 'inss', name: 'INSS', catalogoArea: null },
];

export const MENTORIA_URL = 'https://typebot.co/esquematizaapp';

export function findArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}
