/**
 * pages/ResultPage.jsx — AI evaluation results display
 *
 * Receives results from the router state set by InterviewPage:
 *   { role, evaluated, overallScore, interviewId }
 *
 * Shows:
 *  - Overall score as an animated SVG gauge
 *  - Performance summary (tier + motivational message)
 *  - Per-answer FeedbackCards (question → answer → score → AI feedback)
 *  - Actions: Try Again, View Dashboard
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import ScoreGauge from "../components/ScoreGauge";
import FeedbackCard from "../components/FeedbackCard";
import api from "../services/api";

// Map score to a performance label + message
const getPerformanceTier = (score) => {
  if (score >= 8.5) return { label: "Exceptional 🏆",  msg: "Outstanding performance! You're interview-ready.", color: "#10b981" };
  if (score >= 7)   return { label: "Strong 🌟",        msg: "Great job! A little more polish and you'll ace it.", color: "#06b6d4" };
  if (score >= 5)   return { label: "Developing 📈",    msg: "Good foundation. Focus on the weak areas highlighted below.", color: "#f59e0b" };
  return             { label: "Keep Practicing 💪",     msg: "Don't give up! Review the feedback and try again.", color: "#ef4444" };
};

function ResultPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { id }    = useParams(); // interviewId from the URL

  // ── State ──────────────────────────────────────────────────────────────────
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    // If we have data from navigation state (fresh evaluation), use it directly
    if (location.state?.evaluated) {
      const { role, evaluated, overallScore, interviewId } = location.state;
      setData({ role, evaluated, overallScore, interviewId });
      return;
    }

    // Otherwise, fetch from DB (user landed directly on this URL / refreshed)
    const fetchResult = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/interview/${id}`);
        const interview = res.data.interview;
        setData({
          role: interview.role,
          evaluated: interview.answers,
          overallScore: interview.overallScore,
          interviewId: interview._id,
        });
      } catch (err) {
        setError("Could not load this interview. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResult();
  }, [id, location.state]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className="loading-text">Loading your results…</p>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="page-container-narrow" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <div className="error-banner" style={{ justifyContent: "center", marginBottom: "2rem" }}>
          ⚠️ {error}
        </div>
        <Link to="/" className="btn btn-primary">← Go Home</Link>
      </div>
    );
  }

  if (!data) return null;

  const { role, evaluated, overallScore } = data;
  const tier = getPerformanceTier(overallScore ?? 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-container result-page">

      {/* ── Hero Results Banner ─────────────────── */}
      <div className="result-hero glass-card animate-fadeInUp">
        <div className="result-hero-left">
          <div className="result-labels">
            <span className="tag tag-cyan">✅ Interview Complete</span>
            <span className="tag tag-violet">{role}</span>
          </div>
          <h1 className="page-title" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.75rem" }}>
            Your Results
          </h1>
          <div
            className="perf-tier-badge"
            style={{ color: tier.color, borderColor: tier.color }}
          >
            {tier.label}
          </div>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", maxWidth: 400 }}>
            {tier.msg}
          </p>

          {/* Stat row */}
          <div className="result-stats">
            <div className="result-stat">
              <span className="result-stat-value gradient-text">{evaluated.length}</span>
              <span className="result-stat-label">Questions</span>
            </div>
            <div className="result-stat">
              <span className="result-stat-value" style={{ color: tier.color }}>
                {overallScore?.toFixed(1)}
              </span>
              <span className="result-stat-label">Avg Score</span>
            </div>
            <div className="result-stat">
              <span className="result-stat-value gradient-text">
                {evaluated.filter((a) => a.score >= 7).length}
              </span>
              <span className="result-stat-label">Strong Ans.</span>
            </div>
          </div>
        </div>

        {/* Score Gauge */}
        <div className="result-hero-right">
          <ScoreGauge score={overallScore ?? 0} size={160} />
          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.75rem" }}>
            Overall Score
          </p>
        </div>
      </div>

      {/* ── Per-Question Breakdown ──────────────── */}
      <div style={{ marginTop: "2.5rem" }}>
        <h2 className="section-title animate-fadeInUp">
          Detailed Feedback
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}
           className="animate-fadeInUp delay-1">
          Review each answer, your score, and the AI's coaching notes below.
        </p>

        <div className="feedback-list">
          {evaluated.map((item, i) => (
            <FeedbackCard key={i} item={item} index={i + 1} />
          ))}
        </div>
      </div>

      {/* ── Action Buttons ──────────────────────── */}
      <div className="result-actions animate-fadeInUp">
        <button
          id="btn-try-again"
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/")}
        >
          🔄 Try Another Interview
        </button>
        <Link
          to="/dashboard"
          id="btn-view-dashboard"
          className="btn btn-secondary btn-lg"
        >
          📊 View Dashboard
        </Link>
      </div>
    </div>
  );
}

export default ResultPage;
