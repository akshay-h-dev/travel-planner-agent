/**
 * Security middleware stack.
 *
 * Configures:
 *  - Helmet   → HTTP security headers (XSS, clickjacking, MIME sniffing, etc.)
 *  - CORS     → Origin whitelist from env
 *  - Rate-limit → Per-IP request throttling
 */

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Express } from "express";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export function applySecurityMiddleware(app: Express): void {
  // ── Helmet ──────────────────────────────────────────────
  // Sets a variety of HTTP headers to help protect the app.
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === "production",
      crossOriginEmbedderPolicy: false, // Allow SSE connections
    }),
  );

  // ── CORS ────────────────────────────────────────────────
  // Only the origins declared in ALLOWED_ORIGINS may make requests.
  app.use(
    cors({
      origin(origin, callback) {
        // Allow server-to-server (no origin) and whitelisted origins
        if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn("CORS request blocked", { origin });
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // ── Rate Limiting ───────────────────────────────────────
  // Prevents abuse by capping requests per IP within a window.
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please try again later.",
    },
    handler(_req, res, _next, options) {
      logger.warn("Rate limit exceeded", {
        ip: _req.ip,
      });
      res.status(429).json(options.message);
    },
  });

  app.use("/api/", limiter);

  logger.info("Security middleware applied", {
    cors: env.ALLOWED_ORIGINS,
    rateLimitWindow: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: env.RATE_LIMIT_MAX_REQUESTS,
  });
}
