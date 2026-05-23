/**
 * pages/InterviewPage.jsx — Step-through question answering interface
 *
 * Receives interview context from the router state set by HomePage:
 *   { interviewId, role, questions }
 *
 * Flow:
 *  1. Display questions one at a time with a progress bar
 *  2. User types answer → clicks "Next" (or "Submit" on last question)
 *  3. On submit: POST /api/interview/evaluate with all answers
 *  4. Navigate to /results/:id with the evaluation data
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

function InterviewPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Pull data passed from HomePage via router state
  const state = location.state;

  // ── Guard: redirect home if no interview context ──────────────────────────
  useEffect(() => {
    if (!state?.questions || !state?.interviewId) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.questions) return null; // Prevent flash during redirect

  const { interviewId, role, questions } = state;

  // ── Component State ───────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);  // Which question we're on
  const [answers, setAnswers]           = useState(     // User's answers, one per question
    () => questions.map(() => "")
  );
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState(null);

  const totalQuestions = questions.length;
  const currentAnswer  = answers[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progressPct    = ((currentIndex + 1) / totalQuestions) * 100;

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Update the answer for the current question in the array
  const handleAnswerChange = (e) => {
    const updated = [...answers];
    updated[currentIndex] = e.target.value;
    setAnswers(updated);
  };

  // Move forward in the question list
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setError(null);
    }
  };

  // Go back to edit a previous answer
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setError(null);
    }
  };

  // Submit all answers for AI evaluation
  const handleSubmit = async () => {
    // Warn if any answer is empty (but allow skipping with confirmation)
    const emptyCount = answers.filter((a) => a.trim() === "").length;
    if (emptyCount > 0) {
      const ok = window.confirm(
        `${emptyCount} question(s) have no answer. Empty answers will score 0. Continue?`
      );
      if (!ok) return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Build the payload: array of { question, answer } pairs
      const answersPayload = questions.map((q, i) => ({
        question: q,
        answer: answers[i],
      }));

      const res = await api.post("/interview/evaluate", {
        interviewId,
        answers: answersPayload,
      });

      const { answers: evaluated, overallScore } = res.data;

      // Navigate to results, passing evaluation data via state
      navigate(`/results/${interviewId}`, {
        state: { role, evaluated, overallScore, interviewId },
      });
    } catch (err) {
      setError(err.message || "Evaluation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-container-narrow interview-page">

      {/* ── Header ─────────────────────────────────── */}
      <div className="interview-header animate-fadeInUp">
        <div className="interview-meta">
          <span className="tag tag-cyan">🎯 {role}</span>
          <span className="tag tag-violet">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <h1 className="interview-title">Mock Interview</h1>
      </div>

      {/* ── Progress Bar ───────────────────────────── */}
      <div className="animate-fadeInUp delay-1" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--accent-violet-light)", fontWeight: 600 }}>
            {Math.round(progressPct)}% Complete
          </span>
        </div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* ── Question Card ───────────────────────────── */}
      {/* The key prop forces a re-mount (re-animation) on each question change */}
      <div
        key={currentIndex}
        className="glass-card question-card animate-slideInRight"
      >
        <div className="question-number-badge">Question {currentIndex + 1}</div>
        <p className="question-text">{questions[currentIndex]}</p>
      </div>

      {/* ── Answer Input ────────────────────────────── */}
      <div className="glass-card answer-card animate-fadeInUp delay-2">
        <div className="form-group">
          <label className="form-label" htmlFor="answer-input">
            Your Answer
          </label>
          <textarea
            id="answer-input"
            className="form-textarea"
            placeholder="Type your answer here… Be as detailed as possible for a better score."
            value={currentAnswer}
            onChange={handleAnswerChange}
            rows={7}
            disabled={submitting}
          />
          {/* Character counter */}
          <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {currentAnswer.length} characters
          </div>
        </div>

        {/* Answer quick-select tips */}
        <div className="answer-tips">
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            💡 Tip: Include examples, tools, or real experiences for better AI scores.
          </span>
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────── */}
      {error && (
        <div className="error-banner animate-fadeIn" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* ── Navigation Controls ──────────────────────── */}
      <div className="interview-controls animate-fadeInUp delay-3">
        {/* Back button (hidden on first question) */}
        <button
          id="btn-back"
          className="btn btn-secondary"
          onClick={handleBack}
          disabled={currentIndex === 0 || submitting}
        >
          ← Back
        </button>

        {/* Question dot indicators */}
        <div className="question-dots">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`q-dot ${i === currentIndex ? "q-dot-active" : ""} ${
                answers[i].trim() ? "q-dot-answered" : ""
              }`}
              onClick={() => { setCurrentIndex(i); setError(null); }}
              title={`Question ${i + 1}`}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>

        {/* Next / Submit button */}
        {isLastQuestion ? (
          <button
            id="btn-submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Evaluating…
              </>
            ) : (
              "Submit All ✅"
            )}
          </button>
        ) : (
          <button
            id="btn-next"
            className="btn btn-primary"
            onClick={handleNext}
          >
            Next →
          </button>
        )}
      </div>

      {/* Evaluating overlay */}
      {submitting && (
        <div className="evaluating-banner glass-card animate-fadeIn">
          <div className="spinner" />
          <div>
            <strong>Evaluating your answers…</strong>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              AI is scoring each answer. This may take 15-30 seconds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewPage;
