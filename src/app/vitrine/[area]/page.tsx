import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AreaCarousel, { type AreaSection, type VitrineItem } from '@/components/AreaCarousel';
import { AREAS, findArea } from '@/components/Navbar/areas';
import { produtosVendaveis, ofertaAtual, capaDe } from '@/data/catalogo';
import { rotuloDeFerramenta } from '@/data/catalogo/rotulos';
import styles from './styles.module.css';

export function generateStaticParams() {
  return AREAS.map((a) => ({ area: a.slug }));
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
