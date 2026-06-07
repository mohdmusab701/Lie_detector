const DetectionHistory = require("../models/DetectionHistory");
const mongoose = require("mongoose");

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function calculateAwarenessScore({ totalScans, imagesScanned, videosScanned }) {
  if (!totalScans) return 60;

  const scanPoints = Math.min(totalScans * 2, 20);
  const mixedMediaPoints = imagesScanned > 0 && videosScanned > 0 ? 10 : 0;
  const fivePlusPoints = totalScans >= 5 ? 10 : 0;

  return Math.min(100, 60 + scanPoints + mixedMediaPoints + fivePlusPoints);
}

function serializeHistoryItem(item) {
  return {
    _id: item._id,
    fileName: item.fileName,
    mediaType: item.mediaType,
    aiProbability: item.aiProbability,
    realProbability: item.realProbability,
    verdict: item.verdict,
    confidenceText: item.confidenceText,
    createdAt: item.createdAt,
  };
}

function buildReports(history) {
  return history.map((item, index) => ({
    reportId: `LD-${1001 + index}`,
    historyId: item._id,
    aiScore: item.aiProbability,
    mediaType: item.mediaType,
    createdAt: item.createdAt,
  }));
}

async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;

    const [totalScans, aiMediaDetected, realMediaDetected, imagesScanned, videosScanned, latestHistory] = await Promise.all([
      DetectionHistory.countDocuments({ user: userId }),
      DetectionHistory.countDocuments({ user: userId, aiProbability: { $gte: 75 } }),
      DetectionHistory.countDocuments({ user: userId, aiProbability: { $lt: 45 } }),
      DetectionHistory.countDocuments({ user: userId, mediaType: "image" }),
      DetectionHistory.countDocuments({ user: userId, mediaType: "video" }),
      DetectionHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const history = latestHistory.map(serializeHistoryItem);
    const reports = buildReports(history);

    res.json({
      success: true,
      overview: {
        currentPlan: req.user.plan,
        attemptsLeft: req.user.attemptsLeft,
        totalScans,
        aiMediaDetected,
      },
      analytics: {
        imagesScanned,
        videosScanned,
        aiGeneratedDetected: aiMediaDetected,
        realMediaDetected,
      },
      account: {
        name: req.user.name,
        email: req.user.email,
        memberSince: formatDate(req.user.createdAt),
        plan: req.user.plan,
        videoEnabled: req.user.videoEnabled,
      },
      history,
      reports,
      awarenessScore: calculateAwarenessScore({ totalScans, imagesScanned, videosScanned }),
    });
  } catch (error) {
    next(error);
  }
}

async function getDashboardReport(req, res, next) {
  try {
    const userId = req.user?._id;
    const [totalScans, fakeCount, realCount, imagesScanned, videosScanned, recentHistory] = await Promise.all([
      DetectionHistory.countDocuments({ user: userId }),
      DetectionHistory.countDocuments({ user: userId, aiProbability: { $gte: 75 } }),
      DetectionHistory.countDocuments({ user: userId, aiProbability: { $lt: 45 } }),
      DetectionHistory.countDocuments({ user: userId, mediaType: "image" }),
      DetectionHistory.countDocuments({ user: userId, mediaType: "video" }),
      DetectionHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const recentDetections = recentHistory.map(serializeHistoryItem);
    const generatedAt = new Date().toISOString();
    const report = {
      user: {
        name: req.user?.name || "User",
        email: req.user?.email || "",
      },
      summary: {
        totalScans: totalScans || 0,
        realCount: realCount || 0,
        fakeCount: fakeCount || 0,
        subscription: req.user?.plan || "free",
        attemptsLeft: req.user?.attemptsLeft ?? 0,
        imagesScanned: imagesScanned || 0,
        videosScanned: videosScanned || 0,
        videoEnabled: Boolean(req.user?.videoEnabled),
        status: "Verification workspace active",
      },
      recentDetections,
      generatedAt,
    };

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteHistoryItem(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      const error = new Error("History item not found.");
      error.statusCode = 404;
      error.publicMessage = "History item not found.";
      throw error;
    }

    const deleted = await DetectionHistory.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      const error = new Error("History item not found.");
      error.statusCode = 404;
      error.publicMessage = "History item not found.";
      throw error;
    }

    res.json({
      success: true,
      message: "History item deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  deleteHistoryItem,
  getDashboard,
  getDashboardReport,
};
