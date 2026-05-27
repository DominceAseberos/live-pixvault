import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Storyboard from "@/components/Storyboard";
import StatsBar from "@/components/StatsBar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <Storyboard />
        <div className="relative z-20 bg-background border-t border-border/50 pb-20">
          <StatsBar />
          
          {/* Final Navigation Grid */}
          <div className="container mx-auto px-4 mt-20 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/components" className="group p-8 rounded-3xl border border-border bg-card hover:bg-muted/50 transition-colors flex flex-col items-start justify-between min-h-[250px]">
                <div>
                  <h3 className="font-display text-3xl font-bold mb-2">UI Components</h3>
                  <p className="text-muted-foreground">Interactive elements & AI-generated designs.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
              <Link to="/gifs" className="group p-8 rounded-3xl border border-border bg-card hover:bg-muted/50 transition-colors flex flex-col items-start justify-between min-h-[250px]">
                <div>
                  <h3 className="font-display text-3xl font-bold mb-2">Cinematic GIFs</h3>
                  <p className="text-muted-foreground">Curated moving imagery for modern aesthetics.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
