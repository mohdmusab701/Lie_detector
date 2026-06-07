const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createAuthError(message = "Unauthorized request. Please login again.") {
  const error = new Error(message);
  error.statusCode = 401;
  error.publicMessage = message;
  return error;
}

async function protect(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      throw createAuthError("Login required to access this route.");
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is missing. Add it to backend/.env.");
      error.statusCode = 500;
      error.publicMessage = error.message;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw createAuthError();
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(createAuthError("Session expired. Please login again."));
      return;
    }

    next(error);
  }
}

module.exports = { protect };
