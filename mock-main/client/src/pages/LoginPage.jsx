/**
 * pages/LoginPage.jsx — Sign-in page
 * Route: /login
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";  // ← real auth

export default function LoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();  // ← replaces mock setTimeout

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }

    setLoading(true);
    try {
      await login(email, password);  // ← calls /api/auth/login, saves token
      navigate("/home");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <Link to="/landing" style={s.logo}>
          <div style={s.logoIcon}>🤖</div>
          AiMock
        </Link>
        <span style={s.navRight}>
          Don't have an account?{" "}
          <Link to="/register" style={s.navLink}>Sign up free</Link>
        </span>
      </nav>

      <div style={s.layout}>

        {/* LEFT PANEL */}
        <div style={s.leftPanel}>
          <div style={s.glow1} />
          <div style={s.glow2} />
          <div style={s.panelContent}>
            <div style={s.tag}>✦ AI Interview Coach</div>
            <h2 style={s.panelH2}>
              Welcome back,<br />
              <span style={{ color: "#a78bfa" }}>practice makes</span> perfect.
            </h2>
            <p style={s.panelSub}>
              Continue where you left off and keep sharpening your interview skills
              with AI-powered feedback.
            </p>
            <div style={s.perks}>
              {[
                { icon: "🎯", bg: "rgba(108,99,255,0.15)", title: "Role-specific questions",    sub: "Tailored to your exact target position" },
                { icon: "⚡", bg: "rgba(56,189,248,0.12)",  title: "Instant feedback & scoring", sub: "Scored out of 10 with detailed explanations" },
                { icon: "📈", bg: "rgba(74,222,128,0.10)",  title: "Track your progress",        sub: "See how your scores improve over time" },
              ].map((p) => (
                <div key={p.title} style={s.perk}>
                  <div style={{ ...s.perkIcon, background: p.bg }}>{p.icon}</div>
                  <div>
                    <h4 style={s.perkTitle}>{p.title}</h4>
                    <p style={s.perkSub}>{p.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={s.quote}>
              <p style={s.quoteText}>
                "I went from blanking on system design questions to landing a senior engineer
                role at a top company — AiMock made the difference."
              </p>
              <div style={s.quoteAuthor}>
                <div style={s.avatar}>AK</div>
                <div>
                  <div style={s.authorName}>Arjun K.</div>
                  <div style={s.authorRole}>Senior Software Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div style={s.rightPanel}>
          <div style={s.formCard}>
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={s.formTitle}>Sign in to AiMock</h1>
              <p style={s.formSub}>Enter your credentials to access your dashboard</p>
            </div>

            <button style={s.googleBtn} className="google-btn">
              <GoogleIcon />
              Continue with Google
            </button>

            <Divider text="or sign in with email" />

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            <Field label="Email address">
              <input
                type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                style={s.input} className="auth-input" autoComplete="email"
              />
            </Field>

            <Field
              label="Password"
              right={<Link to="/forgot-password" style={s.forgotLink}>Forgot password?</Link>}
            >
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ ...s.input, paddingRight: "2.8rem" }}
                  className="auth-input" autoComplete="current-password"
                />
                <button style={s.eyeBtn} onClick={() => setShowPw(!showPw)} type="button">
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </Field>

            <label style={s.rememberRow}>
              <input type="checkbox" checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: "#6c63ff", width: 16, height: 16, cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.85rem", color: "#7a7e9a" }}>Remember me for 30 days</span>
            </label>

            <button onClick={handleLogin} disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }} className="submit-btn">
              {loading ? "Signing in…" : "Sign in →"}
            </button>

            <p style={s.formFooter}>
              Don't have an account?{" "}
              <Link to="/register" style={s.footerLink}>Create one free</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function Field({ label, right, children }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "#e8e9f3" }}>{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}

function Divider({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.5rem 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      <span style={{ fontSize: "0.78rem", color: "#7a7e9a" }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M5.26 12A6.74 6.74 0 0 1 12 5.26c1.62 0 3.1.58 4.24 1.52L19.5 3.52A11.88 11.88 0 0 0 12 .5C7.05.5 2.86 3.5 1 7.86L5.26 12Z"/>
      <path fill="#34A853" d="M12 23.5c3.28 0 6.05-1.09 8.06-2.96l-3.73-3.06A7.46 7.46 0 0 1 12 18.74 6.74 6.74 0 0 1 5.27 13.8L1 18.14C2.86 22.5 7.05 23.5 12 23.5Z"/>
      <path fill="#FBBC05" d="M23.5 12c0-.85-.08-1.67-.22-2.46H12v4.65h6.46a5.5 5.5 0 0 1-2.4 3.61l3.73 3.06C21.8 18.77 23.5 15.65 23.5 12Z"/>
      <path fill="#4285F4" d="M5.26 13.8a6.7 6.7 0 0 1 0-3.6L1 5.86a11.92 11.92 0 0 0 0 12.28L5.26 13.8Z"/>
    </svg>
  );
}

const s = {
  page:        { background: "#0a0b14", color: "#e8e9f3", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" },
  nav:         { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  logo:        { display: "flex", alignItems: "center", gap: 10, fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#e8e9f3", textDecoration: "none" },
  logoIcon:    { width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6c63ff,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 },
  navRight:    { fontSize: "0.88rem", color: "#7a7e9a" },
  navLink:     { color: "#a78bfa", textDecoration: "none", fontWeight: 500 },
  layout:      { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 61px)" },
  leftPanel:   { background: "#0f1120", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 3rem", position: "relative", overflow: "hidden" },
  glow1:       { position: "absolute", top: -80, right: -100, width: 400, height: 400, background: "radial-gradient(ellipse,rgba(108,99,255,0.15),transparent 70%)", pointerEvents: "none" },
  glow2:       { position: "absolute", bottom: -60, left: -60, width: 300, height: 300, background: "radial-gradient(ellipse,rgba(56,189,248,0.1),transparent 70%)", pointerEvents: "none" },
  panelContent:{ position: "relative", zIndex: 1, maxWidth: 400, width: "100%" },
  tag:         { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "#a78bfa", padding: "5px 14px", borderRadius: 100, fontSize: "0.74rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "2rem" },
  panelH2:     { fontFamily: "'Syne',sans-serif", fontSize: "2rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "1rem" },
  panelSub:    { color: "#7a7e9a", fontSize: "0.95rem", marginBottom: "2.5rem" },
  perks:       { display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" },
  perk:        { display: "flex", alignItems: "flex-start", gap: 12 },
  perkIcon:    { width: 36, height: 36, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" },
  perkTitle:   { fontSize: "0.88rem", fontWeight: 500, marginBottom: 2 },
  perkSub:     { fontSize: "0.8rem", color: "#7a7e9a", margin: 0 },
  quote:       { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1.2rem 1.4rem" },
  quoteText:   { fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "0.75rem", fontStyle: "italic" },
  quoteAuthor: { display: "flex", alignItems: "center", gap: 10 },
  avatar:      { width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 600, color: "#fff", flexShrink: 0 },
  authorName:  { fontSize: "0.8rem", fontWeight: 500 },
  authorRole:  { fontSize: "0.73rem", color: "#7a7e9a" },
  rightPanel:  { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem" },
  formCard:    { width: "100%", maxWidth: 420 },
  formTitle:   { fontFamily: "'Syne',sans-serif", fontSize: "1.7rem", fontWeight: 700, marginBottom: "0.4rem" },
  formSub:     { color: "#7a7e9a", fontSize: "0.9rem" },
  googleBtn:   { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "#e8e9f3", padding: "0.75rem 1rem", borderRadius: 10, fontSize: "0.92rem", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },
  input:       { width: "100%", padding: "0.72rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "#e8e9f3", fontSize: "0.93rem", fontFamily: "'DM Sans',sans-serif", outline: "none" },
  eyeBtn:      { position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7a7e9a", fontSize: "1rem", padding: 0 },
  forgotLink:  { fontSize: "0.82rem", color: "#a78bfa", textDecoration: "none" },
  rememberRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", cursor: "pointer" },
  errorBox:    { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: 8, padding: "0.7rem 1rem", fontSize: "0.85rem", marginBottom: "1rem" },
  submitBtn:   { width: "100%", padding: "0.85rem", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.95rem", fontWeight: 500, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 0 24px rgba(108,99,255,0.3)" },
  formFooter:  { textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "#7a7e9a" },
  footerLink:  { color: "#a78bfa", textDecoration: "none", fontWeight: 500 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .auth-input::placeholder { color: #7a7e9a; }
  .auth-input:focus { border-color: rgba(108,99,255,0.5) !important; background: rgba(108,99,255,0.05) !important; }
  .google-btn:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.15) !important; }
  .submit-btn:hover:not(:disabled) { background: #7c74ff !important; transform: translateY(-1px); box-shadow: 0 4px 30px rgba(108,99,255,0.45) !important; }
  .submit-btn:active { transform: scale(0.98) !important; }
  @media (max-width: 768px) {
    div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
    div[style*="borderRight"] { display: none !important; }
  }
`;