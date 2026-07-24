/**
 * providers/index.ts — Public API barrel for the Infrastructure Module.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  RULE: This is the ONLY file that code outside `providers/` may import. ║
 * ║  Agent nodes, route handlers, and test scripts must import from here,   ║
 * ║  never from internal provider paths (cache/, amadeus/, opentripmap/…).  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * What is exported:
 *   - `travelDataProvider`  — the singleton facade (singleton instance)
 *   - All public types      — NormalizedActivity, NormalizedFlight,
 *                             FlightSegment, ITravelDataProvider,
 *                             GetActivitiesParams, GetFlightsParams
 *
 * What is NOT exported (internal implementation details):
 *   - Individual provider classes (OpenTripMapProvider, AmadeusProvider)
 *   - Cache implementation (CacheProvider, sharedCache)
 *   - Normalizer functions
 *   - Internal lib utilities (providerLogger, providerEnv)
 *   - Interface file path
 *
 * Future extraction:
 *   When this module is extracted into a standalone npm package, only this
 *   file's export surface becomes the package's public API.  Nothing else
 *   needs to change in the agent or route layers.
 */

// ── Singleton instance (the only thing most callers need) ─────────────────────
export { travelDataProvider } from "./travel.provider.js";

// ── Public types ──────────────────────────────────────────────────────────────
export type {
  /** Contract the agent depends on (useful for mocking in tests). */
  ITravelDataProvider,
  /** Normalized tourist activity — returned by getActivities(). */
  NormalizedActivity,
  /** Normalized flight offer — returned by getFlights(). */
  NormalizedFlight,
  /** A single flight leg within a NormalizedFlight. */
  FlightSegment,
  /** Input shape for getActivities(). */
  GetActivitiesParams,
  /** Input shape for getFlights(). */
  GetFlightsParams,
} from "./interfaces/travel-provider.interface.js";
