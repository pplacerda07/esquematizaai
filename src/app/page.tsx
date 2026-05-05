import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import StatsTicker from '@/components/StatsTicker';
import Categories from '@/components/Categories';
import AboutUs from '@/components/AboutUs';
import FeaturedCourses from '@/components/FeaturedCourses';
import ProductVitrine from '@/components/ProductVitrine';
import TeamSection from '@/components/TeamSection';
import Newsletter from '@/components/Newsletter';
import Testimonials from '@/components/Testimonials';
import SocialTicker from '@/components/SocialTicker';
import LiveClasses from '@/components/LiveClasses';
import BlogPreview from '@/components/BlogPreview';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StatsTicker />
      <Categories />
      <AboutUs />
      <FeaturedCourses />
      <ProductVitrine />
      <TeamSection />
      <Newsletter />
      <Testimonials />
      <SocialTicker />
      <LiveClasses />
      <BlogPreview />
      <ContactForm />
      <Footer />
    </main>
  );
}
