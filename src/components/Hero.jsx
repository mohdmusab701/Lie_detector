import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Database, Fingerprint, ScanFace, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const heroText = "Detect AI-generated images and videos before they Shape the Truth";
const faceImage =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85";

const analysisCards = [
  {
    title: "Metadata Check",
    value: "Missing / Altered",
    icon: Database,
    accent: "text-roseGlow",
    border: "border-roseGlow/25",
    delay: 0,
  },
  {
    title: "Face Consistency",
    metric: "faceConsistency",
    detail: "Consistent",
    icon: ShieldCheck,
    accent: "text-mintGlow",
    border: "border-mintGlow/25",
    delay: 0.18,
  },
  {
    title: "Texture Analysis",
    metric: "textureAnalysis",
    detail: "AI Patterns Detected",
    icon: Fingerprint,
    accent: "text-amberGlow",
    border: "border-amberGlow/25",
    delay: 0.34,
  },
  {
    title: "Deepfake Check",
    metric: "deepfakeCheck",
    detail: "Likely AI Generated",
    icon: AlertTriangle,
    accent: "text-roseGlow",
    border: "border-roseGlow/25",
    delay: 0.52,
  },
  {
    title: "Source Verification",
    value: "Unverified",
    icon: Waves,
    accent: "text-stone-300",
    border: "border-white/15",
    delay: 0.68,
  },
];

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [metrics, setMetrics] = useState({
    aiProbability: 82,
    faceConsistency: 94,
    textureAnalysis: 78,
    deepfakeCheck: 85,
  });

  useEffect(() => {
    let index = 0;
    let deleting = false;
    let timeoutId;

    const type = () => {
      if (!deleting && index <= heroText.length) {
        setTypedText(heroText.slice(0, index));
        index += 1;
        const rhythm = 68 + Math.random() * 42;
        timeoutId = window.setTimeout(type, index === heroText.length + 1 ? 1900 : rhythm);
        return;
      }

      deleting = true;
      if (index >= 0) {
        setTypedText(heroText.slice(0, index));
        index -= 1;
        timeoutId = window.setTimeout(type, index < 0 ? 800 : 34);
        return;
      }

      deleting = false;
      index = 0;
      timeoutId = window.setTimeout(type, 500);
    };

    type();
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const targets = [
      { aiProbability: 92, faceConsistency: 98, textureAnalysis: 89, deepfakeCheck: 92 },
      { aiProbability: 86, faceConsistency: 96, textureAnalysis: 83, deepfakeCheck: 88 },
      { aiProbability: 90, faceConsistency: 97, textureAnalysis: 86, deepfakeCheck: 91 },
      { aiProbability: 82, faceConsistency: 94, textureAnalysis: 78, deepfakeCheck: 85 },
    ];
    let targetIndex = 0;

    const intervalId = window.setInterval(() => {
      const target = targets[targetIndex];
      setMetrics((current) => {
        const next = {};
        for (const key of Object.keys(current)) {
          const delta = target[key] - current[key];
          next[key] = Math.abs(delta) <= 1 ? target[key] : current[key] + Math.sign(delta);
        }

        const reached = Object.keys(target).every((key) => next[key] === target[key]);
        if (reached) {
          targetIndex = (targetIndex + 1) % targets.length;
        }

        return next;
      });
    }, 120);

    return () => window.clearInterval(intervalId);
  }, []);

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x, y });
  };

  return (
    <section className="container-shell grid min-h-[calc(100vh-5rem)] items-center gap-8 py-10 lg:grid-cols-[0.45fr_0.55fr] lg:gap-6 xl:max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyanGlow/25 bg-cyanGlow/10 px-4 py-2 text-sm text-cyanGlow">
          <Sparkles className="h-4 w-4" />
          Media authenticity scanner
        </div>
        <h1 className="flex min-h-[8.25rem] max-w-3xl items-start text-[clamp(2.15rem,4vw,3.1rem)] font-black leading-[1.08] tracking-tight text-white sm:min-h-[9.75rem] lg:min-h-[10.25rem]">
          <span className="text-stone-50">
            {typedText}
          </span>
          <motion.span
            className="ml-1 mt-1 inline-block h-9 w-px shrink-0 rounded-full bg-cyanGlow shadow-[0_0_14px_rgba(134,217,232,0.18)] sm:h-11 lg:h-14"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-stone-400 sm:text-lg sm:leading-8">
          AI Lie Detector helps people identify suspicious synthetic media, reduce misinformation risk, and make faster trust decisions with clear confidence signals.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a href="#upload" className="glow-button">
            Start Detection <ScanFace className="h-4 w-4" />
          </a>
          <Link to="/trending" className="ghost-button">
            Explore Trending Fakes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.12 }}
        className="relative ml-auto min-h-[520px] w-full max-w-[500px] -translate-x-12 overflow-visible pr-6 sm:min-h-[540px] sm:pr-7 lg:min-h-[560px]"
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <motion.div
          className="absolute left-[48%] top-8 h-[430px] w-[74%] max-w-[340px] -translate-x-1/2 rounded-full border border-cyanGlow/10 bg-[radial-gradient(circle,rgba(134,217,232,0.10),transparent_62%)]"
          animate={{ y: [0, -12, 0], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute left-[48%] top-10 z-10 w-[68%] min-w-[270px] max-w-[330px] -translate-x-1/2 rounded-[1.45rem] border border-cyanGlow/24 bg-black/75 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.52),0_0_28px_rgba(134,217,232,0.09)] backdrop-blur-2xl sm:p-4"
          animate={{
            y: [0, -12, 0],
            rotateX: tilt.y,
            rotateY: tilt.x,
          }}
          transition={{ type: "spring", stiffness: 70, damping: 18 }}
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[1.45rem] bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_32%,rgba(134,217,232,0.08)_54%,transparent_70%)] opacity-50" />
          <div className="relative overflow-hidden rounded-2xl border border-cyanGlow/22 bg-black/75 p-3">
            <div className="mb-3 flex items-center justify-between text-[0.62rem] font-bold uppercase tracking-[0.22em] text-cyanGlow">
              <span>Media Analysis</span>
              <span className="rounded-md border border-cyanGlow/25 px-2 py-1">AI</span>
            </div>

            <div className="relative aspect-square overflow-hidden rounded-xl border border-cyanGlow/25 bg-black">
              <img src={faceImage} alt="Media analysis preview" className="h-full w-full object-cover grayscale-[18%] saturate-[0.78]" />
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l border-cyanGlow/55 bg-black/10">
                <img
                  src={faceImage}
                  alt=""
                  className="absolute right-0 h-full w-[200%] object-cover grayscale opacity-35"
                />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(134,217,232,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(134,217,232,0.32)_1px,transparent_1px)] bg-[size:12px_12px] mix-blend-screen" />
                <div className="absolute inset-0 bg-cyanGlow/10" />
              </div>
              <motion.div
                className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-cyanGlow/28 to-transparent blur-sm"
                animate={{ x: [-120, 390] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyanGlow/80 to-transparent"
                animate={{ y: [-95, 95, -95], opacity: [0.25, 0.95, 0.25] }}
                transition={{ duration: 4.3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49.8%,rgba(134,217,232,0.35)_50%,transparent_50.2%)]" />
            </div>

            <div className="mt-4">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-stone-400">AI Probability</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <motion.p
                    className="text-4xl font-black leading-none text-cyanGlow"
                    animate={{ textShadow: ["0 0 8px rgba(134,217,232,0.12)", "0 0 18px rgba(134,217,232,0.28)", "0 0 8px rgba(134,217,232,0.12)"] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {metrics.aiProbability}%
                  </motion.p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-mintGlow">High Confidence</p>
                </div>
                <div className="mb-1 h-3 flex-1 overflow-hidden rounded-full border border-cyanGlow/20 bg-white/[0.035]">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(134,217,232,0.35),rgba(143,199,164,0.85))]"
                    animate={{ width: `${metrics.aiProbability}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {analysisCards.map((card, index) => (
          <AnalysisCard key={card.title} card={card} index={index} metrics={metrics} />
        ))}
      </motion.div>
    </section>
  );
}

function AnalysisCard({ card, index, metrics }) {
  const Icon = card.icon;
  const value = card.metric ? `${metrics[card.metric]}%` : card.value;
  const positions = [
    "left-5 top-[88px] sm:left-8",
    "right-8 top-[86px] sm:right-10",
    "right-9 top-[192px] sm:right-12",
    "right-12 top-[298px] sm:right-14",
    "left-8 top-[384px] sm:left-12",
  ];

  return (
    <motion.div
      className={`absolute z-20 w-[clamp(8.5rem,26vw,9.75rem)] rounded-xl border ${card.border} bg-black/75 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl ${positions[index]}`}
      animate={{ y: [0, -7, 0], scale: [1, 1.015, 1] }}
      transition={{ duration: 3.8, delay: card.delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex items-start gap-2.5">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035] ${card.accent}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.52rem] font-bold uppercase tracking-[0.15em] text-stone-500">{card.title}</p>
          <p className={`mt-1 text-sm font-black leading-tight ${card.accent}`}>{value}</p>
          {card.detail && <p className="mt-1 text-[0.68rem] text-stone-300">{card.detail}</p>}
        </div>
      </div>
      {card.metric && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className={`h-full rounded-full ${card.metric === "textureAnalysis" ? "bg-amberGlow" : card.metric === "faceConsistency" ? "bg-mintGlow" : "bg-roseGlow"}`}
            animate={{ width: `${metrics[card.metric]}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      )}
    </motion.div>
  );
}
