import { motion } from "framer-motion";
import { Activity, Image, Radar, Video } from "lucide-react";

function getPercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

export default function UsageAnalytics({ analytics }) {
  const totalMedia = analytics.imagesScanned + analytics.videosScanned;
  const totalVerdicts = analytics.aiGeneratedDetected + analytics.realMediaDetected;
  const metrics = [
    { label: "Images Scanned", value: getPercent(analytics.imagesScanned, totalMedia), count: analytics.imagesScanned, icon: Image },
    { label: "Videos Scanned", value: getPercent(analytics.videosScanned, totalMedia), count: analytics.videosScanned, icon: Video },
    { label: "AI Generated Detected", value: getPercent(analytics.aiGeneratedDetected, totalVerdicts), count: analytics.aiGeneratedDetected, icon: Radar },
    { label: "Real Media Detected", value: getPercent(analytics.realMediaDetected, totalVerdicts), count: analytics.realMediaDetected, icon: Activity },
  ];
  const chartBars = metrics.map((metric) => Math.max(8, metric.value || 0));

  return (
    <section className="rounded-[2rem] border border-white/[0.08] bg-black/65 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyanGlow">Usage Analytics</p>
          <h2 className="mt-2 text-2xl font-black text-white">Verification activity</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-stone-400">Live analytics from your saved detection history.</p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: index * 0.06 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/70 text-cyanGlow">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-2xl font-black text-white">{metric.count}</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-stone-300">{metric.label}</p>
              <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-cyanGlow/80" style={{ width: `${metric.value}%` }} />
              </div>
              <p className="mt-2 text-xs text-stone-500">{metric.value}% of matching scans</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex items-end gap-3 rounded-3xl border border-white/[0.08] bg-black/60 p-4">
        {chartBars.map((height, index) => (
            <div key={height + index} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-end rounded-t-xl bg-white/[0.07]" style={{ height: 96 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="mt-auto w-full rounded-t-xl bg-gradient-to-t from-cyanGlow/35 to-cyanGlow/80"
              />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">D{index + 1}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
