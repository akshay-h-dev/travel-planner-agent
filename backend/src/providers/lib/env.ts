/**
 * providers/lib/env.ts
 *
 * A self-contained environment accessor for the providers module.
 *
 * WHY a separate env accessor?
 *   The application-level env.ts (src/config/env.ts) uses Zod to validate
 *   every application variable at startup and will call process.exit(1) if
 *   any required variable is missing.  If the providers module imported it,
 *   the module would couple itself to the full application boot sequence and
 *   all of its required env variables — breaking the "independent
 *   infrastructure layer" contract.
 *
 *   This accessor reads only the four variables the providers actually need,
 *   all of which are optional (the provider gracefully disables itself when
 *   a key is absent).  It performs no validation and has no side effects.
 *
 * Usage (within the providers module only):
 *   import { providerEnv } from "../lib/env.js";
 */

export interface ProviderEnv {
  /** Geoapify API key — undefined when not configured. */
  GEOAPIFY_API_KEY: string | undefined;
  /** AviationStack API key — undefined when not configured. */
  AVIATIONSTACK_API_KEY: string | undefined;
  /** AviationStack API base URL. */
  AVIATIONSTACK_BASE_URL: string;
}

/**
 * Lazily-evaluated singleton.
 * Reading process.env is deferred to first access so the module can be
 * imported in test environments before env variables are set.
 */
function loadProviderEnv(): ProviderEnv {
  // Helper: return undefined when the value is empty or a placeholder
  function optional(key: string): string | undefined {
    const v = process.env[key];
    if (!v || v.trim() === "" || v.startsWith("your_")) return undefined;
    return v.trim();
  }

  return {
    GEOAPIFY_API_KEY: optional("GEOAPIFY_API_KEY"),
    AVIATIONSTACK_API_KEY: optional("AVIATIONSTACK_API_KEY"),
    AVIATIONSTACK_BASE_URL:
      process.env["AVIATIONSTACK_BASE_URL"]?.trim() ||
      "http://api.aviationstack.com/v1",
  };
}

/** Module-level singleton — loaded once on first import. */
export const providerEnv: ProviderEnv = loadProviderEnv();
