import Navbar from "@/components/Navbar";
import UIComponents from "@/components/UIComponents";
import Footer from "@/components/Footer";

const Components = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <UIComponents />
      </main>
      <Footer />
    </div>
  );
};

export default Components;
