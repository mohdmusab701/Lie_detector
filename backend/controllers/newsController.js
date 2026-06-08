const axios = require("axios");

const GNEWS_SEARCH_URL = "https://gnews.io/api/v4/search";
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_TRENDING_ARTICLES = 18;
const MAX_RELATED_ARTICLES = 2;
const TRENDING_QUERIES = [
  "deepfake AI misinformation",
  "AI generated fake news",
  "synthetic media misinformation",
  "AI deepfake scam",
];
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85";

const FALLBACK_ARTICLES = [
  {
    title: "Synthetic disaster footage spreads across short-video platforms",
    category: "Public Safety",
    riskLevel: "Critical",
    description: "Multiple accounts shared computer-generated emergency scenes before official agencies could publish corrections.",
    publishedAt: "2026-05-28T00:00:00Z",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
    source: "AI Lie Detector sample",
    url: "",
  },
  {
    title: "AI-generated celebrity endorsement used in crypto promotion",
    category: "Finance",
    riskLevel: "High",
    description: "A realistic fake video imitated a public figure to push a suspicious investment link.",
    publishedAt: "2026-05-24T00:00:00Z",
    image: "https://images.unsplash.com/photo-1642790551116-18e150f248e1?auto=format&fit=crop&w=900&q=85",
    source: "AI Lie Detector sample",
    url: "",
  },
  {
    title: "Fabricated protest images amplified by coordinated accounts",
    category: "Civic Integrity",
    riskLevel: "High",
    description: "Image artifacts and inconsistent signage suggested the viral gallery was synthetically produced.",
    publishedAt: "2026-05-19T00:00:00Z",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=85",
    source: "AI Lie Detector sample",
    url: "",
  },
  {
    title: "Deepfake product recall notice confuses online shoppers",
    category: "Consumer Trust",
    riskLevel: "Medium",
    description: "A counterfeit announcement page used AI-generated packaging images and false safety claims.",
    publishedAt: "2026-05-12T00:00:00Z",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85",
    source: "AI Lie Detector sample",
    url: "",
  },
  {
    title: "Fake interview clip circulates before election debate",
    category: "Politics",
    riskLevel: "Critical",
    description: "Lip-sync mismatch and audio artifacts indicated a manipulated video intended to influence voters.",
    publishedAt: "2026-05-07T00:00:00Z",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=85",
    source: "AI Lie Detector sample",
    url: "",
  },
  {
    title: "Synthetic medical image claims drive misinformation thread",
    category: "Health",
    riskLevel: "High",
    description: "AI-created clinical visuals were presented as verified evidence without credible source material.",
    publishedAt: "2026-04-30T00:00:00Z",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=85",
    source: "AI Lie Detector sample",
    url: "",
  },
  {
    title: "Generated battlefield photos miscaptioned as breaking news",
    category: "Conflict",
    riskLevel: "Critical",
    description: "Reverse-image checks and lighting analysis suggested the viral images were synthetic composites.",
    publishedAt: "2026-04-23T00:00:00Z",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=85",
    source: "AI Lie Detector sample",
    url: "",
  },
  {
    title: "Voice-cloned emergency message targets local communities",
    category: "Audio Trust",
    riskLevel: "High",
    description: "A synthetic audio clip was paired with fake captions to create urgency around a nonexistent alert.",
    publishedAt: "2026-04-15T00:00:00Z",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=85",
    source: "AI Lie Detector sample",
    url: "",
  },
  {
    title: "AI-made school notice circulates through parent groups",
    category: "Education",
    riskLevel: "Medium",
    description: "The notice copied official styling but included fabricated dates, names, and unsafe instructions.",
    publishedAt: "2026-04-08T00:00:00Z",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=85",
    source: "AI Lie Detector sample",
    url: "",
  },
];

let cachedNews = null;
let cacheExpiresAt = 0;

function getRiskLevel(article) {
  const haystack = `${article.title || ""} ${article.description || ""} ${article.content || ""}`.toLowerCase();

  const highKeywords = ["deepfake", "scam", "fraud", "fake video", "misinformation", "election", "celebrity fake"];
  const mediumKeywords = ["ai generated", "synthetic media", "fake image"];

  if (highKeywords.some((keyword) => haystack.includes(keyword))) return "High";
  if (mediumKeywords.some((keyword) => haystack.includes(keyword))) return "Medium";
  return "Low";
}

function normalizeArticle(article) {
  return {
    title: article.title || "Untitled article",
    description: article.description || "No description available.",
    content: article.content || "",
    url: article.url || "",
    image: article.image || PLACEHOLDER_IMAGE,
    source: article.source?.name || "Unknown source",
    publishedAt: article.publishedAt || "",
    category: "Deepfake / AI Misinformation",
    riskLevel: getRiskLevel(article),
  };
}

function dedupeArticles(articles) {
  const seen = new Set();

  return articles.filter((article) => {
    const key = (article.url || article.title || "").toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildTrendingArticles(articles) {
  const dedupedLiveArticles = dedupeArticles(articles).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

  return dedupedLiveArticles.slice(0, MAX_TRENDING_ARTICLES).map(normalizeArticle);
}

async function fetchTrendingArticlesForQuery(apiKey, query) {
  try {
    const response = await axios.get(GNEWS_SEARCH_URL, {
      params: {
        q: query,
        lang: "en",
        max: 10,
        sortby: "publishedAt",
        apikey: apiKey,
      },
      timeout: 12000,
    });

    const articles = Array.isArray(response.data?.articles) ? response.data.articles : [];

    console.info(
      "[GNews] Query response",
      JSON.stringify({
        query,
        status: response.status,
        totalArticles: response.data?.totalArticles ?? null,
        articleCount: articles.length,
        firstTitle: articles[0]?.title || null,
      })
    );

    return articles;
  } catch (error) {
    console.error(
      "[GNews] Query error",
      JSON.stringify({
        query,
        status: error.response?.status || null,
        message: error.message,
        response: error.response?.data || null,
      })
    );

    throw error;
  }
}

async function fetchTrendingArticles(apiKey) {
  const results = await Promise.allSettled(TRENDING_QUERIES.map((query) => fetchTrendingArticlesForQuery(apiKey, query)));
  const articles = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const failures = results.filter((result) => result.status === "rejected");

  console.info(
    "[GNews] Aggregation summary",
    JSON.stringify({
      queryCount: TRENDING_QUERIES.length,
      successfulQueries: results.length - failures.length,
      failedQueries: failures.length,
      totalArticlesCollected: articles.length,
    })
  );

  if (!articles.length && failures.length) {
    throw failures[0].reason;
  }

  return articles;
}

async function getTrendingNews(_req, res) {
  try {
    if (cachedNews && Date.now() < cacheExpiresAt) {
      console.info(
        "[GNews] total articles returned from API/cache",
        JSON.stringify({
          source: "cache",
          totalArticlesReturned: cachedNews.length,
        })
      );

      res.json({
        success: true,
        articles: cachedNews,
        cached: true,
        message: "Trending news loaded from the 30-minute cache.",
      });
      return;
    }

    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        success: false,
        message: "GNews API key is missing. Add GNEWS_API_KEY to backend/.env.",
      });
      return;
    }

    const articles = await fetchTrendingArticles(apiKey);
    const normalizedArticles = buildTrendingArticles(articles);

    console.info(
      "[GNews] Trending summary",
      JSON.stringify({
        queries: TRENDING_QUERIES,
        receivedCount: articles.length,
        dedupedCount: normalizedArticles.length,
        fallbackUsed: false,
      })
    );

    if (!normalizedArticles.length) {
      res.status(404).json({
        success: false,
        message: "No trending AI-fake news articles were found right now.",
      });
      return;
    }

    cachedNews = normalizedArticles;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;

    console.info(
      "[GNews] total articles returned from API/cache",
      JSON.stringify({
        source: "api",
        totalArticlesReturned: normalizedArticles.length,
      })
    );

    res.json({
      success: true,
      articles: normalizedArticles,
      cached: false,
      message: "Trending news loaded from GNews.",
    });
  } catch (error) {
    console.error(
      "[GNews] Trending endpoint error",
      JSON.stringify({
        message: error.message,
        status: error.response?.status || null,
        response: error.response?.data || null,
      })
    );

    if (error.response?.status === 429) {
      if (cachedNews?.length) {
        console.info(
          "[GNews] total articles returned from API/cache",
          JSON.stringify({
            source: "cache-rate-limit",
            totalArticlesReturned: cachedNews.length,
          })
        );

        res.json({
          success: false,
          articles: cachedNews,
          cached: true,
          message: "GNews rate limit reached. Showing cached trending articles.",
        });
        return;
      }

      console.info(
        "[GNews] total articles returned from API/cache",
        JSON.stringify({
          source: "fallback-rate-limit",
          totalArticlesReturned: FALLBACK_ARTICLES.length,
        })
      );

      res.json({
        success: false,
        articles: FALLBACK_ARTICLES,
        cached: false,
        fallback: true,
        message: "GNews rate limit reached and no cached articles are available. Showing fallback sample articles.",
      });
      return;
    }

    res.status(502).json({
      success: false,
      message: "Live trending news could not be loaded right now.",
    });
  }
}

async function getRelatedNews(req, res) {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        success: false,
        articles: [],
        message: "GNews API key is missing. Add GNEWS_API_KEY to backend/.env.",
      });
      return;
    }

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), MAX_RELATED_ARTICLES) : MAX_RELATED_ARTICLES;
    const query = String(req.query.query || "").trim();
    const safeQuery = query || "AI fake media deepfake detection image manipulation misinformation synthetic media";
    const searchQuery = `(${safeQuery}) AI fake media deepfake detection misinformation`;

    const articles = await fetchTrendingArticlesForQuery(apiKey, searchQuery);
    const normalizedArticles = dedupeArticles(articles)
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
      .slice(0, limit)
      .map(normalizeArticle);

    res.json({
      success: true,
      articles: normalizedArticles,
      message: normalizedArticles.length ? "Related news loaded from GNews." : "No related articles found right now.",
    });
  } catch (error) {
    console.error(
      "[GNews] Related endpoint error",
      JSON.stringify({
        message: error.message,
        status: error.response?.status || null,
        response: error.response?.data || null,
      })
    );

    res.status(502).json({
      success: false,
      articles: [],
      message: "No related articles found right now.",
    });
  }
}

module.exports = { getRelatedNews, getTrendingNews };
