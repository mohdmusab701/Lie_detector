const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/payment/create-order", protect, createOrder);
router.post("/payment/verify", protect, verifyPayment);

module.exports = router;
