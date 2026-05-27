import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Gifs from "./pages/Gifs";
import Icons from "./pages/Icons";
import Components from "./pages/Components";
import Illustrations from "./pages/Illustrations";
import Inspiration from "./pages/Inspiration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gifs" element={<Gifs />} />
          <Route path="/icons" element={<Icons />} />
          <Route path="/components" element={<Components />} />
          <Route path="/photos" element={<Illustrations />} />
          <Route path="/inspiration" element={<Inspiration />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
