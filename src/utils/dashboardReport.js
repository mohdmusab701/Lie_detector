import { apiClient } from "../context/AuthContext.jsx";
import { downloadDashboardReport } from "./reportPdf.js";

const TOKEN_KEY = "lieDetectorToken";

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

async function parseJsonBlob(blob) {
  const text = await blob.text();
  return text ? JSON.parse(text) : null;
}

function downloadPdfBlob(blob) {
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

export async function downloadDashboardReportFromApi() {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Please login again to download your report.");
  }

  const response = await apiClient.get("/api/dashboard/report", {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const contentType = response.headers["content-type"] || "";

  if (contentType.includes("application/pdf")) {
    downloadPdfBlob(response.data);
    return;
  }

  const data = await parseJsonBlob(response.data);
  if (!data?.success) {
    throw new Error(data?.message || "Report data is unavailable.");
  }

  downloadDashboardReport(data);
}

export async function getReportDownloadErrorMessage(error) {
  if (error.response?.data instanceof Blob) {
    try {
      const data = await parseJsonBlob(error.response.data);
      if (data?.message) return data.message;
    } catch {
      // Fall through to the generic message below.
    }
  }

  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return "Unable to download report right now.";
}
