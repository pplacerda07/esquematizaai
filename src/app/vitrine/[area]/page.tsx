import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import UrgencyBar from '@/components/HeroSection/UrgencyBar';
import Footer from '@/components/Footer';
import AreaCarousel, { type AreaSection, type VitrineItem } from '@/components/AreaCarousel';
import { AREAS, findArea } from '@/components/Navbar/areas';
import { produtosVendaveis, ofertaAtual, capaDe } from '@/data/catalogo';
import { rotuloDeFerramenta } from '@/data/catalogo/rotulos';
import { SITE_URL } from '@/config';
import styles from './styles.module.css';

/**
 * Mesma razão da vitrine: o que o Sérgio edita no painel precisa aparecer sem
 * depender de deploy. Um minuto, igual às outras páginas do catálogo.
 */
export const revalidate = 60;

export function generateStaticParams() {
  return AREAS.map((a) => ({ area: a.slug }));
}

/**
 * Título, descrição e endereço oficial de cada área.
 *
 * Esta rota não declarava metadata nenhuma. Sem isso o Next herda a do layout
 * raiz, e as seis páginas de área entravam no Google com o MESMO título e a
 * MESMA descrição da home, palavra por palavra. Conferi no ar: /vitrine/fiscal
 * saía com "Esquematiza Aí | Mentoria, Resumos e Flashcards para concursos
 * públicos", idêntico à home.
 *
 * Seis endereços com o mesmo título, a mesma descrição e sem canonical é a
 * receita do aviso que o Search Console mandou em 16/09.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area } = await params;
  const encontrada = findArea(area);
  if (!encontrada) return { title: 'Área não encontrada' };

  const quantos = encontrada.catalogoArea
    ? produtosVendaveis().filter((p) => p.area === encontrada.catalogoArea).length
    : 0;

  return {
    title: `Concursos da área ${encontrada.name} | Esquematiza Aí`,
    description: quantos
      ? `${quantos} materiais do Esquematiza Aí para concursos da área ${encontrada.name}: resumos esquematizados, flashcards, vade mecum e questões inéditas.`
      : `Materiais do Esquematiza Aí para concursos da área ${encontrada.name}.`,
    alternates: { canonical: `${SITE_URL}/vitrine/${encontrada.slug}` },
  };
}

// Monta as seções da vitrine de uma área a partir do catálogo real.
function secoesDaArea(catalogoArea: string): AreaSection[] {
  const vendaveis = produtosVendaveis().filter((p) => p.categoria !== 'oferta-personalizada');

  const paraItem = (p: (typeof vendaveis)[number]): VitrineItem | null => {
    const oferta = ofertaAtual(p);
    if (!oferta) return null;
    return {
      id: p.id,
      nome: p.nome,
      rotulo: rotuloDeFerramenta(p.ferramenta, p.categoria),
      preco: oferta.preco,
      precoAntigo: oferta.precoAntigo,
      percentualOff: oferta.percentualOff,
      checkout: oferta.checkout,
      viaPaginaDeVendas: oferta.viaPaginaDeVendas,
      capa: capaDe(p),
    };
  };

  // dedup por nome e por checkout, priorizando maior desconto
  const montar = (lista: typeof vendaveis): VitrineItem[] => {
    const itens = lista.map(paraItem).filter((x): x is VitrineItem => x !== null);
    itens.sort((a, b) => (b.percentualOff ?? -1) - (a.percentualOff ?? -1));
    const nomes = new Set<string>();
    const checkouts = new Set<string>();
    const out: VitrineItem[] = [];
    for (const it of itens) {
      if (nomes.has(it.nome) || checkouts.has(it.checkout)) continue;
      nomes.add(it.nome);
      checkouts.add(it.checkout);
      out.push(it);
    }
    return out;
  };

  const daArea = (extra: (p: (typeof vendaveis)[number]) => boolean) =>
    vendaveis.filter((p) => p.area === catalogoArea && extra(p));

  const candidatas: AreaSection[] = [
    {
      key: 'assinaturas',
      title: 'Assinaturas',
      subtitle: 'Acesso a todos os resumos e flashcards regulares por um período.',
      items: montar(vendaveis.filter((p) => p.categoria === 'assinatura')),
    },
    {
      key: 'combos',
      title: 'Combos',
      subtitle: `Pacotes de resumos e flashcards prontos para a área ${catalogoArea}.`,
      items: montar(daArea((p) => p.categoria === 'combo')),
    },
    {
      key: 'resumos',
      title: 'Resumos isolados',
      subtitle: 'Compre só o resumo da matéria que você precisa reforçar.',
      items: montar(daArea((p) => p.categoria === 'isolado' && p.ferramenta === 'Resumo')),
    },
    {
      key: 'flashcards',
      title: 'Flashcards isolados',
      subtitle: 'Revisão ativa por matéria, com repetição espaçada.',
      items: montar(daArea((p) => p.categoria === 'isolado' && p.ferramenta === 'Flashcards')),
    },
  ];

  return candidatas.filter((s) => s.items.length > 0);
}

export default async function AreaVitrinePage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area } = await params;
  const matched = findArea(area);

  if (!matched) {
    notFound();
  }

  const sections = matched.catalogoArea ? secoesDaArea(matched.catalogoArea) : [];

  return (
    <main className={styles.main}>
      <Navbar />
      {/* o cupom acompanha a pessoa ate onde ela decide a compra */}
      <UrgencyBar />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>
            Tudo para sua aprovação na área <span className={styles.titleAccent}>{matched.name}</span>
          </h1>
          <p className={styles.subtitle}>
            Assinaturas, combos, resumos e flashcards. Escolha o formato ideal para o seu
            momento de estudo, com compra direta e segura.
          </p>
        </div>
      </header>

      <section className={styles.carouselSection}>
        {sections.length > 0 ? (
          <AreaCarousel sections={sections} />
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>
              Ainda estamos preparando os materiais específicos para esta área.
            </p>
            <Link href="/#vitrine" className={styles.emptyCta}>
              Ver o catálogo completo →
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
