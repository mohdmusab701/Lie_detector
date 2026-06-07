import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AccountInfo from "../components/dashboard/AccountInfo.jsx";
import AwarenessScore from "../components/dashboard/AwarenessScore.jsx";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import OverviewCards from "../components/dashboard/OverviewCards.jsx";
import ReportVault from "../components/dashboard/ReportVault.jsx";
import ScanHistory from "../components/dashboard/ScanHistory.jsx";
import UsageAnalytics from "../components/dashboard/UsageAnalytics.jsx";
import { apiClient, useAuth } from "../context/AuthContext.jsx";

const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

function titleCasePlan(plan) {
  const normalized = String(plan || "free").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="rounded-3xl border border-white/[0.08] bg-black/70 p-5 shadow-2xl shadow-black/35">
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-white/10" />
          <div className="mt-5 h-4 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-8 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-36 animate-pulse rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

const emptyDashboardData = {
  overview: {
    currentPlan: "free",
    attemptsLeft: 0,
    totalScans: 0,
    aiMediaDetected: 0,
  },
  analytics: {
    imagesScanned: 0,
    videosScanned: 0,
    aiGeneratedDetected: 0,
    realMediaDetected: 0,
  },
  account: {
    name: "User",
    email: "",
    memberSince: "",
    plan: "free",
    videoEnabled: false,
  },
  history: [],
  reports: [],
  awarenessScore: 60,
};

export default function Dashboard() {
  const { attempts, plan, user, videoEnabled } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState("");
  const displayName = user?.name || user?.fullName || user?.email?.split("@")[0] || "User";

  const fallbackData = useMemo(
    () => ({
      ...emptyDashboardData,
      overview: {
        ...emptyDashboardData.overview,
        currentPlan: user?.plan || plan || "free",
        attemptsLeft: user?.attemptsLeft ?? attempts ?? 0,
      },
      account: {
        ...emptyDashboardData.account,
        name: user?.name || user?.fullName || displayName,
        email: user?.email || "",
        plan: user?.plan || plan || "free",
        videoEnabled: videoEnabled || Boolean(user?.videoEnabled),
      },
    }),
    [attempts, displayName, plan, user, videoEnabled]
  );

  const data = dashboardData || fallbackData;
  const currentPlan = titleCasePlan(data.overview.currentPlan);

  const loadDashboard = useCallback(async () => {
    try {
      setLoadingDashboard(true);
      setError("");
      const response = await apiClient.get("/api/dashboard");

      if (!response.data?.success) {
        throw new Error("Unable to load dashboard data.");
      }

      setDashboardData(response.data);
    } catch {
      setDashboardData(null);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const deleteHistoryItem = async (id) => {
    await apiClient.delete(`/api/dashboard/history/${id}`);
    await loadDashboard();
  };

  return (
    <section className="container-shell py-10 sm:py-14">
      <div className="space-y-5 sm:space-y-6">
        <DashboardHeader attemptsLeft={data.overview.attemptsLeft} currentPlan={currentPlan} name={displayName} />
        {loadingDashboard ? <DashboardSkeleton /> : <OverviewCards overview={{ ...data.overview, currentPlan }} />}

        {error && (
          <div className="flex items-center gap-3 rounded-3xl border border-roseGlow/20 bg-roseGlow/10 p-4 text-sm font-semibold text-roseGlow">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <motion.div {...sectionMotion}>
          <UsageAnalytics analytics={data.analytics} />
        </motion.div>

        <div className="grid items-start gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <motion.div {...sectionMotion}>
            <ScanHistory items={data.history} onDelete={deleteHistoryItem} />
          </motion.div>
          <div className="grid gap-6">
            <motion.div {...sectionMotion}>
              <AccountInfo account={{ ...data.account, plan: currentPlan }} />
            </motion.div>
            <motion.div {...sectionMotion}>
              <AwarenessScore score={data.awarenessScore} />
            </motion.div>
          </div>
        </div>

        <div className="grid gap-6">
          <motion.div {...sectionMotion}>
            <ReportVault reports={data.reports} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
