/**
 * Global error handler.
 *
 * Catches all unhandled errors that reach Express and returns a
 * consistent JSON response. In production, internal details are
 * never leaked to the client.
 */

import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/** Custom application error with an HTTP status code. */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  logger.error(err.message, {
    statusCode,
    isOperational,
    stack: env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  const response: Record<string, unknown> = {
    error: {
      message: isOperational
        ? err.message
        : "An unexpected error occurred. Please try again later.",
      statusCode,
      ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
}
