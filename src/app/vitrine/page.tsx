import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductVitrine from '@/components/ProductVitrine';
import UrgencyBar from '@/components/HeroSection/UrgencyBar';
import { SITE_URL } from '@/config';
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
  /**
   * Endereço oficial fixo, sem os parâmetros.
   *
   * O filtro da vitrine roda no navegador: o servidor ignora `?tipo=` e
   * `?busca=` e devolve o mesmo documento, byte a byte (medi: 263.877 bytes em
   * /vitrine e em /vitrine?tipo=combo). O rodapé publica quatro desses links
   * com parâmetro em toda página do site, então o Google chega neles seguindo
   * link, sem depender do sitemap, e enxerga quatro cópias da vitrine.
   *
   * Esta linha diz que todas são a mesma página. Vale também para o que chega
   * de campanha com utm e fbclid colados no fim.
   */
  alternates: { canonical: `${SITE_URL}/vitrine` },
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
      {/* Esta é a página que existe para listar tudo, então o catálogo sai
          inteiro e o título dele é o h1 da página. Na home o mesmo componente
          continua sendo amostra, com h2 e o "Mostrar mais". */}
      <ProductVitrine tudoVisivel comoH1 />
      <Footer />
    </main>
  );
}
