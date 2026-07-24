/**
 * providers/lib/logger.ts
 *
 * A self-contained, zero-dependency structured logger for the providers module.
 *
 * WHY a separate logger?
 *   The application-level logger at src/utils/logger.ts imports env.ts, which
 *   in turn calls dotenv.config() and validates every env variable.  If the
 *   providers module imported that logger it would take a hard dependency on
 *   the full app environment config — breaking the "independent infrastructure
 *   layer" contract.
 *
 *   This logger reads only NODE_ENV directly from process.env with a safe
 *   fallback, so no app-layer import is needed.  The output format is
 *   identical to the app logger so log lines are indistinguishable in practice.
 *
 * Usage (within the providers module only):
 *   import { providerLogger as logger } from "../lib/logger.js";
 */

const isDev = (process.env["NODE_ENV"] ?? "development") !== "production";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function format(entry: LogEntry): string {
  if (!isDev) return JSON.stringify(entry);
  const { level, message, timestamp, ...rest } = entry;
  const meta = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
  return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${meta}`;
}

function entry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): LogEntry {
  return { level, message, timestamp: new Date().toISOString(), ...meta };
}

export const providerLogger = {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(format(entry("info", message, meta)));
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(format(entry("warn", message, meta)));
  },
  error(message: string, meta?: Record<string, unknown>): void {
    console.error(format(entry("error", message, meta)));
  },
  debug(message: string, meta?: Record<string, unknown>): void {
    if (isDev) console.debug(format(entry("debug", message, meta)));
  },
};
