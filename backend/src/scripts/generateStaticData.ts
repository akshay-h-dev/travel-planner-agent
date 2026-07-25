import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuidv4 } from "uuid";
import type { City, Activity, Homestay, Transport, Guide } from "../types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");

// All Indian States and UTs with a major capital/city
const INDIAN_LOCATIONS = [
  { state: "Andhra Pradesh", city: "Amaravati" },
  { state: "Arunachal Pradesh", city: "Itanagar" },
  { state: "Assam", city: "Dispur" },
  { state: "Bihar", city: "Patna" },
  { state: "Chhattisgarh", city: "Raipur" },
  { state: "Goa", city: "Panaji" },
  { state: "Gujarat", city: "Gandhinagar" },
  { state: "Haryana", city: "Chandigarh" },
  { state: "Himachal Pradesh", city: "Shimla" },
  { state: "Jharkhand", city: "Ranchi" },
  { state: "Karnataka", city: "Bengaluru" },
  { state: "Kerala", city: "Thiruvananthapuram" },
  { state: "Madhya Pradesh", city: "Bhopal" },
  { state: "Maharashtra", city: "Mumbai" },
  { state: "Manipur", city: "Imphal" },
  { state: "Meghalaya", city: "Shillong" },
  { state: "Mizoram", city: "Aizawl" },
  { state: "Nagaland", city: "Kohima" },
  { state: "Odisha", city: "Bhubaneswar" },
  { state: "Punjab", city: "Chandigarh" },
  { state: "Rajasthan", city: "Jaipur" },
  { state: "Sikkim", city: "Gangtok" },
  { state: "Tamil Nadu", city: "Chennai" },
  { state: "Telangana", city: "Hyderabad" },
  { state: "Tripura", city: "Agartala" },
  { state: "Uttar Pradesh", city: "Lucknow" },
  { state: "Uttarakhand", city: "Dehradun" },
  { state: "West Bengal", city: "Kolkata" },
  { state: "Andaman and Nicobar Islands", city: "Port Blair" },
  { state: "Chandigarh", city: "Chandigarh" },
  { state: "Dadra and Nagar Haveli and Daman and Diu", city: "Daman" },
  { state: "Delhi", city: "New Delhi" },
  { state: "Jammu and Kashmir", city: "Srinagar" },
  { state: "Ladakh", city: "Leh" },
  { state: "Lakshadweep", city: "Kavaratti" },
  { state: "Puducherry", city: "Pondicherry" }
];

const ACTIVITY_TEMPLATES = [
  { name: "{City} Heritage Walk", category: "Culture", price: 300, duration: "2 hours", description: "Guided walk through the historical parts of {City}." },
  { name: "Traditional {City} Cooking Class", category: "Food", price: 500, duration: "3 hours", description: "Learn to cook local regional delicacies with a home chef." },
  { name: "{City} Food Tour", category: "Food", price: 400, duration: "2.5 hours", description: "Taste the best street food and hidden gems in {City}." },
  { name: "{City} Museum Visit", category: "Culture", price: 150, duration: "2 hours", description: "Explore the local history and artifacts of {state}." },
  { name: "Sunset Viewpoint Trek in {City}", category: "Nature", price: 200, duration: "3 hours", description: "A scenic hike to the best sunset spot overlooking {City}." },
  { name: "{City} Cycle Tour", category: "Adventure", price: 350, duration: "2 hours", description: "Explore the quiet morning streets of {City} on a bicycle." },
  { name: "Local Market Exploration", category: "Culture", price: 100, duration: "2 hours", description: "Wander through the bustling traditional markets of {City}." },
  { name: "{City} Art Gallery Tour", category: "Culture", price: 250, duration: "2 hours", description: "Discover local artists and contemporary regional art." },
  { name: "Botanical Garden Walk", category: "Nature", price: 100, duration: "1.5 hours", description: "Relaxing walk through the lush flora native to {state}." },
  { name: "Evening Cultural Show", category: "Entertainment", price: 600, duration: "2 hours", description: "Witness traditional dance and music performances from {state}." },
  { name: "{City} Photography Tour", category: "Sightseeing", price: 450, duration: "3 hours", description: "Capture the vibrant essence of {City} with a local photographer." },
  { name: "Historical Monument Tour", category: "Sightseeing", price: 200, duration: "2.5 hours", description: "Visit the iconic architectural landmarks of {City}." },
  { name: "River/Lake Boating", category: "Nature", price: 300, duration: "1 hour", description: "Enjoy a peaceful boat ride in {City}'s main water body." },
  { name: "{City} Spiritual Trail", category: "Culture", price: 250, duration: "3 hours", description: "Visit ancient temples and spiritual centers in {City}." },
  { name: "Wildlife Sanctuary Safari", category: "Wildlife", price: 800, duration: "4 hours", description: "Jeep safari to spot local wildlife native to {state}." },
  { name: "Local Crafts Workshop", category: "Culture", price: 400, duration: "2 hours", description: "Learn traditional {state} handicrafts from a master artisan." },
  { name: "{City} Night Walk", category: "Sightseeing", price: 200, duration: "2 hours", description: "Experience the lively nightlife and illuminated streets of {City}." },
  { name: "Farm Visit & Lunch", category: "Nature", price: 550, duration: "4 hours", description: "Visit a local organic farm and enjoy a farm-to-table lunch." },
  { name: "Adventure Park Pass", category: "Adventure", price: 1000, duration: "5 hours", description: "Enjoy thrilling rides and adventure sports near {City}." },
  { name: "Tea/Coffee Tasting", category: "Food", price: 350, duration: "1.5 hours", description: "Sample premium local brews and learn about the roasting process." },
  { name: "Sunrise Yoga Session", category: "Wellness", price: 250, duration: "1.5 hours", description: "Start your day with rejuvenating yoga in a peaceful park in {City}." },
  { name: "Pottery Making Class", category: "Culture", price: 300, duration: "2 hours", description: "Get your hands dirty and learn basic pottery techniques." }
];

const HOMESTAY_TEMPLATES = [
  { name: "{City} Heritage Stay", category: "mid-range" as const, price: 2500, description: "Experience traditional {state} hospitality in this beautifully restored heritage home." },
  { name: "Budget Backpacker Hostel {City}", category: "budget" as const, price: 800, description: "Clean, affordable, and social accommodation in the heart of {City}." },
  { name: "Luxury Villa {City}", category: "premium" as const, price: 6500, description: "Premium villa with private pool and chef, perfect for a relaxing {City} getaway." },
  { name: "Cozy {City} Homestay", category: "budget" as const, price: 1200, description: "A quiet family-run homestay offering authentic local meals." }
];

function readJson<T>(filename: string): T[] {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeJson(filename: string, data: any) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

export function generateData() {
  console.log("🚀 Starting data generation script...");
  
  const existingCities = readJson<City>("cities.json");
  const existingActivities = readJson<Activity>("activities.json");
  const existingHomestays = readJson<Homestay>("homestays.json");
  const existingTransport = readJson<Transport>("transport.json");
  const existingGuides = readJson<Guide>("guides.json");

  let addedCitiesCount = 0;
  let addedActivitiesCount = 0;
  let addedHomestaysCount = 0;
  let addedTransportCount = 0;
  let addedGuidesCount = 0;

  for (const loc of INDIAN_LOCATIONS) {
    // 1. CITIES
    let cityRecord = existingCities.find(c => c.name.toLowerCase() === loc.city.toLowerCase());
    if (!cityRecord) {
      cityRecord = {
        id: `city_${loc.city.toLowerCase().replace(/\s+/g, '_')}`,
        name: loc.city,
        state: loc.state,
        description: `Capital city of ${loc.state}, known for its rich culture, history, and vibrant local life.`,
        highlights: [`${loc.city} City Center`, "Local Markets", "Historical Monuments", "Regional Cuisine"]
      };
      existingCities.push(cityRecord);
      addedCitiesCount++;
    }

    // 2. ACTIVITIES (ensure 22 per city)
    const cityActivities = existingActivities.filter(a => a.city.toLowerCase() === loc.city.toLowerCase());
    if (cityActivities.length < 20) {
      for (const tpl of ACTIVITY_TEMPLATES) {
        // Check if we already added a similar template for this city
        const name = tpl.name.replace(/{City}/g, loc.city).replace(/{state}/g, loc.state);
        if (!existingActivities.some(a => a.name === name && a.city === loc.city)) {
          existingActivities.push({
            id: `act_${uuidv4().substring(0, 8)}`,
            name,
            city: loc.city,
            price: tpl.price,
            duration: tpl.duration,
            rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)), // random 4.0 - 5.0
            category: tpl.category,
            description: tpl.description.replace(/{City}/g, loc.city).replace(/{state}/g, loc.state),
            isLocal: Math.random() > 0.2 // 80% chance true
          });
          addedActivitiesCount++;
        }
      }
    }

    // 3. HOMESTAYS (ensure 4 per city)
    const cityStays = existingHomestays.filter(h => h.city.toLowerCase() === loc.city.toLowerCase());
    if (cityStays.length < 3) {
      for (let i = 0; i < HOMESTAY_TEMPLATES.length; i++) {
        const tpl = HOMESTAY_TEMPLATES[i]!;
        const name = tpl.name.replace(/{City}/g, loc.city);
        if (!existingHomestays.some(h => h.name === name && h.city === loc.city)) {
          existingHomestays.push({
            id: `hs_${loc.city.toLowerCase().replace(/\s+/g, '_')}_0${i + 1}`,
            name,
            city: loc.city,
            pricePerNight: tpl.price,
            rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
            description: tpl.description.replace(/{City}/g, loc.city).replace(/{state}/g, loc.state),
            amenities: ["WiFi", "Breakfast", "AC"],
            isLocal: tpl.category !== "premium",
            category: tpl.category
          });
          addedHomestaysCount++;
        }
      }
    }

    // 4. TRANSPORT (ensure 3 per city)
    const cityTransport = existingTransport.filter(t => t.city.toLowerCase() === loc.city.toLowerCase());
    if (cityTransport.length < 3) {
      const types = [
        { name: "Auto-rickshaw", type: "auto-rickshaw" as const, price: 400 },
        { name: "Local Cab", type: "cab" as const, price: 1200 },
        { name: "Scooter Rental", type: "bike-rental" as const, price: 600 }
      ];
      types.forEach((t, i) => {
        if (!existingTransport.some(xt => xt.type === t.type && xt.city === loc.city)) {
          existingTransport.push({
            id: `tr_${loc.city.toLowerCase().replace(/\s+/g, '_')}_0${i + 1}`,
            name: `${loc.city} ${t.name}`,
            city: loc.city,
            pricePerDay: t.price,
            type: t.type,
            description: `Reliable ${t.name.toLowerCase()} for daily travel in ${loc.city}.`,
            isLocal: true
          });
          addedTransportCount++;
        }
      });
    }

    // 5. GUIDES (ensure 2 per city)
    const cityGuides = existingGuides.filter(g => g.city.toLowerCase() === loc.city.toLowerCase());
    if (cityGuides.length < 2) {
      const guides = [
        { name: `Raju (${loc.city})`, price: 800, lang: ["English", "Hindi", "Local"] },
        { name: `Anita (${loc.city})`, price: 1000, lang: ["English", "Hindi"] }
      ];
      guides.forEach((g, i) => {
        if (!existingGuides.some(xg => xg.name === g.name && xg.city === loc.city)) {
          existingGuides.push({
            id: `gu_${loc.city.toLowerCase().replace(/\s+/g, '_')}_0${i + 1}`,
            name: g.name,
            city: loc.city,
            pricePerDay: g.price,
            rating: parseFloat((Math.random() * (5 - 4.5) + 4.5).toFixed(1)),
            specialties: ["History", "Food", "Culture"],
            languages: g.lang,
            isLocal: true
          });
          addedGuidesCount++;
        }
      });
    }
  }

  writeJson("cities.json", existingCities);
  writeJson("activities.json", existingActivities);
  writeJson("homestays.json", existingHomestays);
  writeJson("transport.json", existingTransport);
  writeJson("guides.json", existingGuides);

  console.log(`✅ Data Generation Complete!`);
  console.log(`Added: ${addedCitiesCount} cities, ${addedActivitiesCount} activities, ${addedHomestaysCount} stays, ${addedTransportCount} transports, ${addedGuidesCount} guides.`);
}
