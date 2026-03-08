import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Zap, Globe } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--neon-cyan)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--neon-cyan)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />

      <div className="container relative mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-mono text-xs text-primary">LIVE APIs</span>
            <span className="font-mono text-xs text-muted-foreground">· NO SUBSCRIPTION · 100% FREE</span>
          </div>

          <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold leading-tight text-foreground sm:text-6xl lg:text-7xl">
            Your free vault of{" "}
            <span className="text-gradient-cyan">design resources</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Trending GIFs, copy-paste UI components, and curated inspiration — 
            all live from free APIs. No accounts. No paywalls. Just resources.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#gif-showcase"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:scale-105 glow-cyan"
            >
              <Sparkles className="h-4 w-4" />
              Explore GIFs
            </a>
            <a
              href="#ui-components"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 font-display text-sm font-semibold text-foreground transition-all hover:border-secondary hover:bg-muted"
            >
              <Zap className="h-4 w-4 text-secondary" />
              UI Components
            </a>
            <a
              href="#inspiration"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3 font-display text-sm font-semibold text-foreground transition-all hover:border-accent hover:bg-muted"
            >
              <Globe className="h-4 w-4 text-accent" />
              Inspiration
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20"
        >
          <a href="#gif-showcase" className="inline-flex animate-float text-muted-foreground hover:text-primary transition-colors">
            <ArrowDown className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
