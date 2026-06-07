import { motion } from "framer-motion";
import { BadgeCheck, BrainCircuit, Gauge, ScanLine } from "lucide-react";

const cardMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: index * 0.07, ease: "easeOut" },
  }),
};

const icons = {
  plan: BadgeCheck,
  attempts: Gauge,
  scans: ScanLine,
  detected: BrainCircuit,
};

export default function OverviewCards({ overview }) {
  const cards = [
    { id: "plan", label: "Current Plan", value: overview.currentPlan, helper: "Active access tier" },
    { id: "attempts", label: "Attempts Left", value: overview.attemptsLeft, helper: "Available scans now" },
    { id: "scans", label: "Total Scans", value: overview.totalScans, helper: "Saved detection history" },
    { id: "detected", label: "AI Media Detected", value: overview.aiMediaDetected, helper: "AI probability 75% or higher" },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = icons[card.id];
        return (
          <motion.article
            key={card.id}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardMotion}
            whileHover={{ y: -5 }}
            className="rounded-3xl border border-white/[0.08] bg-black/70 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl transition hover:border-cyanGlow/25 hover:shadow-[0_0_26px_rgba(134,217,232,0.10)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyanGlow/20 bg-cyanGlow/10 text-cyanGlow">
                <Icon className="h-5 w-5" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1 text-xs font-semibold text-stone-400">
                Live
              </span>
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">{card.label}</p>
            <p className="mt-2 text-3xl font-black capitalize text-white">{card.value}</p>
            <p className="mt-2 text-sm text-stone-400">{card.helper}</p>
          </motion.article>
        );
      })}
    </section>
  );
}
