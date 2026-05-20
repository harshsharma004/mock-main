/**
 * pages/RegisterPage.jsx — Create account page
 * Route: /register
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";  // ← real auth

const ROLES_PREVIEW = [
  { emoji: "🎨", name: "Frontend Dev"    },
  { emoji: "⚙️", name: "Backend Dev"     },
  { emoji: "📊", name: "Data Scientist"  },
  { emoji: "🤝", name: "HR / Behavioral" },
  { emoji: "🚀", name: "Full Stack"      },
  { emoji: "✏️", name: "UI/UX Designer"  },
];

const ONBOARD_STEPS = [
  { title: "Create your free account",  sub: "Sign up in under 30 seconds" },
  { title: "Choose your role",          sub: "Pick from 8 tech and non-tech positions" },
  { title: "Answer 5 AI questions",     sub: "Role-tailored questions generated instantly" },
  { title: "Get your score & feedback", sub: "Instant AI review, scored out of 10" },
];

function getStrength(val) {
  if (!val) return null;
  let score = 0;
  if (val.length >= 8)           score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return [
    { width: "25%",  color: "#f87171", label: "Weak"   },
    { width: "50%",  color: "#fb923c", label: "Fair"   },
    { width: "75%",  color: "#facc15", label: "Good"   },
    { width: "100%", color: "#4ade80", label: "Strong" },
  ][score - 1] || { width: "25%", color: "#f87171", label: "Weak" };
}

export default function RegisterPage() {
  const navigate      = useNavigate();
  const { register }  = useAuth();  // ← replaces mock setTimeout

  const [form,    setForm]    = useState({ firstName: "", lastName: "", email: "", password: "", confirmPw: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [terms,   setTerms]   = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const strength = getStrength(form.password);

  const validate = () => {
    if (!form.firstName || !form.lastName)                return "Please enter your first and last name.";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return "Please enter a valid email address.";
    if (form.password.length < 8)                         return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPw)                 return "Passwords do not match.";
    if (!terms)                                           return "Please agree to the Terms of Service and Privacy Policy.";
    return null;
  };

  const handleRegister = async () => {
    setError("");
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await register(form.firstName, form.lastName, form.email, form.password); // ← calls /api/auth/register, saves token
      navigate("/home");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          Already have an account?{" "}
          <Link to="/login" style={s.navLink}>Sign in</Link>
        </span>
      </nav>

      <div style={s.layout}>

        {/* LEFT PANEL */}
        <div style={s.leftPanel}>
          <div style={s.glow1} />
          <div style={s.glow2} />
          <div style={s.panelContent}>
            <div style={s.tag}>✦ Free to Start</div>
            <h2 style={s.panelH2}>
              Land your <span style={{ color: "#a78bfa" }}>dream job</span>
              <br />with smarter prep.
            </h2>
            <p style={s.panelSub}>
              Create your free AiMock account and start practicing today.
              No credit card needed.
            </p>

            <div style={{ marginBottom: "2.5rem" }}>
              {ONBOARD_STEPS.map((step, i) => (
                <div key={step.title} style={s.onboardStep}>
                  <div style={s.stepLineWrap}>
                    <div style={s.stepCircle}>{i + 1}</div>
                    {i < ONBOARD_STEPS.length - 1 && <div style={s.stepConnector} />}
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <h4 style={s.stepTitle}>{step.title}</h4>
                    <p style={s.stepSub}>{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.rolesGrid}>
              {ROLES_PREVIEW.map((r) => (
                <div key={r.name} style={s.roleChip}>
                  <span style={{ fontSize: "1rem" }}>{r.emoji}</span>
                  <span style={{ fontSize: "0.78rem" }}>{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div style={s.rightPanel}>
          <div style={s.formCard}>
            <div style={{ marginBottom: "1.8rem" }}>
              <h1 style={s.formTitle}>Create your account</h1>
              <p style={s.formSub}>Start practicing for free — no credit card required</p>
            </div>

            <button style={s.googleBtn} className="google-btn">
              <GoogleIcon />
              Sign up with Google
            </button>

            <Divider text="or register with email" />

            {error && <div style={s.errorBox}>⚠️ {error}</div>}

            {/* Name row */}
            <div style={s.nameRow}>
              <Field label="First name">
                <input type="text" placeholder="Arjun"
                  value={form.firstName} onChange={set("firstName")}
                  style={s.input} className="auth-input" autoComplete="given-name" />
              </Field>
              <Field label="Last name">
                <input type="text" placeholder="Kumar"
                  value={form.lastName} onChange={set("lastName")}
                  style={s.input} className="auth-input" autoComplete="family-name" />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email address">
              <input type="email" placeholder="you@example.com"
                value={form.email} onChange={set("email")}
                style={s.input} className="auth-input" autoComplete="email" />
            </Field>

            {/* Password */}
            <Field label="Password">
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} placeholder="At least 8 characters"
                  value={form.password} onChange={set("password")}
                  style={{ ...s.input, paddingRight: "2.8rem" }}
                  className="auth-input" autoComplete="new-password" />
                <button style={s.eyeBtn} onClick={() => setShowPw(!showPw)} type="button">
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
              {strength && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: 2, transition: "width 0.3s,background 0.3s" }} />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </Field>

            {/* Confirm password */}
            <Field label="Confirm password">
              <div style={{ position: "relative" }}>
                <input type={showCpw ? "text" : "password"} placeholder="Repeat your password"
                  value={form.confirmPw} onChange={set("confirmPw")}
                  style={{ ...s.input, paddingRight: "2.8rem" }}
                  className="auth-input" autoComplete="new-password" />
                <button style={s.eyeBtn} onClick={() => setShowCpw(!showCpw)} type="button">
                  {showCpw ? "🙈" : "👁"}
                </button>
              </div>
            </Field>

            {/* Terms */}
            <label style={s.termsRow}>
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
                style={{ accentColor: "#6c63ff", width: 15, height: 15, marginTop: 2, flexShrink: 0, cursor: "pointer" }} />
              <span style={{ fontSize: "0.82rem", color: "#7a7e9a", lineHeight: 1.5 }}>
                I agree to the{" "}
                <Link to="/terms" style={s.inlineLink}>Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" style={s.inlineLink}>Privacy Policy</Link>
              </span>
            </label>

            <button onClick={handleRegister} disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }} className="submit-btn">
              {loading ? "Creating account…" : "Create Account →"}
            </button>

            <p style={s.formFooter}>
              Already have an account?{" "}
              <Link to="/login" style={s.footerLink}>Sign in instead</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#e8e9f3", marginBottom: "0.4rem" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Divider({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.4rem 0" }}>
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
  page:         { background: "#0a0b14", color: "#e8e9f3", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" },
  nav:          { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  logo:         { display: "flex", alignItems: "center", gap: 10, fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#e8e9f3", textDecoration: "none" },
  logoIcon:     { width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#6c63ff,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 },
  navRight:     { fontSize: "0.88rem", color: "#7a7e9a" },
  navLink:      { color: "#a78bfa", textDecoration: "none", fontWeight: 500 },
  layout:       { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 61px)" },
  leftPanel:    { background: "#0f1120", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 3rem", position: "relative", overflow: "hidden" },
  glow1:        { position: "absolute", top: -80, left: -60, width: 350, height: 350, background: "radial-gradient(ellipse,rgba(108,99,255,0.15),transparent 70%)", pointerEvents: "none" },
  glow2:        { position: "absolute", bottom: -60, right: -60, width: 300, height: 300, background: "radial-gradient(ellipse,rgba(56,189,248,0.1),transparent 70%)", pointerEvents: "none" },
  panelContent: { position: "relative", zIndex: 1, maxWidth: 400, width: "100%" },
  tag:          { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "#a78bfa", padding: "5px 14px", borderRadius: 100, fontSize: "0.74rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "2rem" },
  panelH2:      { fontFamily: "'Syne',sans-serif", fontSize: "2rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "1rem" },
  panelSub:     { color: "#7a7e9a", fontSize: "0.95rem", marginBottom: "2.5rem" },
  onboardStep:  { display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: "1.5rem" },
  stepLineWrap: { display: "flex", flexDirection: "column", alignItems: "center" },
  stepCircle:   { width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 600, color: "#a78bfa" },
  stepConnector:{ width: 1, flex: 1, background: "rgba(255,255,255,0.07)", minHeight: 24 },
  stepTitle:    { fontSize: "0.88rem", fontWeight: 500, marginBottom: 2 },
  stepSub:      { fontSize: "0.8rem", color: "#7a7e9a" },
  rolesGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  roleChip:     { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", gap: 7, color: "#e8e9f3" },
  rightPanel:   { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 2rem" },
  formCard:     { width: "100%", maxWidth: 440 },
  formTitle:    { fontFamily: "'Syne',sans-serif", fontSize: "1.7rem", fontWeight: 700, marginBottom: "0.4rem" },
  formSub:      { color: "#7a7e9a", fontSize: "0.9rem" },
  googleBtn:    { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "#e8e9f3", padding: "0.75rem 1rem", borderRadius: 10, fontSize: "0.92rem", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },
  nameRow:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" },
  input:        { width: "100%", padding: "0.72rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "#e8e9f3", fontSize: "0.93rem", fontFamily: "'DM Sans',sans-serif", outline: "none" },
  eyeBtn:       { position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7a7e9a", fontSize: "1rem", padding: 0 },
  termsRow:     { display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "1.4rem", cursor: "pointer" },
  inlineLink:   { color: "#a78bfa", textDecoration: "none" },
  errorBox:     { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: 8, padding: "0.7rem 1rem", fontSize: "0.85rem", marginBottom: "1rem" },
  submitBtn:    { width: "100%", padding: "0.85rem", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.95rem", fontWeight: 500, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 0 24px rgba(108,99,255,0.3)" },
  formFooter:   { textAlign: "center", marginTop: "1.2rem", fontSize: "0.85rem", color: "#7a7e9a" },
  footerLink:   { color: "#a78bfa", textDecoration: "none", fontWeight: 500 },
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