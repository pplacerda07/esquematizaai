import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BlogPreview from '@/components/BlogPreview';
import ProvaSocial from '@/components/ProvaSocial';
import SocialTicker from '@/components/SocialTicker';
import StatsTicker from '@/components/StatsTicker';
import FeaturedCourses from '@/components/FeaturedCourses';
import ProductVitrine from '@/components/ProductVitrine';
import Categories from '@/components/Categories';
import AboutUs from '@/components/AboutUs';
import InstagramSection from '@/components/InstagramSection';
import Arsenal from '@/components/Arsenal';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import LeadPopup from '@/components/LeadPopup';
import { SITE_URL } from '@/config';
import styles from './page.module.css';

/**
 * Mesma razão da vitrine: o que o Sérgio edita no painel precisa aparecer sem
 * depender de deploy. Um minuto, igual às outras páginas do catálogo.
 */
export const revalidate = 60;

/**
 * Só o endereço oficial. Título e descrição continuam vindo do layout raiz,
 * porque a metadata do Next se junta campo a campo: declarar `alternates` aqui
 * não apaga o resto.
 *
 * A home recebe link de campanha o tempo todo, com utm e fbclid colados no fim,
 * e cada um desses vira um endereço diferente aos olhos do Google. Esta linha
 * diz que todos são a mesma página.
 *
 * O canonical NÃO pode morar no layout raiz: lá ele seria herdado por toda
 * página que não declarasse a sua, e cada uma passaria a se apresentar como a
 * home. Por isso é declarado página a página.
 */
export const metadata = {
  alternates: { canonical: SITE_URL },
};

export default function Home() {
  return (
    <main className={styles.home}>
      <Navbar />
      <HeroSection />
      <SocialTicker />
      <FeaturedCourses />
      <BlogPreview />
      {/* um título, dois carrosséis: vídeo em cima, prints embaixo */}
      <ProvaSocial />
      <ProductVitrine />
      <Arsenal />
      <AboutUs />
      <StatsTicker />
      <Categories />
      <InstagramSection />
      <ContactForm />
      <Footer />
      <LeadPopup />
    </main>
  );
}
