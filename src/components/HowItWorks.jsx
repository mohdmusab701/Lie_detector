import { motion } from "framer-motion";
import { Binary, ScanLine, Upload } from "lucide-react";

const steps = [
  { title: "Upload media", copy: "Select an image or video sample for the demo analysis interface.", icon: Upload },
  { title: "AI scans patterns", copy: "The product checks artifacts, visual consistency, and synthetic signal markers.", icon: ScanLine },
  { title: "Result shown", copy: "A confidence score, risk level, and concise explanation are presented clearly.", icon: Binary },
];

export default function HowItWorks() {
  return (
    <section className="container-shell py-20">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violetGlow">How it works</p>
        <h2 className="section-title mt-3">A simple workflow for fast media trust checks</h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-bold text-stone-500">0{index + 1}</span>
                <Icon className="h-7 w-7 text-cyanGlow" />
              </div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-3 leading-7 text-stone-400">{step.copy}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
