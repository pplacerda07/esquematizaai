export type Area = {
  slug: string;
  name: string;
};

export const AREAS: Area[] = [
  { slug: 'fiscal', name: 'Fiscal' },
  { slug: 'controle-e-gestao', name: 'Controle e Gestão' },
  { slug: 'policial', name: 'Policial' },
  { slug: 'tribunais', name: 'Tribunais' },
  { slug: 'bancaria', name: 'Bancária' },
  { slug: 'inss', name: 'INSS' },
];

export const MENTORIA_URL = 'https://typebot.co/esquematizaapp';

export function findArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}
