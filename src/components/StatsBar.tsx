import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { COMPONENTS } from "@/data/componentCatalog";
import { countAIComponents } from "@/services/component.service";

const StatsBar = () => {
  const { data: aiCount = 0 } = useQuery({ queryKey: ["components", "count"], queryFn: countAIComponents });
  const componentCount = COMPONENTS.length + aiCount;
  const stats = [
    { value: "200k+", label: "Icons via Iconify", color: "text-primary" },
    { value: `${componentCount}+`, label: "UI Components", color: "text-secondary" },
    { value: "10+", label: "Inspiration Layouts", color: "text-accent" },
    { value: "$0", label: "No account needed", color: "text-amber-tag" },
  ];
  return <section className="border-y border-border bg-muted/30"><div className="container mx-auto px-4 py-8"><div className="grid grid-cols-2 gap-6 md:grid-cols-4">{stats.map((stat, i) => <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center"><div className={`font-display text-3xl font-bold ${stat.color}`}>{stat.value}</div><div className="mt-1 font-mono text-xs text-muted-foreground">{stat.label}</div></motion.div>)}</div></div></section>;
};
export default StatsBar;
