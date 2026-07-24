/**
 * providers/tests/providers.test.ts
 *
 * Self-contained test suite for the Travel Data Provider infrastructure module.
 * Lives INSIDE the providers module so it can access internal components directly.
 *
 * Usage:
 *   npm run test-providers
 *
 * Structure:
 *   Test 1 — CacheProvider unit tests (no API keys)
 *   Test 2 — Activity Normalizer unit tests (no API keys)
 *   Test 3 — Flight Normalizer unit tests (no API keys)
 *   Test 4 — TravelDataProvider facade — feature-flag + graceful fallback
 *   Test 5 — OpenTripMap live API test (skipped if key not configured)
 *   Test 6 — Amadeus live API test (skipped if key not configured)
 *   Test 7 — TravelDataProvider cache-hit test (skipped if key not configured)
 *
 * Tests marked [SKIP] when the corresponding env key is not present.
 * No external test-runner dependencies — pure console output.
 */

import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root before importing any provider.
// (providers/lib/env.ts reads process.env lazily, so this must run first.)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// ── Dynamic imports AFTER dotenv.config() ─────────────────────────────────────
// Internal imports are allowed here because this file LIVES inside providers/.
// All imports stay strictly within the module boundary.

// Infrastructure internals (needed for isolated unit testing)
const { CacheProvider } = await import("../cache/cache.provider.js");
const { OpenTripMapProvider } = await import("../opentripmap/opentripmap.provider.js");
const { AmadeusProvider } = await import("../amadeus/amadeus.provider.js");
const { normalizeOTMListFeature, normalizeOTMDetailFeature } =
  await import("../normalizers/activity.normalizer.js");
const { normalizeAmadeusOffer, normalizeAmadeusResponse } =
  await import("../normalizers/flight.normalizer.js");

// Public API (as any external consumer would import)
const { travelDataProvider } = await import("../index.js");

// ── Test helpers ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let skipped = 0;

function pass(label: string) {
  console.log(`  ✅ PASS  ${label}`);
  passed++;
}

function fail(label: string, detail?: unknown) {
  console.error(`  ❌ FAIL  ${label}`, detail ?? "");
  failed++;
}

function skip(label: string, reason: string) {
  console.log(`  ⏭  SKIP  ${label}  (${reason})`);
  skipped++;
}

function section(title: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(60));
}

function assert(condition: boolean, label: string, detail?: unknown) {
  if (condition) pass(label);
  else fail(label, detail);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 1 — CacheProvider unit tests
// ═══════════════════════════════════════════════════════════════════════════════

section("1. CacheProvider — unit tests");

const cache = new CacheProvider(500); // 500 ms TTL for fast testing

cache.set("k1", [1, 2, 3]);
assert(cache.has("k1"), "has() returns true after set()");
assert(
  JSON.stringify(cache.get("k1")) === JSON.stringify([1, 2, 3]),
  "get() returns the stored value",
);

cache.delete("k1");
assert(!cache.has("k1"), "has() returns false after delete()");

cache.set("k2", "hello");
assert(cache.size === 1, "size() reflects live entry count");

// TTL expiry test
await new Promise((r) => setTimeout(r, 600));
assert(cache.get("k2") === undefined, "get() returns undefined after TTL expiry");
assert(cache.size === 0, "size() returns 0 after all entries expire");

// Key builders
const actKey = CacheProvider.activitiesKey("Goa", ["food", "nature"]);
assert(actKey === "activities:goa:food,nature", `activitiesKey canonical form "${actKey}"`);

const flightKey = CacheProvider.flightsKey("Bangalore", "Goa", "2025-02-01", 2);
assert(
  flightKey === "flights:bangalore:goa:2025-02-01:2pax",
  `flightsKey canonical form "${flightKey}"`,
);

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 2 — Activity Normalizer (static, no API)
// ═══════════════════════════════════════════════════════════════════════════════

section("2. Activity Normalizer — unit tests (static data)");

const rawList = {
  xid: "W12345",
  name: "Fort Aguada",
  rate: 2,
  kinds: "historic,monuments",
  point: { lat: 15.5009, lon: 73.7732 },
};

const normalized = normalizeOTMListFeature(rawList, "Goa");
assert(normalized.id === "otm_W12345", "id is prefixed with 'otm_'");
assert(normalized.name === "Fort Aguada", "name preserved");
assert(normalized.city === "Goa", "city preserved");
assert(normalized.category === "heritage", `category derived as "${normalized.category}"`);
assert(normalized.price === 100, `price derived as ₹${normalized.price} for heritage`);
assert(normalized.rating === 3.8, `rating converted from OTM rate 2 → ${normalized.rating}`);
assert(normalized.isLocal === true, "isLocal is true for OTM data");
assert(normalized.source === "opentripmap", "source is 'opentripmap'");
assert(normalized.coordinates?.lat === 15.5009, "coordinates.lat extracted");

const rawDetail = {
  xid: "W99",
  name: "Dudhsagar Falls",
  rate: 3,
  kinds: "natural,waterfalls",
  wikipedia_extracts: { text: "Dudhsagar Falls is a four-tiered waterfall in Goa." },
  preview: { source: "https://example.com/dudhsagar.jpg" },
  opening_hours: "Sunrise–Sunset",
  point: { lat: 15.3139, lon: 74.3137 },
};

const detail = normalizeOTMDetailFeature(rawDetail, "Goa");
assert(detail.description.includes("waterfall"), "description extracted from wikipedia text");
assert(detail.openingHours === "Sunrise–Sunset", "openingHours preserved");
assert(detail.imageUrl === "https://example.com/dudhsagar.jpg", "imageUrl from preview.source");

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 3 — Flight Normalizer (static, no API)
// ═══════════════════════════════════════════════════════════════════════════════

section("3. Flight Normalizer — unit tests (static data)");

const rawOffer = {
  id: "abc123",
  price: { currency: "INR", total: "4500", base: "4000", grandTotal: "4500" },
  itineraries: [
    {
      duration: "PT1H10M",
      segments: [
        {
          departure: { iataCode: "BLR", at: "2025-02-01T06:00:00" },
          arrival: { iataCode: "GOI", at: "2025-02-01T07:10:00" },
          carrierCode: "6E",
          number: "421",
          duration: "PT1H10M",
        },
      ],
    },
  ],
  numberOfBookableSeats: 9,
};

const flight = normalizeAmadeusOffer(rawOffer as any, 0, true, 1);
assert(flight.id === "amadeus_abc123", "id prefixed with 'amadeus_'");
assert(flight.totalPrice === 4500, "totalPrice parsed correctly");
assert(flight.pricePerPerson === 4500, "pricePerPerson = totalPrice / 1 adult");
assert(flight.isCheapest === true, "isCheapest flag set");
assert(flight.outboundSegments.length === 1, "outbound segment extracted");
const seg0 = flight.outboundSegments[0]!;
assert(seg0.airlineName === "IndiGo", "carrier code 6E → IndiGo");
assert(seg0.flightNumber === "6E-421", "flight number formatted");
assert(seg0.departureAirport === "BLR", "departure IATA extracted");
assert(flight.totalOutboundDuration === "PT1H10M", "outbound duration preserved");

const multiOffer = {
  data: [
    { ...rawOffer, price: { ...rawOffer.price, total: "6000", grandTotal: "6000" } },
    { ...rawOffer, id: "xyz", price: { ...rawOffer.price, total: "4500", grandTotal: "4500" } },
  ],
};
const flights = normalizeAmadeusResponse(multiOffer as any, 1);
assert(flights.length === 2, "both offers normalized");
const firstFlight = flights[0]!;
assert(firstFlight.isCheapest === true, "cheapest offer is first after sort");
assert(firstFlight.totalPrice === 4500, "sorted by price ascending");

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 4 — TravelDataProvider facade (no API keys needed)
// ═══════════════════════════════════════════════════════════════════════════════

section("4. TravelDataProvider facade — feature-flag + graceful fallback");

const status = travelDataProvider.status;
console.log(
  `  ℹ  Provider status: OTM=${status.otm}, Amadeus=${status.amadeus}, cache=${status.cacheSize} entries`,
);

const noKeyActivities = await travelDataProvider.getActivities({
  city: "TestCity",
  preferences: ["heritage"],
});
if (!status.otm) {
  assert(
    Array.isArray(noKeyActivities) && noKeyActivities.length === 0,
    "getActivities returns [] when OTM is disabled",
  );
} else {
  pass("getActivities returns a response (OTM key present, API test below)");
}

const noKeyFlights = await travelDataProvider.getFlights({
  origin: "BLR",
  destination: "GOI",
  departureDate: "2025-02-01",
  adults: 1,
});
if (!status.amadeus) {
  assert(
    Array.isArray(noKeyFlights) && noKeyFlights.length === 0,
    "getFlights returns [] when Amadeus is disabled",
  );
} else {
  pass("getFlights returns a response (Amadeus key present, API test below)");
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 5 — OpenTripMap live API (requires OPENTRIPMAP_API_KEY)
// ═══════════════════════════════════════════════════════════════════════════════

section("5. OpenTripMap provider — live API test");

const otmKey = process.env["OPENTRIPMAP_API_KEY"];

if (!otmKey || otmKey.includes("your_")) {
  skip("OTM live fetch", "OPENTRIPMAP_API_KEY not configured");
} else {
  try {
    const otmProvider = new OpenTripMapProvider(otmKey);
    const activities = await otmProvider.getActivities({
      city: "Goa",
      preferences: ["heritage", "nature"],
      limit: 5,
    });

    assert(Array.isArray(activities), "getActivities returns an array");
    assert(activities.length > 0, `returned ${activities.length} activities (> 0)`);

    const first = activities[0]!;
    assert(typeof first.id === "string" && first.id.startsWith("otm_"), "id starts with 'otm_'");
    assert(typeof first.name === "string" && first.name.length > 0, "name is a non-empty string");
    assert(first.source === "opentripmap", "source is 'opentripmap'");
    assert(first.city === "Goa", "city matches request");

    console.log(`\n  ℹ  Sample activity: ${first.name}`);
    console.log(`       category: ${first.category}, price: ₹${first.price}, rating: ${first.rating}`);
    if (first.description) console.log(`       description: ${first.description.slice(0, 80)}…`);
  } catch (e) {
    fail("OTM live test threw an exception", e instanceof Error ? e.message : e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 6 — Amadeus live API (requires AMADEUS_API_KEY + AMADEUS_API_SECRET)
// ═══════════════════════════════════════════════════════════════════════════════

section("6. Amadeus provider — live API test");

const amKey = process.env["AMADEUS_API_KEY"];
const amSecret = process.env["AMADEUS_API_SECRET"];

if (!amKey || amKey.includes("your_") || !amSecret || amSecret.includes("your_")) {
  skip("Amadeus live fetch", "AMADEUS_API_KEY / AMADEUS_API_SECRET not configured");
} else {
  try {
    const amProvider = new AmadeusProvider(
      amKey,
      amSecret,
      process.env["AMADEUS_BASE_URL"] ?? "https://test.api.amadeus.com",
    );

    const flights = await amProvider.getFlights({
      origin: "BLR",
      destination: "GOI",
      departureDate: "2025-08-01",
      adults: 1,
      currency: "INR",
      maxOffers: 3,
    });

    assert(Array.isArray(flights), "getFlights returns an array");

    if (flights.length === 0) {
      console.log("  ℹ  No flights returned — sandbox may have no data for this route/date.");
    } else {
      assert(flights.length > 0, `returned ${flights.length} flight offers`);
      const first = flights[0]!;
      assert(first.isCheapest === true, "first offer is cheapest");
      assert(first.source === "amadeus", "source is 'amadeus'");
      assert(first.outboundSegments.length > 0, "at least one outbound segment");

      console.log(`\n  ℹ  Cheapest flight: ₹${first.totalPrice} (${first.currency})`);
      const seg = first.outboundSegments[0]!;
      console.log(`       ${seg.departureAirport} → ${seg.arrivalAirport} on ${seg.airlineName}`);
      console.log(`       Departs: ${seg.departureTime} | Duration: ${first.totalOutboundDuration}`);
    }
  } catch (e) {
    fail("Amadeus live test threw an exception", e instanceof Error ? e.message : e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 7 — TravelDataProvider cache-hit test
// ═══════════════════════════════════════════════════════════════════════════════

section("7. TravelDataProvider — cache-hit test (live only if keys present)");

const otmKeyPresent = otmKey && !otmKey.includes("your_");

if (otmKeyPresent) {
  const r1 = await travelDataProvider.getActivities({ city: "Goa", preferences: ["nature"] });
  const r2 = await travelDataProvider.getActivities({ city: "Goa", preferences: ["nature"] });
  assert(
    JSON.stringify(r1) === JSON.stringify(r2),
    "second call returns identical data (served from cache)",
  );
  assert(travelDataProvider.status.cacheSize > 0, "cache has at least one entry after live fetch");
} else {
  skip("cache-hit live test", "OPENTRIPMAP_API_KEY not configured");
}

// ═══════════════════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════════════════

console.log(`\n${"═".repeat(60)}`);
console.log(`  TEST SUMMARY`);
console.log("═".repeat(60));
console.log(`  ✅ Passed : ${passed}`);
console.log(`  ❌ Failed : ${failed}`);
console.log(`  ⏭  Skipped: ${skipped}`);
console.log("═".repeat(60));

if (failed > 0) process.exit(1);
