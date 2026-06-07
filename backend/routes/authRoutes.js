const express = require("express");
const { login, logout, me, register } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", protect, me);
router.post("/auth/logout", protect, logout);

module.exports = router;
