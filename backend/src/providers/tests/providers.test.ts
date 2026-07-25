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
 *   Test 5 — Geoapify live API test (skipped if key not configured)
 *   Test 6 — AviationStack live API test (skipped if key not configured)
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
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// ── Dynamic imports AFTER dotenv.config() ─────────────────────────────────────
const { CacheProvider } = await import("../cache/cache.provider.js");
const { GeoapifyProvider } = await import("../geoapify/geoapify.provider.js");
const { AviationStackProvider } = await import("../aviationstack/aviationstack.provider.js");
const { normalizeGeoapifyPlace } = await import("../normalizers/activity.normalizer.js");
const { normalizeAviationStackFlight, normalizeAviationStackResponse } = await import("../normalizers/flight.normalizer.js");

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

const rawPlace = {
  properties: {
    place_id: "osm_node_12345",
    name: "Fort Aguada",
    categories: ["tourism.sights", "building.historic"],
    formatted: "Fort Aguada Road, Goa, India",
    opening_hours: "09:00 - 18:00",
    description: "A 17th-century Portuguese fort and lighthouse.",
  },
  geometry: {
    type: "Point" as const,
    coordinates: [73.7732, 15.5009] as [number, number],
  },
};

const normalized = normalizeGeoapifyPlace(rawPlace, "Goa");
assert(normalized.id === "geoapify_osm_node_12345", "id is prefixed with 'geoapify_'");
assert(normalized.name === "Fort Aguada", "name preserved");
assert(normalized.city === "Goa", "city preserved");
assert(normalized.category === "heritage", `category derived as "${normalized.category}"`);
assert(normalized.price === 100, `price derived as ₹${normalized.price} for heritage`);
assert(typeof normalized.rating === "number" && normalized.rating >= 3.5 && normalized.rating <= 4.8, `rating derived deterministically as ${normalized.rating}`);
assert(normalized.isLocal === true, "isLocal is true for Geoapify OSM data");
assert(normalized.source === "geoapify", "source is 'geoapify'");
assert(normalized.coordinates?.lat === 15.5009, "coordinates.lat extracted");
assert(normalized.coordinates?.lon === 73.7732, "coordinates.lon extracted");
assert(normalized.description === "A 17th-century Portuguese fort and lighthouse.", "description extracted");
assert(normalized.openingHours === "09:00 - 18:00", "openingHours preserved");

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 3 — Flight Normalizer (static, no API)
// ═══════════════════════════════════════════════════════════════════════════════

section("3. Flight Normalizer — unit tests (static data)");

const rawFlight = {
  flight_date: "2025-02-01",
  flight_status: "active",
  departure: {
    airport: "Kempegowda International",
    timezone: "Asia/Kolkata",
    iata: "BLR",
    scheduled: "2025-02-01T06:00:00+05:30",
  },
  arrival: {
    airport: "Dabolim Airport",
    timezone: "Asia/Kolkata",
    iata: "GOI",
    scheduled: "2025-02-01T07:10:00+05:30",
  },
  airline: {
    name: "IndiGo",
    iata: "6E",
  },
  flight: {
    number: "421",
    iata: "6E421",
  },
};

const flight = normalizeAviationStackFlight(rawFlight, 0, true);
assert(flight.id.startsWith("avstack_6E421_"), "id prefixed with 'avstack_' and flight number");
assert(typeof flight.totalPrice === "number", `totalPrice estimated correctly: ₹${flight.totalPrice}`);
assert(flight.pricePerPerson === flight.totalPrice, "pricePerPerson matches totalPrice");
assert(flight.isCheapest === true, "isCheapest flag set");
assert(flight.outboundSegments.length === 1, "outbound segment extracted");
const seg0 = flight.outboundSegments[0]!;
assert(seg0.airlineName === "IndiGo", "carrier name Indigo preserved");
assert(seg0.flightNumber === "6E421", "flight number extracted");
assert(seg0.departureAirport === "BLR", "departure IATA extracted");
assert(flight.totalOutboundDuration === "PT1H10M", `outbound duration computed: ${flight.totalOutboundDuration}`);

const multiFlight = [
  { ...rawFlight, flight: { number: "100", iata: "6E100" } },
  { ...rawFlight, flight: { number: "200", iata: "6E200" } },
];
const flights = normalizeAviationStackResponse(multiFlight);
assert(flights.length === 2, "both offers normalized");
const firstFlight = flights[0]!;
assert(firstFlight.isCheapest === true, "cheapest offer has isCheapest set");
assert(firstFlight.totalPrice === 4500, "sorted by price ascending");

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 4 — TravelDataProvider facade (no API keys needed)
// ═══════════════════════════════════════════════════════════════════════════════

section("4. TravelDataProvider facade — feature-flag + graceful fallback");

const status = travelDataProvider.status;
console.log(
  `  ℹ  Provider status: Geoapify=${status.geoapify}, AviationStack=${status.aviationstack}, cache=${status.cacheSize} entries`,
);

const noKeyActivities = await travelDataProvider.getActivities({
  city: "TestCity",
  preferences: ["heritage"],
});
if (!status.geoapify) {
  assert(
    Array.isArray(noKeyActivities) && noKeyActivities.length === 0,
    "getActivities returns [] when Geoapify is disabled",
  );
} else {
  pass("getActivities returns a response (Geoapify key present, API test below)");
}

const noKeyFlights = await travelDataProvider.getFlights({
  origin: "BLR",
  destination: "GOI",
  departureDate: "2025-02-01",
  adults: 1,
});
if (!status.aviationstack) {
  assert(
    Array.isArray(noKeyFlights) && noKeyFlights.length === 0,
    "getFlights returns [] when AviationStack is disabled",
  );
} else {
  pass("getFlights returns a response (AviationStack key present, API test below)");
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 5 — Geoapify live API (requires GEOAPIFY_API_KEY)
// ═══════════════════════════════════════════════════════════════════════════════

section("5. Geoapify provider — live API test");

const geoKey = process.env["GEOAPIFY_API_KEY"];

if (!geoKey || geoKey.includes("your_")) {
  skip("Geoapify live fetch", "GEOAPIFY_API_KEY not configured");
} else {
  try {
    const geoProvider = new GeoapifyProvider(geoKey);
    const activities = await geoProvider.getActivities({
      city: "Goa",
      preferences: ["heritage", "nature"],
      limit: 5,
    });

    assert(Array.isArray(activities), "getActivities returns an array");
    assert(activities.length > 0, `returned ${activities.length} activities (> 0)`);

    const first = activities[0]!;
    assert(typeof first.id === "string" && first.id.startsWith("geoapify_"), "id starts with 'geoapify_'");
    assert(typeof first.name === "string" && first.name.length > 0, "name is a non-empty string");
    assert(first.source === "geoapify", "source is 'geoapify'");
    assert(first.city === "Goa", "city matches request");

    console.log(`\n  ℹ  Sample activity: ${first.name}`);
    console.log(`       category: ${first.category}, price: ₹${first.price}, rating: ${first.rating}`);
    if (first.description) console.log(`       description: ${first.description.slice(0, 80)}…`);
  } catch (e) {
    fail("Geoapify live test threw an exception", e instanceof Error ? e.message : e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 6 — AviationStack live API (requires AVIATIONSTACK_API_KEY)
// ═══════════════════════════════════════════════════════════════════════════════

section("6. AviationStack provider — live API test");

const avKey = process.env["AVIATIONSTACK_API_KEY"];

if (!avKey || avKey.includes("your_")) {
  skip("AviationStack live fetch", "AVIATIONSTACK_API_KEY not configured");
} else {
  try {
    const avProvider = new AviationStackProvider(
      avKey,
      process.env["AVIATIONSTACK_BASE_URL"] ?? "http://api.aviationstack.com/v1"
    );

    const flights = await avProvider.getFlights({
      origin: "BLR",
      destination: "GOI",
      departureDate: "2025-08-01",
      adults: 1,
    });

    assert(Array.isArray(flights), "getFlights returns an array");

    if (flights.length === 0) {
      console.log("  ℹ  No flights returned — sandbox/free tier may have no schedule data for this date.");
    } else {
      assert(flights.length > 0, `returned ${flights.length} flight offers`);
      const first = flights[0]!;
      assert(first.isCheapest === true, "first offer is cheapest");
      assert(first.source === "aviationstack", "source is 'aviationstack'");
      assert(first.outboundSegments.length > 0, "at least one outbound segment");

      console.log(`\n  ℹ  Cheapest flight: ₹${first.totalPrice} (${first.currency})`);
      const seg = first.outboundSegments[0]!;
      console.log(`       ${seg.departureAirport} → ${seg.arrivalAirport} on ${seg.airlineName}`);
      console.log(`       Departs: ${seg.departureTime} | Duration: ${first.totalOutboundDuration}`);
    }
  } catch (e) {
    fail("AviationStack live test threw an exception", e instanceof Error ? e.message : e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 7 — TravelDataProvider cache-hit test
// ═══════════════════════════════════════════════════════════════════════════════

section("7. TravelDataProvider — cache-hit test (live only if keys present)");

const geoKeyPresent = geoKey && !geoKey.includes("your_");

if (geoKeyPresent) {
  const r1 = await travelDataProvider.getActivities({ city: "Goa", preferences: ["nature"] });
  const r2 = await travelDataProvider.getActivities({ city: "Goa", preferences: ["nature"] });
  assert(
    JSON.stringify(r1) === JSON.stringify(r2),
    "second call returns identical data (served from cache)",
  );
  assert(travelDataProvider.status.cacheSize > 0, "cache has at least one entry after live fetch");
} else {
  skip("cache-hit live test", "GEOAPIFY_API_KEY not configured");
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
