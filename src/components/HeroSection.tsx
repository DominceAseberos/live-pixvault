import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Command, Palette, MousePointer2 } from "lucide-react";
import { Link } from "react-router-dom";

const MIXED_CONTENT = {
  icons: [
    { icon: Sparkles, delay: 0.1, x: "-30vw", y: "-20vh", size: 40 },
    { icon: Command, delay: 0.3, x: "25vw", y: "-30vh", size: 48 },
    { icon: Palette, delay: 0.2, x: "35vw", y: "15vh", size: 32 },
    { icon: MousePointer2, delay: 0.4, x: "-20vw", y: "25vh", size: 56 },
  ],
  gifs: [
    { src: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjRteTNjcGxpMTl5d3VqcXZyaHZ1NWIzNWlzMzZ5bnc3bjg0aXJ6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif", delay: 0.1, x: "-25vw", y: "-15vh", width: 120 },
    { src: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXQwYzB4ZTNtbGNyNnIxbHZhdzBqcXZyaHZ1NWIzNWlzMzZ5bnc3biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn33aiTi1zSqC8U/giphy.gif", delay: 0.3, x: "30vw", y: "-20vh", width: 140 },
    { src: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y5Y2c0eGFmZG92NXF6ZTNtbGNyNnIxbHZhdzBqcXZyaHZ1NWIzNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0xeJpnrWC4XWblN6/giphy.gif", delay: 0.2, x: "-30vw", y: "20vh", width: 150 },
  ],
  ui: [
    { type: 'button', label: 'Primary Button', delay: 0.1, x: "28vw", y: "20vh" },
    { type: 'toggle', delay: 0.3, x: "-35vw", y: "10vh" },
    { type: 'card', delay: 0.2, x: "-25vw", y: "-25vh" },
    { type: 'badge', label: 'New Feature', delay: 0.4, x: "25vw", y: "-10vh" }
  ]
};

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background pt-16">
      {/* Minimal Background Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Floating Elements Background - Mixed */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0">
        {MIXED_CONTENT.icons.map((item, i) => (
          <motion.div
            key={`icon-${i}`}
            initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
            animate={{ opacity: 0.15, scale: 1, x: item.x, y: item.y }}
            whileHover={{ opacity: 0.8, scale: 1.2, rotate: 10, cursor: 'pointer' }}
            transition={{ duration: 1.2, delay: item.delay, type: "spring", bounce: 0.3 }}
            className="absolute text-foreground"
          >
            <item.icon size={item.size} strokeWidth={1.5} />
          </motion.div>
        ))}
        
        {MIXED_CONTENT.gifs.map((item, i) => (
          <motion.img
            key={`gif-${i}`}
            src={item.src}
            initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
            animate={{ opacity: 0.3, scale: 1, x: item.x, y: item.y }}
            whileHover={{ opacity: 1, scale: 1.1, filter: "grayscale(0%)", cursor: 'pointer' }}
            transition={{ duration: 1.2, delay: item.delay + 0.2, type: "spring", bounce: 0.3 }}
            className="absolute rounded-lg object-cover grayscale transition-all duration-300"
            style={{ width: item.width }}
            alt="Floating GIF"
          />
        ))}

        {MIXED_CONTENT.ui.map((item, i) => (
          <motion.div
            key={`ui-${i}`}
            initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
            animate={{ opacity: 0.3, scale: 1, x: item.x, y: item.y }}
            whileHover={{ opacity: 1, scale: 1.1, cursor: 'pointer' }}
            transition={{ duration: 1.2, delay: item.delay + 0.4, type: "spring", bounce: 0.3 }}
            className="absolute"
          >
            {item.type === 'button' && (
              <div className="px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium shadow-lg pointer-events-auto">
                {item.label}
              </div>
            )}
            {item.type === 'toggle' && (
              <div className="w-10 h-6 bg-muted rounded-full relative border border-border shadow-sm pointer-events-auto">
                <div className="absolute left-1 top-1 w-4 h-4 bg-foreground rounded-full" />
              </div>
            )}
            {item.type === 'card' && (
              <div className="w-32 h-24 bg-card rounded-xl border border-border shadow-xl p-3 flex flex-col gap-2 pointer-events-auto">
                <div className="w-full h-3 bg-muted rounded-sm" />
                <div className="w-2/3 h-2 bg-muted rounded-sm" />
                <div className="w-1/2 h-2 bg-muted rounded-sm" />
              </div>
            )}
            {item.type === 'badge' && (
              <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold pointer-events-auto">
                {item.label}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="container relative mx-auto px-4 text-center z-10 flex flex-col items-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center w-full max-w-4xl pointer-events-auto"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 backdrop-blur-md px-4 py-1.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs font-medium text-foreground uppercase tracking-wider">Design System Explorer</span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            The minimal vault for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">modern builders</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground font-light leading-relaxed">
            Curated, high-quality design resources. No clutter, no noise. Just what you need to ship exceptional interfaces with confidence.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/gifs"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 font-display text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Start Exploring
              <ArrowDown className="h-4 w-4 opacity-70 group-hover:translate-y-1 transition-transform" />
            </Link>
            <Link
              to="/components"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/50 backdrop-blur-sm px-8 py-3.5 font-display text-sm font-medium text-foreground transition-all hover:bg-muted"
            >
              View Documentation
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
