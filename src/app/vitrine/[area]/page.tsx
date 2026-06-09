import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AreaCarousel from '@/components/AreaCarousel';
import { AREAS, findArea } from '@/components/Navbar/areas';
import styles from './styles.module.css';

export function generateStaticParams() {
  return AREAS.map((a) => ({ area: a.slug }));
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

  return (
    <main className={styles.main}>
      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.tag}>Vitrine por área</span>
          <h1 className={styles.title}>
            Tudo para sua aprovação na área <span className={styles.titleAccent}>{matched.name}</span>
          </h1>
          <p className={styles.subtitle}>
            Assinaturas, combos, resumos, flashcards e mentoria — escolha o formato ideal para o seu momento de estudo.
          </p>
        </div>
      </header>

      <section className={styles.carouselSection}>
        <AreaCarousel areaName={matched.name} />
      </section>

      <Footer />
    </main>
  );
}
