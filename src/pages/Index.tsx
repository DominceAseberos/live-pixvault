import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import GifShowcase from "@/components/GifShowcase";
import UIComponents from "@/components/UIComponents";
import InspirationFeed from "@/components/InspirationFeed";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <GifShowcase />
      <UIComponents />
      <InspirationFeed />
      <Footer />
    </div>
  );
};

export default Index;
