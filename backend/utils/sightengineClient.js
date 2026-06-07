const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const IMAGE_ENDPOINT = "https://api.sightengine.com/1.0/check.json";
const VIDEO_ENDPOINT = "https://api.sightengine.com/1.0/video/check-sync.json";

function collectAiScores(value, scores = []) {
  if (!value || typeof value !== "object") {
    return scores;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === "ai_generated" && typeof nestedValue === "number") {
      scores.push(nestedValue);
    } else if (nestedValue && typeof nestedValue === "object") {
      collectAiScores(nestedValue, scores);
    }
  }

  return scores;
}

function normalizeSightengineResponse(raw, mediaType) {
  if (!raw || raw.status !== "success") {
    const message = raw?.error?.message || raw?.message || "Sightengine API failed to analyze this media.";
    const error = new Error(message);
    error.statusCode = 502;
    error.publicMessage = message;
    throw error;
  }

  const scores = collectAiScores(raw);
  if (!scores.length) {
    const error = new Error("Invalid Sightengine response. AI probability score was not found.");
    error.statusCode = 502;
    error.publicMessage = error.message;
    throw error;
  }

  const aiScore = mediaType === "video" ? Math.max(...scores) : scores[0];
  const aiProbability = Math.round(Math.min(Math.max(aiScore, 0), 1) * 100);
  const realProbability = 100 - aiProbability;

  let label = "Likely Real";
  if (aiProbability >= 75) {
    label = "Likely AI Generated";
  } else if (aiProbability >= 45) {
    label = "Uncertain / Needs Verification";
  }

  const confidenceText =
    aiProbability >= 75 || aiProbability < 25
      ? "High confidence"
      : aiProbability >= 45
        ? "Medium confidence"
        : "Moderate confidence";

  return {
    success: true,
    mediaType,
    aiProbability,
    realProbability,
    label,
    confidenceText,
    raw,
  };
}

async function analyzeWithSightengine(file, mediaType) {
  const { SIGHTENGINE_API_USER, SIGHTENGINE_API_SECRET } = process.env;

  if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
    const error = new Error("Sightengine API credentials are missing. Add them to backend/.env.");
    error.statusCode = 500;
    error.publicMessage = error.message;
    throw error;
  }

  const form = new FormData();
  form.append("media", fs.createReadStream(file.path));
  form.append("models", "genai");
  form.append("api_user", SIGHTENGINE_API_USER);
  form.append("api_secret", SIGHTENGINE_API_SECRET);

  const endpoint = mediaType === "video" ? VIDEO_ENDPOINT : IMAGE_ENDPOINT;
  const response = await axios.post(endpoint, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 120000,
  });

  return normalizeSightengineResponse(response.data, mediaType);
}

module.exports = { analyzeWithSightengine };
