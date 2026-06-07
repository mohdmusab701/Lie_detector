const express = require("express");
const { resetPlanForTesting } = require("../controllers/devController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// DEV ONLY: authenticated testing helper. Disabled when NODE_ENV=production.
router.post("/dev/reset-plan", protect, resetPlanForTesting);

module.exports = router;
