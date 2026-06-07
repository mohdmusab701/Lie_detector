const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();
const destinationEmail = "ayushsrivastavaup62@gmail.com";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

router.post("/contact", async (req, res) => {
  try {
    const name = normalize(req.body.name);
    const email = normalize(req.body.email);
    const message = normalize(req.body.message);
    const submittedAuthenticatedName = normalize(req.body.authenticatedName);
    const submittedAuthenticatedEmail = normalize(req.body.authenticatedEmail);
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    let authenticatedName = "";
    let authenticatedEmail = "";

    if (!name || !email || !message || !emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Unable to send feedback. Please try again.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Unable to send feedback. Please try again.",
      });
    }

    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("name email");
        authenticatedName = user?.name || "";
        authenticatedEmail = user?.email || "";
      } catch {
        authenticatedName = submittedAuthenticatedName;
        authenticatedEmail = submittedAuthenticatedEmail;
      }
    } else {
      authenticatedName = submittedAuthenticatedName;
      authenticatedEmail = submittedAuthenticatedEmail;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Lie_detector Feedback" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: destinationEmail,
      subject: "New Lie Detector Feedback",
      text: [
        `Authenticated User: ${authenticatedName || "Guest"}${authenticatedEmail ? ` (${authenticatedEmail})` : ""}`,
        `Submitted Name: ${name}`,
        `Submitted Email: ${email}`,
        `Message: ${message}`,
        `Date: ${new Date().toISOString()}`,
      ].join("\n"),
    });

    return res.json({
      success: true,
      message: "Feedback submitted successfully.",
    });
  } catch (error) {
    console.error("Contact email error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to send feedback. Please try again.",
    });
  }
});

module.exports = router;
