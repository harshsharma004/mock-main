/**
 * src/services/api.js — Axios HTTP client for backend communication
 *
 * Creates a pre-configured Axios instance so every API call automatically:
 *  - Points to the backend base URL
 *  - Sets Content-Type: application/json
 *  - Attaches JWT token to every request (Authorization: Bearer <token>)
 *  - Auto-redirects to /login if token is expired or invalid (401)
 *  - Has a sensible timeout
 *
 * Usage: import api from '../services/api'
 *        const res = await api.post('/interview/start', { role })
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5173/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds — AI calls can be slow on first request
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Surface meaningful error messages + auto-logout on token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid → clear storage and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    const message =
      error.response?.data?.message || error.message || "An unknown error occurred";
    return Promise.reject(error); // keep original error so components can read .response.data.message
  }
);

// ─── Multipart Form helper (for resume PDF uploads) ───────────────────────────
export const apiPostForm = async (url, formData) => {
  const token = localStorage.getItem("token");
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5173/api";
  return await axios
    .post(baseURL + url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 30000,
    })
    .catch((error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      const message =
        error.response?.data?.message || error.message || "An unknown error occurred";
      return Promise.reject(new Error(message));
    });
};

export default api;