/**
 * pages/DashboardPage.jsx — Interview history dashboard
 *
 * Fetches all completed interviews from the backend and displays them
 * in a sortable table with scores, roles, dates, and links to results.
 *
 * API: GET /api/interview/history
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ScoreGauge from "../components/ScoreGauge";
import api from "../services/api";
import { BarChart, LayoutDashboard, Mic, Mic2, Trophy } from "lucide-react";

// Format a date string into a readable format
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// Determine score color class
const scoreTierClass = (score) =>
  score >= 7 ? "score-high" : score >= 5 ? "score-mid" : "score-low";

function DashboardPage() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── Fetch history on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/interview/history");
        setInterviews(res.data.interviews || []);
      } catch (err) {
        setError("Failed to load interview history. Is the server running?");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // ── Summary Stats (computed from data) ────────────────────────────────────
  const avgScore =
    interviews.length > 0
      ? (interviews.reduce((s, i) => s + (i.overallScore || 0), 0) / interviews.length).toFixed(1)
      : "—";

  const bestScore =
    interviews.length > 0
      ? Math.max(...interviews.map((i) => i.overallScore || 0)).toFixed(1)
      : "—";

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className="loading-text">Loading your interview history…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-container dashboard-page">

      {/* ── Page Header ─────────────────────────── */}
      <div className="dashboard-header animate-fadeInUp">
        <div>
          <h1 className="page-title" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            <LayoutDashboard size={35}/> <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Track your progress across all mock interviews.
          </p>
        </div>
        <button
          id="btn-new-interview"
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          + New Interview
        </button>
      </div>

      {/* ── Error ────────────────────────────────── */}
      {error && (
        <div className="error-banner animate-fadeIn" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* ── Summary Cards ───────────────────────── */}
      {interviews.length > 0 && (
        <div className="dash-stats animate-fadeInUp delay-1">
          {[
            { label: "Total Interviews", value: interviews.length, icon: <Mic2 size={30}/> },
            { label: "Average Score",    value: `${avgScore} / 10`, icon:<BarChart size={30}/> },
            { label: "Best Score",       value: `${bestScore} / 10`, icon: <Trophy size={30}/> },
          ].map((s) => (
            <div key={s.label} className="dash-stat-card glass-card">
              <span className="dash-stat-icon">{s.icon}</span>
              <span className="dash-stat-value gradient-text">{s.value}</span>
              <span className="dash-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Interview History Table ──────────────── */}
      {interviews.length === 0 ? (
        // Empty state
        <div className="glass-card empty-state animate-fadeInUp delay-2">
          <div className="icon">🎤</div>
          <h3>No interviews yet</h3>
          <p>Complete your first mock interview to see your history here.</p>
          <Link to="/" className="btn btn-primary">Start Your First Interview</Link>
        </div>
      ) : (
        <div className="glass-card table-card animate-fadeInUp delay-2">
          <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>
            Interview History
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table" id="interview-history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Role</th>
                  <th>Score</th>
                  <th>Questions</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview, index) => (
                  <tr key={interview._id}>
                    <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                      {index + 1}
                    </td>
                    <td>
                      <span className="tag tag-violet">{interview.role}</span>
                    </td>
                    <td>
                      <span
                        className={`score-badge ${scoreTierClass(interview.overallScore)}`}
                      >
                        ⭐ {interview.overallScore?.toFixed(1) ?? "—"} / 10
                      </span>
                    </td>
                    <td>{interview.questions?.length ?? 0} questions</td>
                    <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                      {formatDate(interview.createdAt)}
                    </td>
                    <td>
                      <Link
                        to={`/results/${interview._id}`}
                        className="btn btn-sm btn-outline"
                        id={`btn-view-${interview._id}`}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Score Trend (mini gauge row) ────────── */}
      {interviews.length > 0 && (
        <div className="animate-fadeInUp delay-3" style={{ marginTop: "2rem" }}>
          <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>
            Score Overview
          </h2>
          <div className="score-overview-grid">
            {interviews.slice(0, 6).map((iv, i) => (
              <Link
                key={iv._id}
                to={`/results/${iv._id}`}
                className="glass-card score-overview-card"
                style={{ textDecoration: "none" }}
              >
                <ScoreGauge score={iv.overallScore ?? 0} size={90} />
                <p style={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginTop: "0.5rem",
                  lineHeight: 1.4,
                }}>
                  {iv.role}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
