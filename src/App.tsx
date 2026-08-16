import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { GlobalCommandMenu } from "@/components/GlobalCommandMenu";
const Index = lazy(() => import("./pages/Index"));
const Components = lazy(() => import("./pages/Components"));
const Gifs = lazy(() => import("./pages/Gifs"));
const Icons = lazy(() => import("./pages/Icons"));
const Illustrations = lazy(() => import("./pages/Illustrations"));
const Inspiration = lazy(() => import("./pages/Inspiration"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteFallback = () => (
  <main className="grid min-h-screen place-items-center bg-background text-foreground" aria-live="polite">
    <div className="text-center"><div className="mx-auto h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin" /><p className="mt-3 font-mono text-xs text-muted-foreground">Opening vault…</p></div>
  </main>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 60_000, refetchOnWindowFocus: false },
  },
});

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gifs" element={<Gifs />} />
            <Route path="/icons" element={<Icons />} />
            <Route path="/components" element={<Components />} />
            <Route path="/photos" element={<Illustrations />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <GlobalCommandMenu />
        </BrowserRouter>
      </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
