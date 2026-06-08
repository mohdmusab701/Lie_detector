import { motion } from "framer-motion";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
    label: "Verification desk",
    className: "left-0 top-0 w-[58%]",
  },
  {
    src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=85",
    label: "Signal review",
    className: "right-0 top-20 w-[52%]",
  },
  {
    src: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=900&q=85",
    label: "Identity analysis",
    className: "bottom-0 left-[22%] w-[50%]",
  },
];

export default function CinematicGallery() {
  return (
    <section className="container-shell py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-amberGlow">Media intelligence</p>
          <h2 className="mt-5 max-w-xl text-3xl font-black tracking-tight text-stone-50 sm:text-5xl">
            A quieter way to inspect what the internet asks you to believe.
          </h2>
          <p className="mt-6 max-w-lg leading-8 text-stone-400">
            AI Lie Detector is designed around calm verification: visual evidence, source context, metadata signals, and confidence cues presented with restraint.
          </p>
          <div className="mt-8 h-px w-36 bg-gradient-to-r from-amberGlow/70 via-cyanGlow/30 to-transparent" />
        </div>

        <div className="relative min-h-[420px] sm:min-h-[520px]">
          <div className="absolute left-10 right-4 top-16 h-px bg-white/10" />
          <div className="absolute bottom-12 right-8 h-40 w-px bg-gradient-to-b from-transparent via-amberGlow/45 to-transparent" />
          {galleryImages.map((image, index) => (
            <motion.figure
              key={image.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.65, delay: index * 0.12 }}
              whileHover={{ y: -8, scale: 1.015 }}
              className={`absolute overflow-hidden border border-white/10 bg-black/75 shadow-2xl shadow-black/60 ${image.className}`}
            >
              <img
                src={image.src}
                alt={image.label}
                className="h-56 w-full object-cover grayscale-[20%] saturate-[0.75] transition duration-700 hover:scale-105 hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <figcaption className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-[0.22em] text-stone-200">
                {image.label}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
