/**
 * TripWay — Backend Entry Point
 *
 * Bootstraps the Express application with:
 *  - Validated environment configuration
 *  - Security middleware (Helmet, CORS, rate limiting)
 *  - JSON body parsing with size limits
 *  - API routes
 *  - Global error handling
 *  - Graceful shutdown on SIGTERM / SIGINT
 */

import express from "express";
import { env } from "./config/env.js";
import { applySecurityMiddleware } from "./middleware/security.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { plannerRouter } from "./routes/planner.js";
import { logger } from "./utils/logger.js";

const app = express();

// ── Security ────────────────────────────────────────────────
applySecurityMiddleware(app);

// ── Body parsing ────────────────────────────────────────────
// Limit payload size to prevent large-payload DoS attacks
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// ── Request logging ─────────────────────────────────────────
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// ── Routes ──────────────────────────────────────────────────
app.use("/api", healthRouter);
app.use("/api", plannerRouter);

// ── 404 handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      statusCode: 404,
    },
  });
});

// ── Global error handler ────────────────────────────────────
app.use(globalErrorHandler);

// ── Server start ────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 TripWay backend running`, {
    port: env.PORT,
    env: env.NODE_ENV,
    url: `http://localhost:${env.PORT}`,
  });
  logger.info(`📋 Health check: http://localhost:${env.PORT}/api/health`);
});

// ── Graceful shutdown ───────────────────────────────────────
// On SIGTERM (container orchestrator) or SIGINT (Ctrl+C),
// stop accepting new connections and drain existing ones.
function gracefulShutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info("Server closed. Exiting process.");
    process.exit(0);
  });

  // Force exit after 10 seconds if connections refuse to drain
  setTimeout(() => {
    logger.error("Forced shutdown — connections did not drain in time");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Catch unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception — exiting", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

export { app };
