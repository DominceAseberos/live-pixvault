import Navbar from "@/components/Navbar";
import IllustrationGallery from "@/components/IllustrationGallery";
import Footer from "@/components/Footer";

const Illustrations = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <IllustrationGallery />
      </main>
      <Footer />
    </div>
  );
};

export default Illustrations;
