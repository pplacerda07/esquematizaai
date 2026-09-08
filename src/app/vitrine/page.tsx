import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductVitrine from '@/components/ProductVitrine';
import UrgencyBar from '@/components/HeroSection/UrgencyBar';
import styles from './styles.module.css';

/**
 * A vitrine se refaz a cada minuto, como a página do produto.
 *
 * Sem isto ela era estática para sempre: preço, produto oculto, destaque e
 * posição editados no painel só apareceriam no próximo deploy. O Sérgio mudaria
 * algo, olharia a vitrine, não veria nada acontecer e concluiria que o painel
 * está quebrado. Foi assim que a ordenação pareceu não funcionar em 08/09.
 *
 * Um minuto é o mesmo intervalo da página do produto, e mantém as duas
 * contando a mesma história.
 */
export const revalidate = 60;

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
