/**
 * Structured logger for the application.
 *
 * In production, logs are emitted as JSON for ingestion by log
 * aggregation services (Datadog, CloudWatch, etc.).
 * In development, logs are human-readable with timestamps.
 */

import { env } from "../config/env.js";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function formatLog(entry: LogEntry): string {
  if (env.NODE_ENV === "production") {
    return JSON.stringify(entry);
  }

  const { level, message, timestamp, ...rest } = entry;
  const meta = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
  return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${meta}`;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(formatLog(createLogEntry("info", message, meta)));
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(formatLog(createLogEntry("warn", message, meta)));
  },

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(formatLog(createLogEntry("error", message, meta)));
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    if (env.NODE_ENV !== "production") {
      console.debug(formatLog(createLogEntry("debug", message, meta)));
    }
  },
};
