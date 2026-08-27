import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductVitrine from '@/components/ProductVitrine';
import UrgencyBar from '@/components/HeroSection/UrgencyBar';
import styles from './styles.module.css';

export const metadata = {
  title: 'Vitrine | Esquematiza Aí',
  description:
    'Todos os combos, materiais isolados e assinaturas do Esquematiza Aí para concursos das áreas Fiscal, Controle, Policial, Tribunais, Bancária e Legislativa.',
};

export default function VitrinePage() {
  return (
    <main className={styles.main}>
      <Navbar />
      {/* O cupom segue a pessoa. Os atalhos do topo da home levam para cá já
          filtrado, e até agora o desconto ficava para trás no caminho: o
          Sérgio pediu que ele aparecesse aqui também, e é aqui que a escolha
          do material acontece. */}
      <UrgencyBar />
      <ProductVitrine />
      <Footer />
    </main>
  );
}
