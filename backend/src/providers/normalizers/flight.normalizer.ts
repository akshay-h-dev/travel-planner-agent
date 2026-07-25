/**
 * Flight Normalizer — AviationStack → NormalizedFlight
 *
 * This module converts the AviationStack flight record shape into the common
 * NormalizedFlight + FlightSegment interfaces.
 *
 * Pricing:
 *   AviationStack free tier does not return fare pricing. We estimate pricing
 *   deterministically using IATA airport pairs and flight numbers.
 */

import type {
  NormalizedFlight,
  FlightSegment,
} from "../interfaces/travel-provider.interface.js";

// ─── Raw AviationStack shapes ────────────────────────────────────────────────

export interface AviationStackFlightRaw {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    scheduled: string;
    actual?: string | null;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    scheduled: string;
    actual?: string | null;
  };
  airline: {
    name: string;
    iata: string;
  };
  flight: {
    number: string;
    iata: string;
  };
}

// ─── Airline name lookup (fallback) ──────────────────────────────────────────

const AIRLINE_NAMES: Record<string, string> = {
  "6E": "IndiGo",
  "SG": "SpiceJet",
  "AI": "Air India",
  "UK": "Vistara",
  "G8": "Go First",
  "IX": "Air India Express",
  "QP": "Akasa Air",
  "EK": "Emirates",
  "QR": "Qatar Airways",
  "SQ": "Singapore Airlines",
  "TG": "Thai Airways",
  "BA": "British Airways",
  "LH": "Lufthansa",
};

function resolveAirlineName(code: string, rawName?: string): string {
  if (rawName) return rawName;
  return AIRLINE_NAMES[code.toUpperCase()] ?? code;
}

/** Compute ISO 8601 duration between two datetime strings */
function computeDurationISO(dep: string, arr: string): string {
  try {
    const depMs = new Date(dep).getTime();
    const arrMs = new Date(arr).getTime();
    if (isNaN(depMs) || isNaN(arrMs)) return "PT2H0M";
    const diffMins = Math.max(0, Math.floor((arrMs - depMs) / 60000));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `PT${hours}H${mins}M`;
  } catch {
    return "PT2H0M";
  }
}

/** Estimate flight price deterministically based on route and flight number */
function estimateFlightPrice(dep: string, arr: string, flightNum: string): number {
  const code = `${dep.toUpperCase()}->${arr.toUpperCase()}`;
  const fares: Record<string, number> = {
    "DEL->GOI": 5500,
    "GOI->DEL": 5500,
    "BLR->GOI": 3500,
    "GOI->BLR": 3500,
    "BOM->GOI": 3000,
    "GOI->BOM": 3000,
    "MAA->GOI": 3800,
    "GOI->MAA": 3800,
    "HYD->GOI": 3200,
    "GOI->HYD": 3200,
  };
  const baseFare = fares[code] ?? 4500;

  // Add deterministic variation (-700 to +700 INR)
  let hash = 0;
  for (let i = 0; i < flightNum.length; i++) {
    hash = flightNum.charCodeAt(i) + ((hash << 5) - hash);
  }
  const variance = (Math.abs(hash) % 15) * 100 - 700;
  return baseFare + variance;
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

export function normalizeAviationStackFlight(
  raw: AviationStackFlightRaw,
  index: number,
  isCheapest: boolean
): NormalizedFlight {
  const dep = raw.departure?.iata ?? "ANY";
  const arr = raw.arrival?.iata ?? "ANY";
  const carrier = raw.airline?.iata ?? "ANY";
  const flightNo = raw.flight?.iata ?? `${carrier}-${raw.flight?.number ?? index}`;
  const depTime = raw.departure?.scheduled ?? raw.flight_date;
  const arrTime = raw.arrival?.scheduled ?? raw.flight_date;

  const duration = computeDurationISO(depTime, arrTime);
  const estimatedPrice = estimateFlightPrice(dep, arr, flightNo);

  const segment: FlightSegment = {
    departureAirport: dep,
    arrivalAirport: arr,
    departureTime: depTime,
    arrivalTime: arrTime,
    duration,
    carrierCode: carrier,
    airlineName: resolveAirlineName(carrier, raw.airline?.name),
    flightNumber: flightNo,
  };

  return {
    id: `avstack_${flightNo}_${raw.flight_date}_${index}`,
    totalPrice: Math.round(estimatedPrice),
    pricePerPerson: Math.round(estimatedPrice),
    currency: "INR",
    availableSeats: 9,
    outboundSegments: [segment],
    returnSegments: [],
    totalOutboundDuration: duration,
    isCheapest,
    source: "aviationstack",
  };
}

export function normalizeAviationStackResponse(
  rawFlights: AviationStackFlightRaw[]
): NormalizedFlight[] {
  if (!Array.isArray(rawFlights) || rawFlights.length === 0) return [];

  // Normalize all flights
  const flights = rawFlights.map((f, idx) =>
    normalizeAviationStackFlight(f, idx, false)
  );

  // Sort by price ascending to determine the cheapest
  const sorted = [...flights].sort((a, b) => a.totalPrice - b.totalPrice);

  if (sorted.length > 0) {
    sorted[0]!.isCheapest = true;
  }

  return sorted;
}
