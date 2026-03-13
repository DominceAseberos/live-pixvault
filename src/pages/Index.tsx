import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import GifShowcase from "@/components/GifShowcase";
import IconShowcase from "@/components/IconShowcase";
import UIComponents from "@/components/UIComponents";
import IllustrationGallery from "@/components/IllustrationGallery";
import InspirationFeed from "@/components/InspirationFeed";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <GifShowcase />
      <IconShowcase />
      <UIComponents />
      <IllustrationGallery />
      <InspirationFeed />
      <Footer />
    </div>
  );
};

export default Index;
