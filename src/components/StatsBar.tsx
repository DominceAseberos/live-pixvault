import { motion } from "framer-motion";

const stats = [
  { value: "∞", label: "GIFs via GIPHY", color: "text-primary" },
  { value: "500+", label: "UI Components", color: "text-secondary" },
  { value: "4", label: "Inspiration Sources", color: "text-accent" },
  { value: "$0", label: "Forever Free", color: "text-amber-tag" },
];

const StatsBar = () => {
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
