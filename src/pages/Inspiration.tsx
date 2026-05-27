import Navbar from "@/components/Navbar";
import InspirationFeed from "@/components/InspirationFeed";
import Footer from "@/components/Footer";

const Inspiration = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <InspirationFeed />
      </main>
      <Footer />
    </div>
  );
};

export default Inspiration;
