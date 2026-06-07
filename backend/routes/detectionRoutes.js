const express = require("express");
const { detectMedia } = require("../controllers/detectionController");
const { protect } = require("../middleware/authMiddleware");
const { uploadMedia } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/detect", protect, uploadMedia, detectMedia);

module.exports = router;
