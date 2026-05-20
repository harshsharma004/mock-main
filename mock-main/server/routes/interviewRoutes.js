/**
 * routes/interviewRoutes.js — Express router for all /api/interview endpoints
 *
 * All routes are protected — user must be logged in.
 *
 * Route Map:
 *  POST  /api/interview/start       → Start a new interview session
 *  POST  /api/interview/evaluate    → Submit answers for AI evaluation
 *  GET   /api/interview/history     → Get logged-in user's completed interviews
 *  GET   /api/interview/:id         → Get a specific interview by ID
 */

const express = require("express");
const multer  = require("multer");
const router  = express.Router();

const { protect } = require("../middleware/authMiddleware"); // ← auth guard

const upload = multer({ storage: multer.memoryStorage() });

const {
  startInterview,
  evaluateInterview,
  getHistory,
  getInterview,
} = require("../controllers/interviewController");

// ─── All routes require authentication ───────────────────────────────────────
router.post("/start",    protect, upload.single("resume"), startInterview);
router.post("/evaluate", protect, evaluateInterview);
router.get("/history",   protect, getHistory);   // must be before /:id
router.get("/:id",       protect, getInterview);

module.exports = router;