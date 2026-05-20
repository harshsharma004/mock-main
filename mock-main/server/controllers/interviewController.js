/**
 * controllers/interviewController.js — Request handlers for interview operations
 *
 * All handlers now use req.user._id (set by protect middleware)
 * so every interview is scoped to the logged-in user.
 */

const Interview = require("../models/Interview");
const { generateQuestions, evaluateAnswer } = require("../services/openaiService");
const pdfParse = require("pdf-parse");

// ─── POST /api/interview/start ────────────────────────────────────────────────
const startInterview = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || role.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Role is required to start an interview",
      });
    }

    let resumeText = "";
    if (req.file) {
      console.log("📄 Resume file uploaded, parsing PDF...");
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text.replace(/\n\s*\n/g, "\n").substring(0, 3000);
        console.log(`✅ Resume parsed successfully (${resumeText.length} chars)`);
      } catch (err) {
        console.error("❌ Failed to parse PDF resume:", err.message);
      }
    }

    console.log(`📋 Generating questions for role: ${role}`);
    const questions = await generateQuestions(role.trim(), resumeText);

    // ── Save with userId from JWT ─────────────────────────────────────────
    const interview = await Interview.create({
      userId: req.user._id,   // ← links interview to logged-in user
      role: role.trim(),
      resumeText,
      questions,
      answers: [],
      status: "in-progress",
    });

    console.log(`✅ Interview created with ID: ${interview._id}`);

    res.status(201).json({
      success: true,
      interviewId: interview._id,
      role: interview.role,
      questions: interview.questions,
    });
  } catch (error) {
    console.error("❌ Error in startInterview:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to start interview: " + error.message,
    });
  }
};

// ─── POST /api/interview/evaluate ────────────────────────────────────────────
const evaluateInterview = async (req, res) => {
  try {
    const { interviewId, answers } = req.body;

    if (!interviewId) {
      return res.status(400).json({ success: false, message: "interviewId is required" });
    }
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "answers array is required" });
    }

    // ── Only allow user to evaluate their own interview ───────────────────
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,   // ← ensures ownership
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }

    console.log(`🔍 Evaluating ${answers.length} answers for interview: ${interviewId}`);

    const evaluatedAnswers = await Promise.all(
      answers.map(async ({ question, answer }) => {
        if (!answer || answer.trim() === "") {
          return {
            question,
            answer: "(No answer provided)",
            score: 0,
            feedback: "No answer was provided. Try to always attempt an answer — partial credit is possible.",
          };
        }
        const evaluation = await evaluateAnswer(question, answer.trim());
        return {
          question,
          answer: answer.trim(),
          score: evaluation.score,
          feedback: evaluation.feedback,
        };
      })
    );

    const totalScore   = evaluatedAnswers.reduce((sum, a) => sum + a.score, 0);
    const overallScore = Math.round((totalScore / evaluatedAnswers.length) * 10) / 10;

    interview.answers      = evaluatedAnswers;
    interview.overallScore = overallScore;
    interview.status       = "completed";
    await interview.save();

    console.log(`✅ Evaluation complete. Overall score: ${overallScore}/10`);

    res.status(200).json({
      success: true,
      interviewId: interview._id,
      role: interview.role,
      answers: evaluatedAnswers,
      overallScore,
    });
  } catch (error) {
    console.error("❌ Error in evaluateInterview:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate interview: " + error.message,
    });
  }
};

// ─── GET /api/interview/history ───────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    // ── Only return interviews belonging to the logged-in user ────────────
    const interviews = await Interview.find({
      userId: req.user._id,    // ← filters by user
      status: "completed",
    })
      .select("role overallScore createdAt questions")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("❌ Error in getHistory:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};

// ─── GET /api/interview/:id ───────────────────────────────────────────────────
const getInterview = async (req, res) => {
  try {
    // ── Only allow user to view their own interview ───────────────────────
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,    // ← ensures ownership
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    res.status(200).json({ success: true, interview });
  } catch (error) {
    console.error("❌ Error in getInterview:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch interview" });
  }
};

module.exports = { startInterview, evaluateInterview, getHistory, getInterview };