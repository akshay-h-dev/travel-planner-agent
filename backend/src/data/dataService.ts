import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define TypeScript interfaces for raw data
export interface Stay {
  id: string;
  name: string;
  type: "local" | "chain";
  costPerNight: number;
  description: string;
}

export interface Guide {
  id: string;
  name: string;
  type: "local" | "chain";
  costPerDay: number;
  description: string;
}

export interface Transport {
  id: string;
  name: string;
  type: "local" | "chain";
  costPerDay: number;
  description: string;
}

export interface Activity {
  id: string;
  name: string;
  type: "local" | "chain";
  cost: number;
  durationHours: number;
  category: string;
  description: string;
}

export interface Destination {
  city: string;
  stays: Stay[];
  guides: Guide[];
  transport: Transport[];
  activities: Activity[];
}

interface MockDatabase {
  destinations: Destination[];
}

let dbCache: MockDatabase | null = null;

function getDb(): MockDatabase {
  if (dbCache) {
    return dbCache;
  }

  try {
    // Standard ESM or CommonJS path resolution
    const dbPath = path.join(__dirname, "mockDb.json");
    const rawData = fs.readFileSync(dbPath, "utf-8");
    dbCache = JSON.parse(rawData) as MockDatabase;
    return dbCache;
  } catch (error) {
    console.error("Failed to load mock database:", error);
    return { destinations: [] };
  }
}

export function getDestination(city: string): Destination | undefined {
  const db = getDb();
  // Safe lookup: input comparison against strict list, no injection risk
  return db.destinations.find(
    (d) => d.city.toLowerCase() === city.toLowerCase()
  );
}

export function getStays(city: string): Stay[] {
  const dest = getDestination(city);
  return dest ? dest.stays : [];
}

export function getGuides(city: string): Guide[] {
  const dest = getDestination(city);
  return dest ? dest.guides : [];
}

export function getTransport(city: string): Transport[] {
  const dest = getDestination(city);
  return dest ? dest.transport : [];
}

export function getActivities(city: string): Activity[] {
  const dest = getDestination(city);
  return dest ? dest.activities : [];
}
