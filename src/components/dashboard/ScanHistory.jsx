import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, Trash2, X } from "lucide-react";
import { useState } from "react";
import { downloadDashboardReportFromApi, getReportDownloadErrorMessage } from "../../utils/dashboardReport.js";

function formatDisplayDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString();
}

function formatMediaType(value) {
  if (!value) return "Media";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ActionButton({ children, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/70 text-stone-300 transition hover:-translate-y-0.5 hover:border-cyanGlow/25 hover:text-white"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

export default function ScanHistory({ items, onDelete }) {
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [downloading, setDownloading] = useState(false);

  const downloadReport = async () => {
    try {
      setDownloading(true);
      setNotice("");
      await downloadDashboardReportFromApi();
      setNotice("Report downloaded.");
    } catch (error) {
      console.error("Report download failed:", error);
      setNotice(await getReportDownloadErrorMessage(error));
    } finally {
      setDownloading(false);
      window.setTimeout(() => setNotice(""), 2600);
    }
  };

  const deleteItem = async (id) => {
    try {
      setDeletingId(id);
      await onDelete(id);
      if (selected?._id === id) setSelected(null);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/[0.08] bg-black/65 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyanGlow">Scan History</p>
          <h2 className="mt-2 text-2xl font-black text-white">Recent media checks</h2>
        </div>
        {notice && <p className="rounded-full border border-amberGlow/20 bg-amberGlow/10 px-3 py-1.5 text-sm font-semibold text-amberGlow">{notice}</p>}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-3xl border border-white/[0.08] md:block">
        <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr] gap-4 bg-white/[0.035] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
          <span>File</span>
          <span>Type</span>
          <span>AI Probability</span>
          <span>Verdict</span>
          <span>Date</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-white/[0.08]">
          {items.map((item) => (
            <div key={item._id} className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr] items-center gap-4 px-4 py-4 text-sm text-stone-300">
              <span className="truncate font-semibold text-white">{item.fileName}</span>
              <span>{formatMediaType(item.mediaType)}</span>
              <span className="font-bold text-cyanGlow">{item.aiProbability}%</span>
              <span>{item.verdict}</span>
              <span>{formatDisplayDate(item.createdAt)}</span>
              <span className="flex items-center gap-2">
                <ActionButton label="View Result" onClick={() => setSelected(item)}><Eye className="h-4 w-4" /></ActionButton>
                <ActionButton label={downloading ? "Preparing Report" : "Download Report"} onClick={downloadReport}><Download className={`h-4 w-4 ${downloading ? "opacity-50" : ""}`} /></ActionButton>
                <ActionButton label="Delete" onClick={() => deleteItem(item._id)}><Trash2 className={`h-4 w-4 text-roseGlow ${deletingId === item._id ? "opacity-50" : ""}`} /></ActionButton>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:hidden">
        {items.map((item) => (
          <article key={item._id} className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-white">{item.fileName}</h3>
                <p className="mt-1 text-sm text-stone-400">{formatMediaType(item.mediaType)} - {formatDisplayDate(item.createdAt)}</p>
              </div>
              <span className="rounded-full border border-cyanGlow/20 bg-cyanGlow/10 px-2.5 py-1 text-xs font-bold text-cyanGlow">{item.aiProbability}%</span>
            </div>
            <p className="mt-3 text-sm text-stone-300">Verdict: {item.verdict}</p>
            <div className="mt-4 flex gap-2">
              <ActionButton label="View Result" onClick={() => setSelected(item)}><Eye className="h-4 w-4" /></ActionButton>
              <ActionButton label={downloading ? "Preparing Report" : "Download Report"} onClick={downloadReport}><Download className={`h-4 w-4 ${downloading ? "opacity-50" : ""}`} /></ActionButton>
              <ActionButton label="Delete" onClick={() => deleteItem(item._id)}><Trash2 className={`h-4 w-4 text-roseGlow ${deletingId === item._id ? "opacity-50" : ""}`} /></ActionButton>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && <p className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 text-sm text-stone-400">No scans yet. Upload your first image to start tracking authenticity.</p>}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-black/75 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-lg rounded-[2rem] border border-white/[0.08] bg-black/90 p-6 shadow-2xl shadow-black backdrop-blur-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyanGlow">Result Details</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{selected.fileName}</h3>
                </div>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-stone-300 transition hover:text-white" onClick={() => setSelected(null)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 grid gap-3 text-sm">
                <p className="flex justify-between gap-4 rounded-2xl bg-white/[0.035] p-3 text-stone-300"><span>Media Type</span><strong className="text-white">{formatMediaType(selected.mediaType)}</strong></p>
                <p className="flex justify-between gap-4 rounded-2xl bg-white/[0.035] p-3 text-stone-300"><span>AI Probability</span><strong className="text-cyanGlow">{selected.aiProbability}%</strong></p>
                <p className="flex justify-between gap-4 rounded-2xl bg-white/[0.035] p-3 text-stone-300"><span>Real Probability</span><strong className="text-white">{selected.realProbability}%</strong></p>
                <p className="flex justify-between gap-4 rounded-2xl bg-white/[0.035] p-3 text-stone-300"><span>Verdict</span><strong className="text-white">{selected.verdict}</strong></p>
                <p className="flex justify-between gap-4 rounded-2xl bg-white/[0.035] p-3 text-stone-300"><span>Confidence</span><strong className="text-white">{selected.confidenceText}</strong></p>
                <p className="flex justify-between gap-4 rounded-2xl bg-white/[0.035] p-3 text-stone-300"><span>Date</span><strong className="text-white">{formatDisplayDate(selected.createdAt)}</strong></p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
