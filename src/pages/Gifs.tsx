import Navbar from "@/components/Navbar";
import GifShowcase from "@/components/GifShowcase";
import Footer from "@/components/Footer";

const Gifs = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <GifShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Gifs;
