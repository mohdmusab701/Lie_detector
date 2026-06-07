import { CheckCircle2, ShieldQuestion } from "lucide-react";

const tips = ["Verify before sharing", "Check source credibility", "Avoid forwarding suspicious media"];

export default function AwarenessScore({ score }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 60));

  return (
    <section className="rounded-[2rem] border border-white/[0.08] bg-black/65 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyanGlow/20 bg-cyanGlow/10 text-cyanGlow">
          <ShieldQuestion className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyanGlow">Digital Awareness Score</p>
          <h2 className="mt-2 text-3xl font-black text-white">{safeScore}/100</h2>
        </div>
      </div>
      <p className="mt-5 leading-7 text-stone-300">Based on your scan activity and media verification habits.</p>
      <div className="mt-5 h-3 rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-cyanGlow/80 to-mintGlow/80 shadow-[0_0_18px_rgba(134,217,232,0.18)]" style={{ width: `${safeScore}%` }} />
      </div>
      <div className="mt-6 grid gap-3">
        {tips.map((tip) => (
          <div key={tip} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-sm font-semibold text-stone-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-mintGlow" />
            {tip}
          </div>
        ))}
      </div>
    </section>
  );
}
