/**
 * routes/auth.js — JWT Authentication routes
 *
 * POST /api/auth/register  → create account, return JWT
 * POST /api/auth/login     → verify credentials, return JWT
 * GET  /api/auth/me        → return current user (protected)
 */

const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ── Helper: sign a JWT ─────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in DB
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Return token + user info
    const token = signToken(user._id);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find user — explicitly select password (hidden by default in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user._id);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── POST /api/auth/google ──────────────────────────────────────────────────
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Firebase ID token is required." });
    }

    const admin = require("../config/firebase");

    // 1. Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: "Email not provided by Google account." });
    }

    // 2. Find or Create User in MongoDB
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Split name into firstName and lastName
      const nameParts = name ? name.split(" ") : ["Google", "User"];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "User";

      user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
      });
    }

    // 3. Sign local JWT token
    const token = signToken(user._id);

    res.status(200).json({
      message: "Google login successful.",
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        picture,
      },
    });
  } catch (err) {
    console.error("Google authentication error:", err);
    res.status(401).json({ message: "Invalid or expired Google credential." });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    user: {
      id:        req.user._id,
      firstName: req.user.firstName,
      lastName:  req.user.lastName,
      email:     req.user.email,
    },
  });
});

module.exports = router;