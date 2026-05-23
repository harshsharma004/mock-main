/**
 * models/Interview.js — Mongoose schema & model for Interview sessions
 */

const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, required: true, trim: true },
  score:    { type: Number, min: 0, max: 10, default: 0 },
  feedback: { type: String, default: "" },
});

const interviewSchema = new mongoose.Schema(
  {
    // ── Link interview to a user ──────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      enum: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Data Scientist",
        "DevOps Engineer",
        "HR / Behavioral",
        "Product Manager",
        "UI/UX Designer",
      ],
    },

    resumeText: { type: String, default: "" },

    questions: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "At least one question is required",
      },
    },

    answers:      { type: [answerSchema], default: [] },
    overallScore: { type: Number, min: 0, max: 10, default: null },
    status:       { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);