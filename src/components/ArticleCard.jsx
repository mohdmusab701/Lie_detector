import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, ShieldAlert } from "lucide-react";

export default function ArticleCard({ article, index }) {
  const risk = article.riskLevel || article.risk;
  const image =
    article.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85";
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
    : article.date;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={{ y: -8 }}
      className="group overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] shadow-2xl shadow-black/45 backdrop-blur-2xl"
    >
      <div className="relative h-52 overflow-hidden bg-black/75">
        <img
          src={image}
          alt={article.title}
          className="h-full w-full object-cover grayscale-[18%] saturate-[0.72] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-4">
          <span className="rounded-full border border-white/10 bg-black/75 px-3 py-1 text-xs font-semibold text-stone-200 backdrop-blur-xl">
            {article.category}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-roseGlow/20 bg-black/75 px-3 py-1 text-xs font-semibold text-roseGlow backdrop-blur-xl">
            <ShieldAlert className="h-3.5 w-3.5" /> {risk}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold leading-8 text-stone-50">{article.title}</h2>
        {article.source && <p className="mt-2 text-sm font-semibold text-cyanGlow">{article.source}</p>}
        <p className="mt-3 leading-7 text-stone-500">{article.description}</p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-sm text-stone-600">
            <CalendarDays className="h-4 w-4" /> {date}
          </span>
          {article.url ? (
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyanGlow transition hover:text-stone-50"
            >
              Read Full Article <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-cyanGlow transition hover:text-stone-50">
              Read More <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
