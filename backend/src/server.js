"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ----------------------------------------------------------------------
// Security & parsing middleware
// ----------------------------------------------------------------------
app.use(helmet());
// CORS — allow configured origin + semua port localhost untuk dev convenience
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server / curl
      if (origin === config.corsOrigin) return callback(null, true);
      // Allow any localhost port di dev mode
      if (config.env !== "production" && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Global rate limit: 60 req/menit per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ----------------------------------------------------------------------
// Health & metadata
// ----------------------------------------------------------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    env: config.env,
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    name: "TravelVerse Pass Backend",
    version: "1.0.0",
    docs: "/health, /api/auth, /api/destinations, /api/checkin, /api/me",
  });
});

// ----------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------
app.use("/api", routes);

// ----------------------------------------------------------------------
// 404 + error handler (must be last)
// ----------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    error: "not_found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

app.use(errorHandler);

// ----------------------------------------------------------------------
// Start
// ----------------------------------------------------------------------
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log("============================================================");
  console.log("  TravelVerse Pass — Backend API");
  console.log("============================================================");
  console.log(`  Env:    ${config.env}`);
  console.log(`  Port:   ${PORT}`);
  console.log(`  CORS:   ${config.corsOrigin}`);
  console.log(`  Listen: http://localhost:${PORT}`);
  console.log("============================================================");
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n[server] ${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log("[server] HTTP server closed");
    process.exit(0);
  });
  // Force exit kalau gak selesai dalam 10s
  setTimeout(() => {
    console.error("[server] Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;
