function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function escapePdfText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(text, maxLength = 82) {
  const words = String(text || "Not available").split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxLength) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : ["Not available"];
}

function buildReportLines(reportData) {
  const report = reportData.report || reportData;
  const summary = report.summary || {};
  const history = Array.isArray(report.recentDetections) ? report.recentDetections : Array.isArray(report.history) ? report.history : [];
  const lines = [
    "Lie Detector Verification Report",
    `Generated: ${formatDate(report.generatedAt)}`,
    "",
    "User",
    `Name: ${report.user?.name || "Not available"}`,
    `Email: ${report.user?.email || "Not available"}`,
    "",
    "Subscription",
    `Status: ${summary.status || report.subscription?.status || "Not available"}`,
    `Plan: ${summary.subscription || report.subscription?.plan || "Not available"}`,
    `Attempts Left: ${summary.attemptsLeft ?? report.subscription?.attemptsLeft ?? "Not available"}`,
    `Video Detection: ${summary.videoEnabled ?? report.subscription?.videoEnabled ? "Enabled" : "Disabled"}`,
    "",
    "Summary",
    `Total scans: ${summary.totalScans ?? 0}`,
    `Images scanned: ${summary.imagesScanned ?? 0}`,
    `Videos scanned: ${summary.videosScanned ?? 0}`,
    `AI media detected: ${summary.fakeCount ?? summary.aiMediaDetected ?? 0}`,
    `Likely real media: ${summary.realCount ?? summary.realMediaDetected ?? 0}`,
    "",
    "Recent Detection History",
  ];

  if (!history.length) {
    lines.push("No detection history available yet.");
    return lines;
  }

  history.forEach((item, index) => {
    lines.push("");
    lines.push(`${index + 1}. ${item.fileName || "Unnamed media"}`);
    lines.push(`Type: ${item.mediaType || "media"} | Verdict: ${item.verdict || "Not available"}`);
    lines.push(`AI Probability: ${item.aiProbability ?? 0}% | Real Probability: ${item.realProbability ?? 0}%`);
    lines.push(`Confidence: ${item.confidenceText || "Not available"}`);
    lines.push(`Date: ${formatDate(item.createdAt)}`);
  });

  return lines;
}

function createPdfBlob(lines) {
  const pageHeight = 792;
  const left = 48;
  const top = 742;
  const lineHeight = 16;
  const bottom = 54;
  const pages = [[]];
  let y = top;

  lines.flatMap((line) => (line ? wrapText(line) : [""])).forEach((line) => {
    if (y < bottom) {
      pages.push([]);
      y = top;
    }

    pages[pages.length - 1].push({ text: line, x: left, y });
    y -= lineHeight;
  });

  const objects = [];
  const pageIds = [];

  pages.forEach((pageLines) => {
    const content = [
      "BT",
      "/F1 11 Tf",
      "14 TL",
      ...pageLines.map((line) => `${line.x} ${line.y} Td (${escapePdfText(line.text)}) Tj ${-line.x} ${-line.y} Td`),
      "ET",
    ].join("\n");

    const contentId = objects.length + 1;
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = objects.length + 1;
    pageIds.push(pageId);
    objects.push(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 612 ${pageHeight}] /Resources << /Font << /F1 ${pages.length * 2 + 2} 0 R >> >> /Contents ${contentId} 0 R >>`);
  });

  const pagesId = objects.length + 1;
  const fontId = objects.length + 2;
  const catalogId = objects.length + 3;

  const finalizedObjects = objects.map((object) => object.replace("/Parent 0 0 R", `/Parent ${pagesId} 0 R`));
  finalizedObjects.push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  finalizedObjects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  finalizedObjects.push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  finalizedObjects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${finalizedObjects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${finalizedObjects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadDashboardReport(reportData) {
  const lines = buildReportLines(reportData);
  const blob = createPdfBlob(lines);
  const date = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `lie-detector-report-${date}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
