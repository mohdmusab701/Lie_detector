const express = require("express");
const { activateDemoPlan } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/user/activate-demo-plan", protect, activateDemoPlan);

module.exports = router;
