/**
 * src/App.jsx — Root component with route definitions + auth protection
 *
 * Route Map:
 *  /landing    → LandingPage   (public marketing page)
 *  /login      → LoginPage     (public)
 *  /register   → RegisterPage  (public)
 *  /           → HomePage      (protected — select role, start interview)
 *  /interview  → InterviewPage (protected)
 *  /results/:id→ ResultPage    (protected)
 *  /dashboard  → DashboardPage (protected)
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import InterviewPage from "./pages/InterviewPage";
import ResultPage from "./pages/ResultPage";
import DashboardPage from "./pages/DashboardPage";

// ── Auth helper ────────────────────────────────────────────────────────────
// Returns true if a token exists in localStorage.
// Replace this with your real auth check (context, cookie, etc.) if needed.
const isLoggedIn = () => !!localStorage.getItem("token");

// ── PrivateRoute ───────────────────────────────────────────────────────────
// Wraps protected pages. If not logged in → redirect to /login.
function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// ── PublicRoute ────────────────────────────────────────────────────────────
// Wraps auth pages (login/register/landing).
// If already logged in → redirect to / instead of showing login again.
function PublicRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <Routes>

      {/* ── Default: redirect / based on auth status ──────────────────── */}
      {/* If logged in → /         (HomePage)  */}
      {/* If not       → /landing  (LandingPage) */}
      <Route
        path="/"
        element={
          isLoggedIn()
            ? <Navigate to="/home" replace />
            : <Navigate to="/landing" replace />
        }
      />

      {/* ── Public routes (no Navbar) ──────────────────────────────────── */}
      <Route path="/landing"  element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* ── Protected routes (with Navbar) ────────────────────────────── */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                <HomePage />
              </main>
            </div>
          </PrivateRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <PrivateRoute>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                <InterviewPage />
              </main>
            </div>
          </PrivateRoute>
        }
      />
      <Route
        path="/results/:id"
        element={
          <PrivateRoute>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                <ResultPage />
              </main>
            </div>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                <DashboardPage />
              </main>
            </div>
          </PrivateRoute>
        }
      />

      {/* ── 404 fallback ───────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;