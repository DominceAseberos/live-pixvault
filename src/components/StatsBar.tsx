import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { COMPONENTS } from "@/components/UIComponents";

const StatsBar = () => {
  const [componentCount, setComponentCount] = useState(COMPONENTS.length);

  useEffect(() => {
    async function getCount() {
      const { count, error } = await supabase
        .from('components')
        .select('*', { count: 'exact', head: true });
        
      if (!error && count !== null) {
        setComponentCount(COMPONENTS.length + count);
      }
    }
    getCount();
  }, []);

  const stats = [
    { value: "200k+", label: "Icons via Iconify", color: "text-primary" },
    { value: `${componentCount}+`,   label: "UI Components", color: "text-secondary" },
    { value: "10+",   label: "Inspiration Layouts", color: "text-accent" },
    { value: "$0",    label: "No account needed", color: "text-amber-tag" },
  ];

  return (
    <section className="border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`font-display text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
