import type { NormalizedActivity } from "../providers/index.js";
import type { Transport } from "../types/index.js";

const TRANSPORT_OPTIONS: Array<Omit<Transport, "id" | "city"> & { id: string; city: string }> = [
  {
    id: "transport_auto_rickshaw",
    name: "Auto-rickshaw",
    city: "",
    pricePerDay: 400,
    type: "auto-rickshaw",
    description: "Budget-friendly local ride for short transfers.",
    isLocal: true,
  },
  {
    id: "transport_cab",
    name: "Cab",
    city: "",
    pricePerDay: 1200,
    type: "cab",
    description: "Comfortable private transfer for longer hops.",
    isLocal: true,
  },
  {
    id: "transport_bus",
    name: "Shared Shuttle",
    city: "",
    pricePerDay: 300,
    type: "shared-shuttle",
    description: "Low-cost shared transfer option for city travel.",
    isLocal: true,
  },
  {
    id: "transport_bike",
    name: "Bike Rental",
    city: "",
    pricePerDay: 700,
    type: "bike-rental",
    description: "Flexible self-drive option for explorers.",
    isLocal: true,
  },
];

export function buildDynamicTransportOptions(
  city: string,
  localTransitTypes: string[] = [],
): Transport[] {
  const requested = localTransitTypes
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);

  const preferenceOrder = requested.length > 0 ? requested : ["auto-rickshaw", "cab"];

  const uniqueOptions = new Map<string, Transport>();
  const ranked = [...preferenceOrder];

  for (const preference of ranked) {
    const match = TRANSPORT_OPTIONS.find((option) => option.type === preference);
    if (match) {
      uniqueOptions.set(match.type, {
        ...match,
        city,
        id: `${match.id}_${city.toLowerCase().replace(/\s+/g, "_")}`,
      });
    }
  }

  for (const option of TRANSPORT_OPTIONS) {
    if (!uniqueOptions.has(option.type)) {
      uniqueOptions.set(option.type, {
        ...option,
        city,
        id: `${option.id}_${city.toLowerCase().replace(/\s+/g, "_")}`,
      });
    }
  }

  return Array.from(uniqueOptions.values()).slice(0, 4);
}

export function buildActivityPool(apiActivities: NormalizedActivity[]): NormalizedActivity[] {
  return [...apiActivities]
    .sort((a, b) => {
      if (b.rating !== a.rating) return (b.rating ?? 0) - (a.rating ?? 0);
      return a.price - b.price;
    })
    .slice(0, 20);
}
