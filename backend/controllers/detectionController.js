const fs = require("fs/promises");
const path = require("path");
const DetectionHistory = require("../models/DetectionHistory");
const { analyzeWithSightengine } = require("../utils/sightengineClient");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm"]);
const IMAGE_LIMIT = 10 * 1024 * 1024;
const VIDEO_LIMIT = 50 * 1024 * 1024;

function getMediaType(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  return null;
}

function createPublicError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

async function removeTemporaryFile(file) {
  if (!file?.path) return;
  try {
    await fs.unlink(file.path);
  } catch {
    // Temporary upload cleanup should never hide the API response from the user.
  }
}

async function detectMedia(req, res, next) {
  const file = req.file;

  try {
    if (!file) {
      throw createPublicError("No file selected. Please upload an image or video to analyze.");
    }

    const mediaType = getMediaType(file);
    if (!mediaType) {
      throw createPublicError("Unsupported file type. Please upload JPG, PNG, WEBP, MP4, MOV, or WEBM.");
    }

    if (mediaType === "image" && file.size > IMAGE_LIMIT) {
      throw createPublicError("Image file is too large. Please upload an image under 10MB.");
    }

    if (mediaType === "video" && file.size > VIDEO_LIMIT) {
      throw createPublicError("Video file is too large. Please upload a video under 50MB.");
    }

    if (req.user.attemptsLeft <= 0) {
      throw createPublicError("Free trial limit reached. Upgrade your plan to continue scanning.", 403);
    }

    if (mediaType === "video" && (!req.user.videoEnabled || req.user.plan === "free")) {
      throw createPublicError("Video detection is available only on paid plans.", 403);
    }

    const result = await analyzeWithSightengine(file, mediaType);
    req.user.attemptsLeft = Math.max(0, req.user.attemptsLeft - 1);
    await req.user.save();

    await DetectionHistory.create({
      user: req.user._id,
      fileName: req.file.originalname,
      mediaType,
      aiProbability: result.aiProbability,
      realProbability: result.realProbability,
      verdict: result.label,
      confidenceText: result.confidenceText,
      rawResponse: result.raw,
    });

    res.json({
      ...result,
      attemptsLeft: req.user.attemptsLeft,
      plan: req.user.plan,
      videoEnabled: req.user.videoEnabled,
    });
  } catch (error) {
    next(error);
  } finally {
    await removeTemporaryFile(file);
  }
}

module.exports = { detectMedia };
