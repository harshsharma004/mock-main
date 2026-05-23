/**
 * src/main.jsx — React application entry point
 * Wraps the app in BrowserRouter for client-side routing
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "./pages.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>   {/* ← gives every page access to user/login/logout */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);