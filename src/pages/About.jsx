import { motion } from "framer-motion";
import { Flag, Lightbulb, ShieldCheck, Users } from "lucide-react";

const missions = [
  { title: "Restore trust", copy: "Give users a clear way to question viral media before sharing it.", icon: ShieldCheck },
  { title: "Protect people", copy: "Reduce the harm caused by fake images, deepfakes, and fabricated evidence.", icon: Users },
  { title: "Inform decisions", copy: "Translate complex detection signals into practical confidence and risk language.", icon: Lightbulb },
  { title: "Build resilience", copy: "Support a safer information ecosystem as generative tools become more powerful.", icon: Flag },
];

export default function About() {
  return (
    <section className="container-shell py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violetGlow">About us</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">A verification layer for the synthetic media era</h1>
          <p className="mt-6 text-lg leading-8 text-stone-300">
            Lie_detector is a frontend concept for an AI detection platform that helps people evaluate whether images and videos are authentic or generated. It was created to make media verification approachable, fast, and understandable.
          </p>
          <p className="mt-4 leading-8 text-stone-400">
            The end goal is to help individuals, journalists, communities, and organizations respond to fake media before it becomes misinformation. The product is designed around transparency, confidence scoring, and practical risk communication.
          </p>
        </div>
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="relative border-l border-cyanGlow/25 pl-7">
            {["Identify suspicious media", "Explain detection signals", "Warn before misinformation spreads", "Create a safer public internet"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative pb-8 last:pb-0"
              >
                <span className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border border-cyanGlow/60 bg-black/75 shadow-[0_0_14px_rgba(134,217,232,0.12)]" />
                <p className="text-sm font-semibold text-cyanGlow">Phase {index + 1}</p>
                <h2 className="mt-1 text-xl font-bold text-white">{item}</h2>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {missions.map((mission, index) => {
          const Icon = mission.icon;
          return (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl p-6"
            >
              <Icon className="h-7 w-7 text-cyanGlow" />
              <h3 className="mt-5 text-xl font-bold text-white">{mission.title}</h3>
              <p className="mt-3 leading-7 text-stone-400">{mission.copy}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
