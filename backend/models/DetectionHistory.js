const mongoose = require("mongoose");

const detectionHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  fileName: String,
  mediaType: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  aiProbability: Number,
  realProbability: Number,
  verdict: String,
  confidenceText: String,
  source: {
    type: String,
    default: "Sightengine",
  },
  rawResponse: Object,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model("DetectionHistory", detectionHistorySchema);
