import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MousePointer2, Image as ImageIcon, Video, Sparkles, Layers, Box, Check, Copy } from "lucide-react";

export default function Storyboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // ==========================================
  // PHASE 1: Photos Looping Mosaic (0.0 to 0.2)
  // ==========================================
  const photosOpacity = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.2], [0, 1, 1, 0]);
  const photosY = useTransform(scrollYProgress, [0, 0.05, 0.2], [100, 0, -100]);

  // Looping mosaic state
  const [photoGrid, setPhotoGrid] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  useEffect(() => {
    const interval = setInterval(() => {
      setPhotoGrid(prev => {
        const next = [...prev];
        const randomSlot = Math.floor(Math.random() * 9);
        const randomImage = Math.floor(Math.random() * 10) + 1; // 1 to 10
        next[randomSlot] = randomImage;
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // PHASE 2: Expanding GIF Center-Split (0.2 to 0.4)
  // ==========================================
  const gifsOpacity = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]);
  
  // Center GIF grows first
  const centerGifScale = useTransform(scrollYProgress, [0.22, 0.26], [0, 1]);
  // Then slides left to make room for text
  const centerGifX = useTransform(scrollYProgress, [0.28, 0.30], ["0%", "-150%"]);
  
  // Right GIF slides right
  const rightGifX = useTransform(scrollYProgress, [0.28, 0.30], ["0%", "150%"]);
  const rightGifOpacity = useTransform(scrollYProgress, [0.27, 0.29], [0, 1]);

  // Text reveals exactly at 0.30 when GIFs are split
  const gifTextOpacity = useTransform(scrollYProgress, [0.29, 0.31], [0, 1]);
  const gifTextY = useTransform(scrollYProgress, [0.29, 0.31], [40, 0]);

  // ==========================================
  // PHASE 3: Scattered Inspiration (0.4 to 0.6)
  // ==========================================
  const inspoOpacity = useTransform(scrollYProgress, [0.4, 0.45, 0.55, 0.6], [0, 1, 1, 0]);
  const inspoTextOpacity = useTransform(scrollYProgress, [0.41, 0.43], [0, 1]);
  
  // 5 scattered cards appearing sequentially
  const scatter1Op = useTransform(scrollYProgress, [0.44, 0.46], [0, 1]);
  const scatter1Sc = useTransform(scrollYProgress, [0.44, 0.46], [0.5, 1]);
  
  const scatter2Op = useTransform(scrollYProgress, [0.46, 0.48], [0, 1]);
  const scatter2Sc = useTransform(scrollYProgress, [0.46, 0.48], [0.5, 1]);

  const scatter3Op = useTransform(scrollYProgress, [0.48, 0.50], [0, 1]);
  const scatter3Sc = useTransform(scrollYProgress, [0.48, 0.50], [0.5, 1]);

  const scatter4Op = useTransform(scrollYProgress, [0.50, 0.52], [0, 1]);
  const scatter4Sc = useTransform(scrollYProgress, [0.50, 0.52], [0.5, 1]);

  const scatter5Op = useTransform(scrollYProgress, [0.52, 0.54], [0, 1]);
  const scatter5Sc = useTransform(scrollYProgress, [0.52, 0.54], [0.5, 1]);

  // ==========================================
  // PHASE 4: UI Components & Magic Cursor (0.6 to 0.9)
  // ==========================================
  const uiOpacity = useTransform(scrollYProgress, [0.6, 0.65, 0.88, 0.9], [0, 1, 1, 0]);
  const uiY = useTransform(scrollYProgress, [0.6, 0.65, 0.9], [100, 0, -100]);

  // Magic Cursor Logic - Adjusted for extreme precision to hit the center of the button
  // Button is centered in a 350x250 card. 
  // Magic Cursor Logic
  // The button is centered horizontally (50%) and slightly below center vertically (around 70% of the box height).
  // We animate the cursor from bottom-right (100%, 100%) to the button center.
  const cursorLeft = useTransform(scrollYProgress, [0.65, 0.70, 0.84, 0.88], ["100%", "48%", "48%", "100%"]);
  const cursorTop = useTransform(scrollYProgress, [0.65, 0.70, 0.84, 0.88], ["100%", "82%", "82%", "100%"]);
  
  const buttonScale = useTransform(scrollYProgress, [0.70, 0.71, 0.72], [1, 0.9, 1]);
  const buttonBg = useTransform(scrollYProgress, [0.70, 0.71, 0.72], ["hsl(var(--foreground))", "hsl(var(--primary))", "hsl(var(--foreground))"]);
  const buttonRadius = useTransform(scrollYProgress, [0.70, 0.71, 0.72], ["9999px", "12px", "9999px"]);
  const loadingWidth = useTransform(scrollYProgress, [0.72, 0.78], ["0%", "100%"]);

  // Box Swap - After loading completes at 0.78, swap the content at 0.80
  const [showUIComponents, setShowUIComponents] = useState(false);
  
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      if (v > 0.79) {
        setShowUIComponents(true);
      } else {
        setShowUIComponents(false);
      }
    });
    return () => unsub();
  }, [scrollYProgress]);

  // ==========================================
  // PHASE 5: Resolution CTA (0.9 to 1.0)
  // ==========================================
  const ctaOpacity = useTransform(scrollYProgress, [0.9, 0.95, 1], [0, 1, 1]);
  const ctaScale = useTransform(scrollYProgress, [0.9, 0.95, 1], [0.9, 1, 1]);

  return (
    <div ref={containerRef} className="relative w-full h-[800vh] bg-background">
      
      {/* Sticky Container */}
      <div className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden px-4 pointer-events-none">
        
        {/* ================= PHASE 1: Photos Mosaic ================= */}
        <motion.div 
          className="absolute flex flex-col md:flex-row items-center justify-between w-full max-w-7xl gap-12"
          style={{ opacity: photosOpacity, y: photosY }}
        >
          <div className="flex-1 text-left">
            <div className="p-3 bg-muted rounded-full w-fit mb-6">
              <ImageIcon className="w-6 h-6 text-foreground" />
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Uncompromising Clarity.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground/50 to-muted-foreground">Royalty-Free 4K.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-md">
              A meticulously curated collection of high-resolution photography. Cached locally for zero-latency delivery.
            </p>
          </div>
          
          {/* 3x3 Looping Mosaic */}
          <div className="flex-1 w-full relative grid grid-cols-3 gap-2 h-[450px]">
            {photoGrid.map((imgNum, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-xl border border-border/50 bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={`${idx}-${imgNum}`}
                    src={`/assets/photos/photo_${imgNum}.jpg`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Mosaic Element"
                  />
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ================= PHASE 2: Expanding GIF Center-Split ================= */}
        <motion.div 
          className="absolute flex items-center justify-center w-full h-full"
          style={{ opacity: gifsOpacity }}
        >
          {/* Central Reveal Text */}
          <motion.div 
            className="absolute text-center z-10"
            style={{ opacity: gifTextOpacity, y: gifTextY }}
          >
            <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-6">
              <Video className="w-6 h-6 text-foreground" />
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight shadow-background text-shadow-xl">
              Cinematic Motion.<br />Perfected.
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-md mx-auto bg-background/50 backdrop-blur-sm rounded-full px-4 py-2">
              Looping assets that add weight to your UI without the heavy cost of video.
            </p>
          </motion.div>

          {/* The Expanding Center GIF */}
          <motion.div 
            className="absolute z-0 w-[400px] h-[300px] rounded-2xl overflow-hidden shadow-2xl border border-border"
            style={{ scale: centerGifScale, x: centerGifX }}
          >
            <img src="/assets/gifs/gif_1.gif" className="w-full h-full object-cover" alt="Center GIF" />
          </motion.div>

          {/* The Right Split GIF */}
          <motion.div 
            className="absolute z-0 w-[400px] h-[300px] rounded-2xl overflow-hidden shadow-2xl border border-border"
            style={{ opacity: rightGifOpacity, x: rightGifX }}
          >
            <img src="/assets/gifs/gif_2.gif" className="w-full h-full object-cover" alt="Right GIF" />
          </motion.div>
        </motion.div>

        {/* ================= PHASE 3: Scattered Inspiration ================= */}
        <motion.div 
          className="absolute w-full h-full flex items-center justify-center"
          style={{ opacity: inspoOpacity }}
        >
          <motion.div className="text-center z-20 bg-background/80 backdrop-blur-md p-8 rounded-3xl border border-border shadow-2xl" style={{ opacity: inspoTextOpacity }}>
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-4">
              Architectural Inspiration.
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Premium Layouts & Typography. Scattered for discovery.
            </p>
          </motion.div>

          {/* Scattered Layout Cards */}
          <motion.div className="absolute top-[10%] left-[10%] w-[250px] h-[350px] rounded-2xl overflow-hidden border-4 border-background shadow-2xl rotate-[-6deg]" style={{ opacity: scatter1Op, scale: scatter1Sc }}>
            <img src="/assets/inspo/layout_1.jpg" className="w-full h-full object-cover" alt="Inspo 1" />
          </motion.div>
          <motion.div className="absolute top-[15%] right-[15%] w-[220px] h-[320px] rounded-2xl overflow-hidden border-4 border-background shadow-2xl rotate-[8deg]" style={{ opacity: scatter2Op, scale: scatter2Sc }}>
            <img src="/assets/inspo/layout_2.jpg" className="w-full h-full object-cover" alt="Inspo 2" />
          </motion.div>
          <motion.div className="absolute bottom-[20%] left-[20%] w-[280px] h-[200px] rounded-2xl overflow-hidden border-4 border-background shadow-2xl rotate-[4deg]" style={{ opacity: scatter3Op, scale: scatter3Sc }}>
            <img src="/assets/inspo/layout_3.jpg" className="w-full h-full object-cover" alt="Inspo 3" />
          </motion.div>
          <motion.div className="absolute bottom-[10%] right-[10%] w-[240px] h-[300px] rounded-2xl overflow-hidden border-4 border-background shadow-2xl rotate-[-12deg]" style={{ opacity: scatter4Op, scale: scatter4Sc }}>
            <img src="/assets/inspo/layout_4.jpg" className="w-full h-full object-cover" alt="Inspo 4" />
          </motion.div>
          <motion.div className="absolute top-[40%] right-[30%] w-[180px] h-[240px] rounded-2xl overflow-hidden border-4 border-background shadow-2xl rotate-[15deg] z-10" style={{ opacity: scatter5Op, scale: scatter5Sc }}>
            <img src="/assets/inspo/layout_5.jpg" className="w-full h-full object-cover" alt="Inspo 5" />
          </motion.div>
        </motion.div>

        {/* ================= PHASE 4: UI Components & The Magic Box ================= */}
        <motion.div 
          className="absolute flex flex-col items-center w-full max-w-5xl"
          style={{ opacity: uiOpacity, y: uiY }}
        >
          <div className="mb-12 text-center">
            <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-6">
              <Layers className="w-6 h-6 text-foreground" />
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-4">
              Engineered Components.
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Don't reinvent the wheel. Copy, paste, and deploy in seconds.
            </p>
          </div>
          
          {/* THE MAGIC INTERACTIVE BOX */}
          <div className="relative w-[500px] h-[350px] bg-card border border-border rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center overflow-hidden">
            
            <AnimatePresence mode="wait">
              {!showUIComponents ? (
                <motion.div 
                  key="deploy-ui"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center w-full h-full"
                >
                  <Box className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-bold text-2xl mb-2">Initialize Sub-systems</h3>
                  <p className="text-sm text-muted-foreground mb-12 text-center max-w-xs">Connecting to the Vault and hydrating local component trees.</p>
                  
                  {/* The Animated Button */}
                  <motion.div 
                    className="relative px-8 py-4 mt-6 text-background font-semibold shadow-md flex items-center justify-center overflow-hidden"
                    style={{ scale: buttonScale, backgroundColor: buttonBg, borderRadius: buttonRadius }}
                  >
                    <span className="relative z-10">Run Hydration Sequence</span>
                    
                    {/* The Loading Progress Bar inside the button */}
                    <motion.div 
                      className="absolute left-0 top-0 h-full bg-primary/30 backdrop-blur-md z-0"
                      style={{ width: loadingWidth }}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  key="components-ui"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 w-full h-full bg-card p-6 grid grid-cols-2 gap-4"
                >
                  {/* Fake UI Component Grid inside the box */}
                  <div className="col-span-2 flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm">Components Hydrated</h4>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  
                  <div className="bg-muted rounded-xl p-4 flex flex-col items-center justify-center border border-border/50 group">
                    <button className="px-4 py-2 bg-foreground text-background text-xs rounded-md shadow-md mb-3">Neo Button</button>
                    <div className="w-full flex justify-between items-center px-2">
                      <span className="text-[10px] text-muted-foreground font-mono">CSS</span>
                      <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground cursor-pointer" />
                    </div>
                  </div>
                  
                  <div className="bg-muted rounded-xl p-4 flex flex-col items-center justify-center border border-border/50 group">
                    <input type="text" placeholder="Search..." className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs mb-3" />
                    <div className="w-full flex justify-between items-center px-2">
                      <span className="text-[10px] text-muted-foreground font-mono">React</span>
                      <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground cursor-pointer" />
                    </div>
                  </div>
                  
                  <div className="bg-muted rounded-xl p-4 flex flex-col items-center justify-center border border-border/50 group">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                    <div className="w-full flex justify-between items-center px-2">
                      <span className="text-[10px] text-muted-foreground font-mono">CSS</span>
                      <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground cursor-pointer" />
                    </div>
                  </div>

                  <div className="bg-muted rounded-xl p-4 flex flex-col items-center justify-center border border-border/50 group">
                    <div className="w-10 h-6 bg-primary rounded-full relative mb-3 shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-background rounded-full"></div></div>
                    <div className="w-full flex justify-between items-center px-2">
                      <span className="text-[10px] text-muted-foreground font-mono">Tailwind</span>
                      <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground cursor-pointer" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Animated Mouse Cursor */}
            <motion.div 
              className="absolute z-50 text-foreground drop-shadow-lg"
              style={{ left: cursorLeft, top: cursorTop, x: "-50%", y: "-50%" }}
            >
              <MousePointer2 className="w-10 h-10 fill-foreground" />
            </motion.div>
            
          </div>
        </motion.div>

        {/* ================= PHASE 5: Resolution CTA ================= */}
        <motion.div 
          className="absolute flex flex-col items-center text-center max-w-2xl"
          style={{ opacity: ctaOpacity, scale: ctaScale }}
        >
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8">
            Deploy with <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">Velocity.</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            The era of searching for assets is over. Access the Vault.
          </p>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12" />
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
            Welcome to the future of frontend
          </p>
        </motion.div>

      </div>
    </div>
  );
}
