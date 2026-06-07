const jwt = require("jsonwebtoken");
const User = require("../models/User");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createPublicError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    attemptsLeft: user.attemptsLeft,
    videoEnabled: user.videoEnabled,
  };
}

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw createPublicError("JWT_SECRET is missing. Add it to backend/.env.", 500);
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function validateAuthInput({ name, email, password }, requireName = false) {
  if (requireName && !name?.trim()) {
    throw createPublicError("Full name is required.");
  }

  if (!email?.trim() || !password?.trim()) {
    throw createPublicError("Email and password are required.");
  }

  if (!emailPattern.test(email)) {
    throw createPublicError("Please enter a valid email address.");
  }

  if (password.length < 6) {
    throw createPublicError("Password must be at least 6 characters long.");
  }
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    validateAuthInput({ name, email, password }, true);

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw createPublicError("An account with this email already exists.", 409);
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      plan: "free",
      attemptsLeft: 5,
      videoEnabled: false,
    });

    res.status(201).json({
      success: true,
      token: signToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    validateAuthInput({ email, password });

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw createPublicError("Invalid email or password.", 401);
    }

    res.json({
      success: true,
      token: signToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.json({
    success: true,
    user: sanitizeUser(req.user),
  });
}

async function logout(_req, res) {
  res.json({
    success: true,
    message: "Logged out successfully. Remove the token on the frontend.",
  });
}

module.exports = {
  login,
  logout,
  me,
  register,
  sanitizeUser,
};
