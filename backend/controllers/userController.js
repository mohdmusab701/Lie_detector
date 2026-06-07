const { sanitizeUser } = require("./authController");

const planUpdates = {
  free: { attemptsLeft: 5, videoEnabled: false },
  starter: { attemptsLeft: 50, videoEnabled: true },
  pro: { attemptsLeft: 100, videoEnabled: true },
};

function createPublicError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

async function activateDemoPlan(req, res, next) {
  try {
    const { plan } = req.body;
    const update = planUpdates[plan];

    if (!update) {
      throw createPublicError("Invalid plan selected.");
    }

    req.user.plan = plan;
    req.user.attemptsLeft = update.attemptsLeft;
    req.user.videoEnabled = update.videoEnabled;
    await req.user.save();

    res.json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { activateDemoPlan };
