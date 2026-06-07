const crypto = require("crypto");
const Razorpay = require("razorpay");
const { sanitizeUser } = require("./authController");

const plans = {
  starter: {
    amount: 99,
    attemptsLeft: 50,
  },
  pro: {
    amount: 159,
    attemptsLeft: 100,
  },
};

function createPublicError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function getRazorpayClient() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw createPublicError("Razorpay credentials are missing. Add them to backend/.env.", 500);
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

function getPlan(plan) {
  const selectedPlan = plans[plan];
  if (!selectedPlan) {
    throw createPublicError("Invalid payment plan selected.");
  }

  return selectedPlan;
}

async function createOrder(req, res, next) {
  try {
    const { plan } = req.body;
    const selectedPlan = getPlan(plan);
    const razorpay = getRazorpayClient();
    const amount = selectedPlan.amount * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `ld_${Date.now()}`,
      notes: {
        plan,
        userId: String(req.user._id),
      },
    });

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
    });
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { plan, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const selectedPlan = getPlan(plan);
    const razorpay = getRazorpayClient();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw createPublicError("Payment verification details are missing.");
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw createPublicError("Razorpay credentials are missing. Add them to backend/.env.", 500);
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw createPublicError("Payment verification failed.", 400);
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (order.amount !== selectedPlan.amount * 100 || order.currency !== "INR") {
      throw createPublicError("Payment order does not match the selected plan.", 400);
    }

    if (order.notes?.plan !== plan || order.notes?.userId !== String(req.user._id)) {
      throw createPublicError("Payment order does not belong to this account.", 400);
    }

    req.user.plan = plan;
    req.user.attemptsLeft = selectedPlan.attemptsLeft;
    req.user.videoEnabled = true;
    await req.user.save();

    res.json({
      success: true,
      message: "Payment successful. Your plan has been activated.",
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  verifyPayment,
};
