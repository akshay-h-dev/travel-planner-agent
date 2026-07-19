import type { City, Homestay, Activity, Transport, Guide, Itinerary, DayPlan } from "../types";

// High-quality Unsplash URLs for beautiful cards
export const MOCK_CITIES: City[] = [
  {
    id: "goa",
    name: "North Goa",
    state: "Goa",
    description: "Pristine beaches, centuries-old Portuguese churches, bustling local markets, and hidden backwater cruises.",
    highlights: ["Fontainhas Latin Quarter", "Arambol Beach", "Anjuna Flea Market", "Spice Plantations"],
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "wayanad",
    name: "Wayanad",
    state: "Kerala",
    description: "Mist-covered hill towns, spice plantations, lush forests, waterfalls, and rich tribal heritage networks.",
    highlights: ["Edakkal Caves", "Banasura Sagar Dam", "Kuruvadweep River Island", "Chembra Peak"],
    imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    description: "Breath-taking snow-capped mountain peaks, trekking adventures, local wooden temples, and bubbling rivers.",
    highlights: ["Solang Valley Adventure", "Hadimba Temple", "Old Manali Cafes", "Jogini Waterfalls"],
    imageUrl: "https://images.unsplash.com/photo-1548252646-e5390bd25988?auto=format&fit=crop&w=800&q=80"
  }
];

export const MOCK_HOMESTAYS: Homestay[] = [
  // Goa
  {
    id: "hs-goa-1",
    name: "Casa Da Flora Portuguese Homestay",
    city: "Goa",
    pricePerNight: 2800,
    rating: 4.9,
    description: "A beautifully restored 150-year-old Indo-Portuguese home run by the D'Souza family. Savor traditional Goan Fish Curry.",
    amenities: ["Free WiFi", "Traditional Kitchen", "Bicycles", "Open Verandah"],
    isLocal: true,
    category: "mid-range",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hs-goa-2",
    name: "Oceanic Sunset Shacks & Cottage",
    city: "Goa",
    pricePerNight: 1200,
    rating: 4.5,
    description: "Eco-friendly bamboo beach shacks run by local fishermen. Steps away from the sand.",
    amenities: ["Beach Front", "Hammocks", "Local Seafood Cafe", "Pet Friendly"],
    isLocal: true,
    category: "budget",
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hs-goa-3",
    name: "The Latitude Villa",
    city: "Goa",
    pricePerNight: 9500,
    rating: 4.8,
    description: "Luxury private boutique villa managed by a local hospitality cooperative, overlooking tropical foliage.",
    amenities: ["Infinity Pool", "Private Chef", "Spacious Lounge", "Smart Home Tech"],
    isLocal: false,
    category: "premium",
    imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"
  },
  // Wayanad
  {
    id: "hs-wayanad-1",
    name: "Valley Vista Treehouse & Farmstay",
    city: "Wayanad",
    pricePerNight: 3500,
    rating: 4.95,
    description: "Eco-treehouse built on a local coffee and pepper farm. Run by Mr. Abraham and family.",
    amenities: ["Organic Meals", "Rainforest Trek", "Spice Garden Tour", "Bonfire Site"],
    isLocal: true,
    category: "mid-range",
    imageUrl: "https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hs-wayanad-2",
    name: "Bamboo Haven Eco Shacks",
    city: "Wayanad",
    pricePerNight: 1500,
    rating: 4.6,
    description: "Minimalist tribal-built bamboo cottages inside a forest clearing. Quiet and scenic.",
    amenities: ["Natural Pool", "Guided Nature Walk", "Solar Power Only", "Clay Cooking"],
    isLocal: true,
    category: "budget",
    imageUrl: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hs-wayanad-3",
    name: "Banasura Spa Resort",
    city: "Wayanad",
    pricePerNight: 8500,
    rating: 4.7,
    description: "Luxury mud-brick resort built on a hill, overlooking water reservoirs. Premium service.",
    amenities: ["Spa Treatments", "Jacuzzi", "Multicuisine Dine", "Panoramic Balcony"],
    isLocal: false,
    category: "premium",
    imageUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80"
  },
  // Manali
  {
    id: "hs-manali-1",
    name: "Snow Peaks Wooden Chalet",
    city: "Manali",
    pricePerNight: 2600,
    rating: 4.85,
    description: "Rustic Alpine-style chalet overlooking apple orchards, hosted by the local Thakur family.",
    amenities: ["Wood Fireplace", "Home Food", "Apple Picking (Seasonal)", "Mountain View Balcony"],
    isLocal: true,
    category: "mid-range",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hs-manali-2",
    name: "Himalayan Backpackers Basecamp",
    city: "Manali",
    pricePerNight: 900,
    rating: 4.4,
    description: "Cozy local stone homestay offering dormitory and private mud rooms. Popular with trekkers.",
    amenities: ["Cafe Room", "Free WiFi", "Gear Rental", "Guitar / Jam Spot"],
    isLocal: true,
    category: "budget",
    imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "hs-manali-3",
    name: "The Royal Solitude Estate",
    city: "Manali",
    pricePerNight: 12000,
    rating: 4.9,
    description: "Ultra-luxury luxury suite complex built alongside roaring forest streams. All amenities.",
    amenities: ["Heated Swimming Pool", "Private Lounge", "Local Wine Tour Included", "Private Driver"],
    isLocal: false,
    category: "premium",
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
  }
];

export const MOCK_GUIDES: Guide[] = [
  // Goa
  {
    id: "gd-goa-1",
    name: "Joaquim D'Souza",
    city: "Goa",
    pricePerDay: 1500,
    rating: 4.95,
    specialties: ["Portuguese History", "Old Goan Churches", "Bird Watching"],
    languages: ["English", "Konkani", "Hindi", "Portuguese"],
    isLocal: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Konkani local who loves sharing the non-commercial secrets and colonial relics of historic Panaji."
  },
  {
    id: "gd-goa-2",
    name: "Sunita Naik",
    city: "Goa",
    pricePerDay: 1200,
    rating: 4.8,
    specialties: ["Spice Plantation Tour", "Local Culinary Demos", "Markets"],
    languages: ["English", "Konkani", "Marathi"],
    isLocal: true,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Culinary chef and farm guide offering private spice tours and cooking masterclasses from her home."
  },
  // Wayanad
  {
    id: "gd-wayanad-1",
    name: "Ravi Kumar (Tribal Elder)",
    city: "Wayanad",
    pricePerDay: 1800,
    rating: 5.0,
    specialties: ["Deep Jungle Trekking", "Medicinal Plants", "Ancient Edakkal Caves"],
    languages: ["Malayalam", "Tamil", "Basic English"],
    isLocal: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Native guide from the Kurichya tribe who has mapped Wayanad forests for over 30 years."
  },
  // Manali
  {
    id: "gd-manali-1",
    name: "Dev Thakur",
    city: "Manali",
    pricePerDay: 2000,
    rating: 4.9,
    specialties: ["High altitude trekking", "Solang paragliding safety", "Snow sports"],
    languages: ["Hindi", "Pahari", "English"],
    isLocal: true,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Professional rescue climber and mountaineer who runs local safety education workshops."
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  // Goa
  {
    id: "act-goa-1",
    name: "Latin Quarter Walking Tour",
    city: "Goa",
    price: 600,
    duration: "3 hours",
    rating: 4.8,
    category: "History",
    description: "Explore the colorful colonial villas of Fontainhas with a resident guide.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "act-goa-2",
    name: "Traditional Goan Fish Curry Cooking Class",
    city: "Goa",
    price: 1500,
    duration: "4 hours",
    rating: 4.9,
    category: "Food",
    description: "Learn spices cooking over traditional clay stoves at a family estate.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "act-goa-3",
    name: "Backwater Mangrove Kayaking",
    city: "Goa",
    price: 1800,
    duration: "2.5 hours",
    rating: 4.7,
    category: "Nature",
    description: "Explore the tranquil mangroves of Chorao Island and spot rare migratory birds.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "act-goa-4",
    name: "Dolphin Yacht Cruise (Commercial)",
    city: "Goa",
    price: 4500,
    duration: "2 hours",
    rating: 3.9,
    category: "Adventure",
    description: "A commercial boat tour with buffet dinner and music from a corporate tour company.",
    isLocal: false,
    imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "act-goa-5",
    name: "Arambol Sunset Drum Circle",
    city: "Goa",
    price: 150,
    duration: "3 hours",
    rating: 4.6,
    category: "Nightlife",
    description: "Listen to spontaneous fire dancers and sit inside local percussion circles on the beach.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80"
  },

  // Wayanad
  {
    id: "act-way-1",
    name: "Cave Trekking at Edakkal Caves",
    city: "Wayanad",
    price: 350,
    duration: "3 hours",
    rating: 4.75,
    category: "History",
    description: "Unravel prehistoric stone age carvings with a local forest officer guide.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "act-way-2",
    name: "Banasura Hill Bamboo Rafting",
    city: "Wayanad",
    price: 900,
    duration: "2 hours",
    rating: 4.8,
    category: "Adventure",
    description: "Sail on traditional hand-crafted bamboo rafts assembled by local communities.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "act-way-3",
    name: "Wild Organic Coffee Harvest & Roast",
    city: "Wayanad",
    price: 750,
    duration: "3 hours",
    rating: 4.9,
    category: "Food",
    description: "Hand-pick organic coffee berries, roast them over firewood, and drink freshly brewed brew.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"
  },

  // Manali
  {
    id: "act-man-1",
    name: "Jogini Waterfall Hiking & Picnic",
    city: "Manali",
    price: 400,
    duration: "4 hours",
    rating: 4.85,
    category: "Nature",
    description: "Hike up the pine forest to the gorgeous falls. Enjoy local Himachali Siddu bread at the top.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "act-man-2",
    name: "Solang Valley Paragliding (Local Coop)",
    city: "Manali",
    price: 2500,
    duration: "1.5 hours",
    rating: 4.95,
    category: "Adventure",
    description: "Fly high with licensed local pilots who distribute revenues directly to the village council.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "act-man-3",
    name: "Old Manali Cafe Hop & Live Music",
    city: "Manali",
    price: 900,
    duration: "4 hours",
    rating: 4.7,
    category: "Nightlife",
    description: "Relax in cafes operated by local mountain musicians playing folk and blues rock.",
    isLocal: true,
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=400&q=80"
  }
];

export const MOCK_TRANSPORTS: Transport[] = [
  {
    id: "tr-goa-1",
    name: "Local Electric Scooters",
    city: "Goa",
    pricePerDay: 400,
    type: "bike-rental",
    description: "Eco-friendly emission-free electric scooters from a local clean-tech startup.",
    isLocal: true,
    provider: "BLive eVehicles"
  },
  {
    id: "tr-goa-2",
    name: "Goa Taxi Union Cab Service",
    city: "Goa",
    pricePerDay: 2200,
    type: "cab",
    description: "Support the local taxi drivers union. Fully licensed local drivers.",
    isLocal: true,
    provider: "Goa Taxi Coop"
  },
  {
    id: "tr-way-1",
    name: "Eco Jeep / Auto Cooperative",
    city: "Wayanad",
    pricePerDay: 1200,
    type: "auto-rickshaw",
    description: "Unpaved road travel in shared or personal 4x4 jeeps run by regional drivers.",
    isLocal: true,
    provider: "Wayanad Drivers Club"
  },
  {
    id: "tr-man-1",
    name: "Himachal Transport AC Bus Pass",
    city: "Manali",
    pricePerDay: 250,
    type: "bus",
    description: "Government-run public buses linking remote villages with town centers.",
    isLocal: false,
    provider: "HRTC"
  }
];

// Rich Sample Trip Weather
export const MOCK_WEATHER = {
  Goa: { temp: 29, status: "Partly Cloudy", icon: "cloud-sun", humidity: 75 },
  Wayanad: { temp: 22, status: "Mist & Showers", icon: "cloud-rain", humidity: 85 },
  Manali: { temp: 16, status: "Clear Alpine Air", icon: "sun", humidity: 45 }
};

/**
 * AI ITINERARY GENERATOR ENGINE (Client-Side Simulation)
 * Generates structured plans using combinations of mock data based on input parameters.
 */
export function generateItinerary(
  cityId: string,
  budget: number,
  days: number,
  travelers: number = 1,
  travelStyle: string = "Adventure",
  interests: string[] = ["Nature"],
  options: {
    prioritizeLocal: boolean;
    keepUnderBudget: boolean;
    ecoFriendly: boolean;
  } = { prioritizeLocal: true, keepUnderBudget: true, ecoFriendly: false }
): Itinerary {
  const normalizedCityId = cityId.toLowerCase();
  
  // 1. Fetch matching data sets
  const city = MOCK_CITIES.find(c => c.id === normalizedCityId) || MOCK_CITIES[0];
  const cityName = city.name;

  // Filter homestays by city
  let stays = MOCK_HOMESTAYS.filter(s => s.city.toLowerCase() === normalizedCityId || s.city.toLowerCase() === "goa"); // fallback
  if (options.prioritizeLocal) {
    stays = stays.sort((a,b) => (b.isLocal ? 1 : 0) - (a.isLocal ? 1 : 0));
  }
  
  // Decide stay based on budget constraints
  let selectedStay = stays[0];
  const dailyBudgetAllowed = budget / days;
  
  if (options.keepUnderBudget) {
    // Pick suitable homestay that leaves room for activities & transport
    const targetStayCost = dailyBudgetAllowed * 0.45; // Allocate 45% for stay
    const cheapStays = stays.filter(s => s.pricePerNight * travelers <= targetStayCost);
    if (cheapStays.length > 0) {
      selectedStay = cheapStays.reduce((prev, curr) => 
        Math.abs(curr.pricePerNight - targetStayCost) < Math.abs(prev.pricePerNight - targetStayCost) ? curr : prev
      );
    } else {
      // Find cheapest
      selectedStay = stays.reduce((prev, curr) => prev.pricePerNight < curr.pricePerNight ? prev : curr);
    }
  }

  // Filter guides by city
  const guides = MOCK_GUIDES.filter(g => g.city.toLowerCase() === normalizedCityId) || [MOCK_GUIDES[0]];
  const selectedGuide = options.prioritizeLocal ? guides.find(g => g.isLocal) || guides[0] : guides[0];

  // Filter activities
  let activities = MOCK_ACTIVITIES.filter(a => a.city.toLowerCase() === normalizedCityId);
  if (interests.length > 0) {
    // Boost matching activities
    activities = activities.sort((a, b) => {
      const aMatch = interests.includes(a.category) ? 1 : 0;
      const bMatch = interests.includes(b.category) ? 1 : 0;
      return bMatch - aMatch;
    });
  }
  if (options.prioritizeLocal) {
    // Sort local activities first
    activities = activities.sort((a, b) => (b.isLocal ? 1 : 0) - (a.isLocal ? 1 : 0));
  }

  // Filter transport
  const transports = MOCK_TRANSPORTS.filter(t => t.city.toLowerCase() === normalizedCityId);
  const selectedTransport = transports.length > 0 ? (options.prioritizeLocal ? transports.find(t => t.isLocal) || transports[0] : transports[0]) : MOCK_TRANSPORTS[0];

  // Build Day plans
  const dayPlans: DayPlan[] = [];
  let currentTotalCost = 0;

  for (let d = 1; d <= days; d++) {
    // Pick 2-3 activities per day
    const startIndex = ((d - 1) * 2) % activities.length;
    const dayActivities = [
      { ...activities[startIndex], timeSlot: "morning" as const },
      { ...activities[(startIndex + 1) % activities.length], timeSlot: "afternoon" as const }
    ];
    
    // Calculate cost
    const stayCost = selectedStay ? selectedStay.pricePerNight : 0;
    const transportCost = selectedTransport ? selectedTransport.pricePerDay : 0;
    const activitiesCost = dayActivities.reduce((acc, act) => acc + act.price, 0) * travelers;
    const guideCost = (d % 2 === 1 && selectedGuide) ? selectedGuide.pricePerDay : 0; // Guide every alternate day
    
    const dailyCost = stayCost + transportCost + activitiesCost + guideCost;

    dayPlans.push({
      day: d,
      stay: selectedStay,
      activities: dayActivities,
      transport: selectedTransport,
      guide: d % 2 === 1 ? selectedGuide : null,
      dailyCost
    });

    currentTotalCost += dailyCost;
  }

  // Calculate local operator percentage
  // Total cost allocated to local operators (where isLocal = true)
  let localCost = 0;
  dayPlans.forEach(day => {
    if (day.stay?.isLocal) localCost += day.stay.pricePerNight;
    if (day.transport?.isLocal) localCost += day.transport.pricePerDay;
    if (day.guide?.isLocal) localCost += day.guide.pricePerDay;
    day.activities.forEach(a => {
      if (a.isLocal) localCost += a.price * travelers;
    });
  });

  const localOperatorPercentage = Math.round((localCost / currentTotalCost) * 100);

  // Replanning to stay under budget
  if (options.keepUnderBudget && currentTotalCost > budget) {
    // Trigger simulated replan
    // Let's strip out guides, or switch to a cheaper stay
    let replanCost = 0;
    const cheaperStays = MOCK_HOMESTAYS.filter(s => s.city.toLowerCase() === normalizedCityId && s.id !== selectedStay.id);
    const superCheapestStay = cheaperStays.length > 0 ? cheaperStays.reduce((prev, curr) => prev.pricePerNight < curr.pricePerNight ? prev : curr) : null;
    
    const optimizedPlans = dayPlans.map((day) => {
      let finalStay = day.stay;
      
      // If still exceeding, downgrade stay
      if (superCheapestStay && (currentTotalCost > budget)) {
        finalStay = superCheapestStay;
      }
      
      // Remove guide for further cost reductions
      const finalGuide = (currentTotalCost > budget * 1.1) ? null : day.guide;
      const finalActivities = day.activities;
      
      const newStayCost = finalStay ? finalStay.pricePerNight : 0;
      const newTransportCost = day.transport ? day.transport.pricePerDay : 0;
      const newActCost = finalActivities.reduce((acc, act) => acc + act.price, 0) * travelers;
      const newGuideCost = finalGuide ? finalGuide.pricePerDay : 0;
      
      const newDaily = newStayCost + newTransportCost + newActCost + newGuideCost;
      replanCost += newDaily;

      return {
        ...day,
        stay: finalStay,
        guide: finalGuide,
        dailyCost: newDaily
      };
    });

    currentTotalCost = replanCost;

    // Recalculate local costs
    let newLocalCost = 0;
    optimizedPlans.forEach(day => {
      if (day.stay?.isLocal) newLocalCost += day.stay.pricePerNight;
      if (day.transport?.isLocal) newLocalCost += day.transport.pricePerDay;
      if (day.guide?.isLocal) newLocalCost += day.guide.pricePerDay;
      day.activities.forEach(a => {
        if (a.isLocal) newLocalCost += a.price * travelers;
      });
    });

    return {
      id: "trip-" + Date.now(),
      city: cityName,
      totalDays: days,
      days: optimizedPlans,
      totalCost: currentTotalCost,
      budget,
      remainingBudget: Math.max(0, budget - currentTotalCost),
      localOperatorPercentage: Math.round((newLocalCost / currentTotalCost) * 105) > 100 ? 100 : Math.round((newLocalCost / currentTotalCost) * 100),
      preferences: interests,
      travelers,
      travelStyle
    };
  }

  return {
    id: "trip-" + Date.now(),
    city: cityName,
    totalDays: days,
    days: dayPlans,
    totalCost: currentTotalCost,
    budget,
    remainingBudget: Math.max(0, budget - currentTotalCost),
    localOperatorPercentage,
    preferences: interests,
    travelers,
    travelStyle
  };
}
