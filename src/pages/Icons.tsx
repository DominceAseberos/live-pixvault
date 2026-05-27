import Navbar from "@/components/Navbar";
import IconShowcase from "@/components/IconShowcase";
import Footer from "@/components/Footer";

const Icons = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <IconShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Icons;
