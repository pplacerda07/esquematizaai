import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductVitrine from '@/components/ProductVitrine';
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
      <ProductVitrine />
      <Footer />
    </main>
  );
}
