const { sanitizeUser } = require("./authController");

function createPublicError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

async function resetPlanForTesting(req, res, next) {
  try {
    if (process.env.NODE_ENV === "production") {
      throw createPublicError("Development-only endpoint is disabled in production.", 403);
    }

    req.user.plan = "free";
    req.user.attemptsLeft = 5;
    req.user.videoEnabled = false;
    await req.user.save();

    res.json({
      success: true,
      devOnly: true,
      message: "Development-only reset complete. User plan is now free.",
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  resetPlanForTesting,
};
