import { motion } from "framer-motion";
import { Newspaper, RadioTower, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard.jsx";
import { apiClient } from "../context/AuthContext.jsx";

const ARTICLES_PER_LOAD = 3;

const sampleArticles = [
  {
    title: "Synthetic disaster footage spreads across short-video platforms",
    category: "Public Safety",
    risk: "Critical",
    description: "Multiple accounts shared computer-generated emergency scenes before official agencies could publish corrections.",
    date: "May 28, 2026",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "AI-generated celebrity endorsement used in crypto promotion",
    category: "Finance",
    risk: "High",
    description: "A realistic fake video imitated a public figure to push a suspicious investment link.",
    date: "May 24, 2026",
    image: "https://images.unsplash.com/photo-1642790551116-18e150f248e1?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Fabricated protest images amplified by coordinated accounts",
    category: "Civic Integrity",
    risk: "High",
    description: "Image artifacts and inconsistent signage suggested the viral gallery was synthetically produced.",
    date: "May 19, 2026",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Deepfake product recall notice confuses online shoppers",
    category: "Consumer Trust",
    risk: "Medium",
    description: "A counterfeit announcement page used AI-generated packaging images and false safety claims.",
    date: "May 12, 2026",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Fake interview clip circulates before election debate",
    category: "Politics",
    risk: "Critical",
    description: "Lip-sync mismatch and audio artifacts indicated a manipulated video intended to influence voters.",
    date: "May 07, 2026",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Synthetic medical image claims drive misinformation thread",
    category: "Health",
    risk: "High",
    description: "AI-created clinical visuals were presented as verified evidence without credible source material.",
    date: "Apr 30, 2026",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Generated battlefield photos miscaptioned as breaking news",
    category: "Conflict",
    risk: "Critical",
    description: "Reverse-image checks and lighting analysis suggested the viral images were synthetic composites.",
    date: "Apr 23, 2026",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Voice-cloned emergency message targets local communities",
    category: "Audio Trust",
    risk: "High",
    description: "A synthetic audio clip was paired with fake captions to create urgency around a nonexistent alert.",
    date: "Apr 15, 2026",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "AI-made school notice circulates through parent groups",
    category: "Education",
    risk: "Medium",
    description: "The notice copied official styling but included fabricated dates, names, and unsafe instructions.",
    date: "Apr 08, 2026",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=85",
  },
];

export default function Trending() {
  const [articles, setArticles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const visibleArticles = articles.slice(0, visibleCount);

  useEffect(() => {
    let active = true;

    async function loadTrendingNews() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await apiClient.get("/api/trending-news");
        const data = response.data;
        const liveArticles = Array.isArray(data) ? data : data.articles;
        const fallbackUsed = Boolean(data.fallback || data.success === false);

        if (!Array.isArray(liveArticles) || !liveArticles.length) {
          throw new Error(data.message || "Live news could not be loaded right now.");
        }

        if (active) {
          setArticles(liveArticles);
          setVisibleCount(3);
          setHasLoadedMore(false);
          console.log("[Trending] total articles received:", liveArticles.length);
          console.log("[Trending] fallback used:", fallbackUsed);
          setFallbackMessage(fallbackUsed ? data.message || "Showing fallback trending articles." : "");
          setErrorMessage("");
        }
      } catch (error) {
        if (active) {
          setArticles(sampleArticles);
          setVisibleCount(3);
          setHasLoadedMore(false);
          console.log("[Trending] total articles received:", sampleArticles.length);
          console.log("[Trending] fallback used:", true);
          setErrorMessage(error.message || "Live news could not be loaded right now.");
          setFallbackMessage("Live news could not be loaded right now. Showing sample articles.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrendingNews();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="container-shell py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amberGlow">Trending intelligence</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-stone-50 sm:text-6xl">AI fake media reports worth watching</h1>
          <p className="mt-5 text-lg leading-8 text-stone-400">
            Live editorial cards showing how AI Lie Detector can surface high-risk synthetic media trends for analysts, creators, and everyday users.
          </p>
        </div>

        <div className="relative min-h-[340px] overflow-hidden rounded-xl border border-white/10 bg-black/75 p-6">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:38px_38px]" />
          <motion.div
            className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyanGlow/20"
            animate={{ scale: [1, 1.22, 1], opacity: [0.35, 0.08, 0.35] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amberGlow/30"
            animate={{ scale: [1, 1.45, 1], opacity: [0.45, 0.12, 0.45] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10 flex h-full min-h-[290px] flex-col justify-between">
            <div className="flex items-center justify-between">
              <RadioTower className="h-7 w-7 text-cyanGlow" />
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Live signal map</span>
            </div>
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-white/10 bg-black/75">
              <ScanLine className="h-10 w-10 text-amberGlow" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Source drift", "Narrative spike", "Image reuse"].map((item, index) => (
                <motion.div
                  key={item}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.2 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-lg border border-white/10 bg-black/75 p-3"
                >
                  <Newspaper className="mb-2 h-4 w-4 text-cyanGlow" />
                  <p className="text-xs font-semibold text-stone-300">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {fallbackMessage && (
        <div className="mt-8 rounded-2xl border border-amberGlow/20 bg-black/75 p-4 text-sm text-stone-300">
          {fallbackMessage}
          {errorMessage && <span className="ml-2 text-stone-500">({errorMessage})</span>}
        </div>
      )}
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <ArticleSkeleton key={index} />)
          : visibleArticles.map((article, index) => (
              <ArticleCard key={article.url || article.title} article={article} index={index} />
            ))}
      </div>
      {!loading && articles.length > visibleCount && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-cyanGlow/30 bg-cyanGlow/10 px-6 py-3 text-sm font-bold text-cyanGlow shadow-[0_0_24px_rgba(134,217,232,0.10)] transition duration-300 hover:-translate-y-0.5 hover:border-cyanGlow/55 hover:bg-cyanGlow/15 hover:text-white hover:shadow-[0_0_34px_rgba(134,217,232,0.20)] focus:outline-none focus:ring-2 focus:ring-cyanGlow/35 focus:ring-offset-2 focus:ring-offset-carbon"
            onClick={() => {
              setHasLoadedMore(true);
              setVisibleCount((prev) => Math.min(prev + ARTICLES_PER_LOAD, articles.length));
            }}
          >
            Read More Articles
          </button>
        </div>
      )}
      {!loading && hasLoadedMore && articles.length > 0 && visibleCount >= articles.length && (
        <p className="mt-10 text-center text-sm text-stone-500">No more trending articles available.</p>
      )}
    </section>
  );
}

function ArticleSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] shadow-2xl shadow-black/45">
      <div className="h-52 animate-pulse bg-white/[0.06]" />
      <div className="space-y-4 p-6">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/[0.07]" />
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-3 animate-pulse rounded-full bg-white/[0.05]" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}
