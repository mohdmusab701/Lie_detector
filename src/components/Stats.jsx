import { motion } from "framer-motion";
import { ImageUp, Newspaper, ShieldCheck, Video } from "lucide-react";

const stats = [
  { value: "10,291+", label: "Fake Images Detected", icon: ImageUp, tone: "text-cyanGlow", glow: "hover:shadow-[0_0_34px_rgba(34,211,238,0.24)]" },
  { value: "8,786+", label: "Fake Videos Detected", icon: Video, tone: "text-violetGlow", glow: "hover:shadow-[0_0_34px_rgba(167,139,250,0.24)]" },
  { value: "15,267+", label: "Misinformation Cases Detected", icon: Newspaper, tone: "text-roseGlow", glow: "hover:shadow-[0_0_34px_rgba(251,113,133,0.24)]" },
  { value: "5,468+", label: "People Protected", icon: ShieldCheck, tone: "text-mintGlow", glow: "hover:shadow-[0_0_34px_rgba(52,211,153,0.22)]" },
];

export default function Stats() {
  return (
    <section className="container-shell py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`glass-card rounded-xl p-6 transition duration-300 ${stat.glow}`}
            >
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-black/75">
                <Icon className={`h-7 w-7 ${stat.tone}`} />
              </span>
              <p className="text-3xl font-black text-stone-50">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
