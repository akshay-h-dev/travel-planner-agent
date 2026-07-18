/**
 * Request validation middleware factory.
 *
 * Accepts a Zod schema and returns Express middleware that validates
 * the request body against it. On failure, a 400 response is returned
 * with structured validation error details.
 */

import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: {
            message: "Validation failed",
            statusCode: 400,
            details: err.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(err);
    }
  };
}
