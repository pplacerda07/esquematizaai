import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import BlogPreview from '@/components/BlogPreview';
import Testimonials from '@/components/Testimonials';
import SocialTicker from '@/components/SocialTicker';
import StatsTicker from '@/components/StatsTicker';
import Newsletter from '@/components/Newsletter';
import FeaturedCourses from '@/components/FeaturedCourses';
import ProductVitrine from '@/components/ProductVitrine';
import Categories from '@/components/Categories';
import AboutUs from '@/components/AboutUs';
import LiveClasses from '@/components/LiveClasses';
import TeamSection from '@/components/TeamSection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import LeadPopup from '@/components/LeadPopup';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <SocialTicker />
      <FeaturedCourses />
      <BlogPreview />
      <Testimonials />
      <Newsletter />
      <ProductVitrine />
      <StatsTicker />
      <Categories />
      <AboutUs />
      <LiveClasses />
      <TeamSection />
      <ContactForm />
      <Footer />
      <LeadPopup />
    </main>
  );
}
