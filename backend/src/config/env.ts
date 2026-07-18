import { z } from "zod";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root, not from wherever node is invoked
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Validated environment configuration.
 *
 * Every environment variable the application needs is declared here
 * with a Zod schema. If a required variable is missing or malformed,
 * the process will exit immediately with a clear error message instead
 * of failing silently at runtime.
 */
const envSchema = z.object({
  PORT: z
    .string()
    .default("5000")
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  OPENAI_API_KEY: z
    .string()
    .min(1, "OPENAI_API_KEY is required"),

  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000")
    .transform((val) => val.split(",").map((origin) => origin.trim())),

  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default("60000")
    .transform(Number)
    .pipe(z.number().int().positive()),

  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .default("20")
    .transform(Number)
    .pipe(z.number().int().positive()),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "❌ Invalid environment configuration:\n",
      result.error.flatten().fieldErrors,
    );
    process.exit(1);
  }

  return result.data;
}

/** Singleton — parsed and validated once at startup. */
export const env: EnvConfig = loadEnv();
