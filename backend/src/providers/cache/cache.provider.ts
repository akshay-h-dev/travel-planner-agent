/**
 * In-memory TTL cache for Travel Data Provider responses.
 *
 * Caches are keyed by a string (e.g. "activities:Goa:nature,heritage") and
 * expire after a configurable TTL.  This prevents redundant API calls when
 * the same destination is planned across multiple days or when a replan is
 * triggered.
 *
 * Design decisions:
 *  - Pure in-process Map — no Redis dependency for the MVP.
 *  - Entries are evicted lazily (checked on read) to keep the implementation
 *    simple with no background timers.
 *  - The cache is a class so multiple isolated instances can coexist in tests.
 */

import { providerLogger as logger } from "../lib/logger.js";

interface CacheEntry<T> {
  value: T;
  /** Absolute expiry as Unix ms timestamp. */
  expiresAt: number;
}

export class CacheProvider {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  /**
   * @param ttlMs  Time-to-live for every entry in milliseconds.
   *               Default: 30 minutes — long enough to cover a full planning
   *               session, short enough to get fresh data on the next run.
   */
  constructor(private readonly ttlMs: number = 30 * 60 * 1_000) {}

  // ── Public API ────────────────────────────────────────────────────────────

  /** Store a value under the given key. */
  set<T>(key: string, value: T): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
    logger.debug(`[Cache] SET  "${key}" (expires in ${this.ttlMs / 1_000}s)`);
  }

  /**
   * Retrieve a value by key.
   * Returns `undefined` when the key is absent or the entry has expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      logger.debug(`[Cache] MISS (expired) "${key}"`);
      return undefined;
    }

    logger.debug(`[Cache] HIT  "${key}"`);
    return entry.value;
  }

  /** Return true when the key exists and has not yet expired. */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /** Remove a single entry. */
  delete(key: string): void {
    this.store.delete(key);
  }

  /** Remove all entries. Useful between test runs. */
  clear(): void {
    this.store.clear();
    logger.debug("[Cache] Cleared all entries");
  }

  /** Number of non-expired entries currently stored. */
  get size(): number {
    let count = 0;
    const now = Date.now();
    for (const entry of this.store.values()) {
      if (entry.expiresAt > now) count++;
    }
    return count;
  }

  // ── Key Builders ──────────────────────────────────────────────────────────
  // Centralise key construction so callers never hand-roll strings.

  static activitiesKey(city: string, preferences: string[] = []): string {
    const prefs = [...preferences].sort().join(",");
    return `activities:${city.toLowerCase()}:${prefs}`;
  }

  static flightsKey(
    origin: string,
    destination: string,
    departureDate: string,
    adults: number,
  ): string {
    return `flights:${origin.toLowerCase()}:${destination.toLowerCase()}:${departureDate}:${adults}pax`;
  }
}

/** Module-level singleton shared across all providers in one process. */
export const sharedCache = new CacheProvider();
