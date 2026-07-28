import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getConteudoProprio, formatarData } from '@/lib/blog';
import { SITE_URL } from '@/config';
import styles from './styles.module.css';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Notícias de concursos | Esquematiza Aí',
  description:
    'Notícias de concursos públicos das áreas fiscal, controle, tribunais e mais, apuradas e escritas pelo time do Esquematiza Aí.',
  alternates: { canonical: `${SITE_URL}/noticias` },
};

export default async function NoticiasPage() {
  // só conteúdo com página nossa: nenhuma manchete daqui joga o leitor para fora
  const noticias = await getConteudoProprio();

  return (
    <main className={styles.main}>
      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>
            Últimas <span className={styles.titleAccent}>notícias</span>
          </h1>
          <p className={styles.subtitle}>
            O que está acontecendo nos concursos que importam para você. Cada manchete leva
            direto para a matéria completa na fonte.
          </p>
        </div>
      </header>

      <section className={styles.lista}>
        {noticias.length === 0 ? (
          <p className={styles.empty}>Nenhuma notícia por aqui ainda. Volte em breve.</p>
        ) : (
          noticias.map((n) => {
            return (
              <Link key={n.id} className={styles.item} href={n.href}>
                <div className={styles.itemBody}>
                  <h2 className={styles.itemTitulo}>{n.titulo}</h2>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemData}>{formatarData(n.publicado_em)}</span>
                    <span className={styles.itemMateria}>Matéria completa</span>
                  </div>
                </div>
                <span className={styles.itemSeta} aria-hidden="true">→</span>
              </Link>
            );
          })
        )}
      </section>

      <Footer />
    </main>
  );
}
