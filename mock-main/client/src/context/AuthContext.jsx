/**
 * src/context/AuthContext.jsx — Global auth state for the React app
 *
 * Wrap your app with <AuthProvider> in main.jsx.
 * Use the useAuth() hook anywhere to get user/login/logout.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while checking token on mount

  // ── On app load: validate existing token ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Verify token is still valid by fetching current user from backend
    api.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Token invalid or expired — clear it
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (firstName, lastName, email, password) => {
    const res = await api.post("/auth/register", { firstName, lastName, email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ── Show nothing while checking token on first load ───────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0b14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid rgba(108,99,255,0.3)",
            borderTop: "3px solid #6c63ff",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 1rem",
          }} />
          <p style={{ color: "#7a7e9a", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem" }}>
            Loading…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};