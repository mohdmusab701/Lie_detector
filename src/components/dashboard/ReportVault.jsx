import { Download, FileBadge } from "lucide-react";
import { useState } from "react";
import { downloadDashboardReportFromApi, getReportDownloadErrorMessage } from "../../utils/dashboardReport.js";

function formatDisplayDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString();
}

export default function ReportVault({ reports }) {
  const [notice, setNotice] = useState("");
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

  return (
    <section className="rounded-[2rem] border border-white/[0.08] bg-black/65 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyanGlow">Detection Report Vault</p>
          <h2 className="mt-2 text-2xl font-black text-white">Saved reports</h2>
        </div>
        {notice && <p className="rounded-full border border-amberGlow/20 bg-amberGlow/10 px-3 py-1.5 text-sm font-semibold text-amberGlow">{notice}</p>}
      </div>
      {reports.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 text-sm text-stone-400">No reports available yet.</p>
      ) : (
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {reports.map((report) => (
          <article key={report.reportId} className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:-translate-y-1 hover:border-cyanGlow/25">
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyanGlow/20 bg-cyanGlow/10 text-cyanGlow">
                <FileBadge className="h-5 w-5" />
              </span>
              <span className="text-xl font-black text-white">{report.aiScore}%</span>
            </div>
            <h3 className="mt-5 text-lg font-black text-white">Report #{report.reportId}</h3>
            <p className="mt-2 text-sm capitalize text-stone-400">{report.mediaType} - Created {formatDisplayDate(report.createdAt)}</p>
            <button type="button" onClick={downloadReport} className="ghost-button mt-5 w-full px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-60" disabled={downloading}>
              {downloading ? "Preparing PDF..." : "Download PDF"} <Download className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
      )}
    </section>
  );
}
