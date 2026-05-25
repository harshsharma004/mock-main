/**
 * server.js — Entry point for the AI Mock Interview Platform backend
 *
 * Responsibilities:
 *  - Load environment variables from .env
 *  - Connect to MongoDB via Mongoose
 *  - Configure Express middleware (JSON, CORS, logging)
 *  - Mount route handlers
 *  - Start the HTTP server
 */
require("dotenv").config(); // Load .env into process.env

const express        = require("express");
const mongoose       = require("mongoose");
const cors           = require("cors");
const morgan         = require("morgan");

const interviewRoutes = require("./routes/interviewRoutes");
const authRoutes      = require("./routes/auth");          // ← auth routes added

const app  = express();
const PORT = process.env.PORT || 5173;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman)
      if (!origin) return callback(null, true);
      // Allow ANY localhost port — no matter what port Vite picks
      if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
      // Allow deployed frontend origin
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/interview", interviewRoutes);
app.use("/api/auth",      authRoutes);           // ← mounted here

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Server error" });
});

// ─── Database Connection ──────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.warn("⚠️  Local MongoDB not available:", error.message);
    console.log("📦 Starting in-memory MongoDB (data resets on server restart)...");
  }

  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const memServer = await MongoMemoryServer.create();
    const memUri    = memServer.getUri();
    const conn      = await mongoose.connect(memUri);
    console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Failed to start in-memory MongoDB:", error.message);
    process.exit(1);
  }
};

// ─── Start Server ─────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});