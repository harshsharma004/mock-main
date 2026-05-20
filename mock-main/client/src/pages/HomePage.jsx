/**
 * pages/HomePage.jsx — Landing page with role selector
 *
 * Flow:
 *  1. User picks a job role from the dropdown
 *  2. Clicks "Start Interview"
 *  3. POST /api/interview/start is called
 *  4. On success, navigate to /interview with state (questions + interviewId)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiPostForm } from "../services/api";
import { Palette,Rocket,Target,ChartArea, PenLine,LayoutDashboard,BotIcon,Cog ,HandshakeIcon,Wrench,Pencil,Notebook, Pen } from "lucide-react";

// Available roles that the AI can tailor questions for
const ROLES = [
  { value: "Frontend Developer",   emoji: <Palette color="white"/>, desc: "HTML, CSS, JS, React, performance" },
  { value: "Backend Developer",    emoji: <Cog color="white"/>,  desc: "APIs, databases, servers, architecture" },
  { value: "Full Stack Developer", emoji: <Rocket color="white"/>, desc: "End-to-end systems and integration" },
  { value: "Data Scientist",       emoji: <LayoutDashboard color="white"/>, desc: "ML, statistics, Python, data pipelines" },
  { value: "DevOps Engineer",      emoji: <Wrench color="white"/>, desc: "CI/CD, cloud, containers, monitoring" },
  { value: "HR / Behavioral",      emoji: <HandshakeIcon color="white"/>, desc: "Soft skills, culture fit, situational" },
  { value: "Product Manager",      emoji: <Notebook color="white"/>, desc: "Roadmapping, metrics, stakeholders" },
  { value: "UI/UX Designer",       emoji: <Pencil color="white"/>,  desc: "Design systems, UX research, Figma" },
];

function HomePage() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────
  const [selectedRole, setSelectedRole] = useState("");
  const [resumeFile, setResumeFile]     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // The full role object for the selected value (so we can show the emoji/desc)
  const activeRole = ROLES.find((r) => r.value === selectedRole);

  // ── Start Interview Handler ─────────────────────────
  const handleStart = async () => {
    if (!selectedRole) {
      setError("Please select a role before starting.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res;
      if (resumeFile) {
        // Send multipart/form-data
        const formData = new FormData();
        formData.append("role", selectedRole);
        formData.append("resume", resumeFile);
        res = await apiPostForm("/interview/start", formData);
      } else {
        // Send standard JSON
        res = await api.post("/interview/start", { role: selectedRole });
      }
      
      const { interviewId, role, questions } = res.data;

      // Navigate to the interview page, passing context via router state
      // (avoids exposing data in the URL)
      navigate("/interview", { state: { interviewId, role, questions } });
    } catch (err) {
      setError(err.message || "Failed to start interview. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="page-container home-page">

      {/* ── Hero Section ─────────────────────────── */}
      <div className="hero-section animate-fadeInUp">
        <div className="hero-badge animate-fadeInUp delay-1">
          <span className="tag tag-violet">✨ Powered by GPT-4o-mini</span>
        </div>

        <h1 className="page-title animate-fadeInUp delay-2">
          Ace Your Next<br />
          <span className="gradient-text">Interview</span> with AI
        </h1>

        <p className="page-subtitle animate-fadeInUp delay-3">
          Get AI-generated questions tailored to your role, answer them at your own
          pace, and receive instant expert feedback with a score out of 10.
        </p>
      </div>

      {/* ── Stats Strip ──────────────────────────── */}
      <div className="stats-strip animate-fadeInUp delay-3">
        {[
          { value: "8", label: "Roles" },
          { value: "5", label: "Questions each" },
          { value: "GPT-4o", label: "AI Model" },
          { value: "Instant", label: "Feedback" },
        ].map((stat) => (
          <div key={stat.label} className="stat-item">
            <span className="stat-value gradient-text">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Role Selector Card ───────────────────── */}
      <div className="glass-card selector-card animate-fadeInUp delay-4">
        <h2 className="section-title">Choose Your Interview Role</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          Select the position you're preparing for and we'll generate relevant questions.
        </p>

        {/* Role grid — clickable tiles */}
        <div className="role-grid">
          {ROLES.map((role) => (
            <button
              key={role.value}
              id={`role-${role.value.replace(/\s+/g, "-").toLowerCase()}`}
              className={`role-tile ${selectedRole === role.value ? "role-tile-active" : ""}`}
              onClick={() => { setSelectedRole(role.value); setError(null); }}
            >
              <span className="role-emoji">{role.emoji}</span>
              <span className="role-name">{role.value}</span>
              <span className="role-desc">{role.desc}</span>
            </button>
          ))}
        </div>

        {/* Active role confirmation pill */}
        {activeRole && (
          <div className="selected-role-banner animate-fadeIn">
            <span>{activeRole.emoji}</span>
            <span>
              Selected: <strong>{activeRole.value}</strong>
            </span>
          </div>
        )}

        {/* Resume Upload section */}
        <div className="resume-upload-section animate-fadeIn" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>
            Upload Resume (Optional, PDF only)
          </label>
          <div style={{ background: "var(--bg-card)", padding: "1rem", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setResumeFile(e.target.files[0]);
                }
              }}
              style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "100%" }}
            />
            {resumeFile && (
              <p style={{ fontSize: "0.8rem", color: "var(--accent-cyan-light)", marginTop: "0.5rem", fontWeight: 600 }}>
                📄 Attached: {resumeFile.name}
              </p>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="error-banner" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* CTA Button */}
        <button
          id="btn-start-interview"
          className="btn btn-primary btn-lg start-btn"
          onClick={handleStart}
          disabled={loading || !selectedRole}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              Generating Questions…
            </>
          ) : (
            <> <Rocket/> Start Interview</>
          )}
        </button>

        {loading && (
          <p className="loading-hint animate-fadeIn">
            <bot/> AI is crafting 5 tailored questions — this takes about 5-10 seconds…
          </p>
        )}
      </div>

      {/* ── How It Works ─────────────────────────── */}
      <div className="how-it-works animate-fadeInUp delay-5">
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          How It Works
        </h2>
        <div className="steps-grid">
          {[
            { step: "01", icon: <Target/>, title: "Pick Your Role", desc: "Choose from 8 job roles ranging from dev to design to HR." },
            { step: "02", icon: <BotIcon/>, title: "Get AI Questions",  desc: "GPT-4o-mini generates 5 targeted interview questions for your role." },
            { step: "03", icon:<PenLine/>,  title: "Answer Them",      desc: "Take your time and type out your best answers." },
            { step: "04", icon: <ChartArea/>, title: "Get Scored",        desc: "AI evaluates each answer with a score out of 10 and detailed feedback." },
          ].map((item) => (
            <div key={item.step} className="step-card glass-card">
              <div className="step-number">{item.step}</div>
              <div className="step-icon">{item.icon}</div>
              <h3 className="step-title">{item.title}</h3>
              <p className="step-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
