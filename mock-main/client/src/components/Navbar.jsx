/**
 * components/Navbar.jsx — Fixed top navigation bar
 *
 * Shows the brand logo, navigation links, user greeting, and logout button.
 */

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {LayoutDashboard} from "lucide-react";
import logo from "../assets/logo.png"

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/landing");
  };

  return (
    <nav className="navbar">
      {/* Brand / Logo */}
      <NavLink to="/home" className="navbar-brand">
        <img
  src={logo}
  alt="Brand Logo"
  style={{
    width: "60px",
    height: "60px",
    display: "inline-block",
    objectFit: "contain",
  }}
/>
        <span className="brand-text">MockVerse</span>
      </NavLink>

      {/* Navigation Links */}
      <ul className="navbar-links">
        <li>
          <NavLink
            to="/home"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <LayoutDashboard size={12} />  Dashboard
          </NavLink>
        </li>
      </ul>

      {/* Right side — user greeting + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user && (
          <span style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary, #7a7e9a)",
          }}>
            Hi {user.firstName}
          </span>
        )}
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.3)",
            color: "#f87171",
            padding: "0.4rem 1rem",
            borderRadius: 8,
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.background = "rgba(248,113,113,0.2)"}
          onMouseLeave={(e) => e.target.style.background = "rgba(248,113,113,0.1)"}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;