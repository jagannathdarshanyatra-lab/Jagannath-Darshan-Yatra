import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedPackages from "@/components/home/FeaturedPackages";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import ComingSoonStates from "@/components/home/ComingSoonStates";
import Newsletter from "@/components/home/Newsletter";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Best Travel Agency for Puri & Odisha" 
        description="Experience the best of Puri and Odisha with Bharat Darshan. We offer curated Jagannath Puri tours, beach packages, and heritage experiences." 
        keywords="Puri travelling, Jagannath Puri tour, Odisha travel agency, best tour packages India, Puri beach tour"
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedPackages />
        <WhyChooseUs />
        <Testimonials />
        <ComingSoonStates />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
