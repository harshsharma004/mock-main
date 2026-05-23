/**
 * components/FeedbackCard.jsx — Collapsible Q&A + AI feedback card
 *
 * Shown on the Result page for each evaluated answer.
 *
 * Props:
 *  - item   { question, answer, score, feedback }
 *  - index  {number} — display number (1-based)
 */

import React, { useState } from "react";
import ScoreGauge from "./ScoreGauge";

function FeedbackCard({ item, index }) {
  // Toggle showing/hiding the full AI feedback section
  const [expanded, setExpanded] = useState(true);

  // Determine score tier for the badge
  const scoreTier =
    item.score >= 7 ? "score-high" : item.score >= 5 ? "score-mid" : "score-low";

  return (
    <div
      className="glass-card feedback-card animate-fadeInUp"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* ── Card Header ─────────────────────────────── */}
      <div className="feedback-card-header">
        <div className="feedback-meta">
          <span className="tag tag-violet">Q{index}</span>
          <span className={`score-badge ${scoreTier}`}>
            ⭐ {item.score.toFixed(1)} / 10
          </span>
        </div>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? "Hide ▲" : "Show ▼"}
        </button>
      </div>

      {/* ── Question ────────────────────────────────── */}
      <p className="feedback-question">{item.question}</p>

      {/* ── Collapsible Body ────────────────────────── */}
      {expanded && (
        <div className="feedback-body">
          {/* User's answer */}
          <div className="feedback-section">
            <span className="feedback-section-label">Your Answer</span>
            <p className="feedback-answer-text">{item.answer}</p>
          </div>

          {/* AI Feedback */}
          <div className="feedback-section feedback-ai">
            <span className="feedback-section-label">🤖 AI Feedback</span>
            <p className="feedback-text">{item.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackCard;
