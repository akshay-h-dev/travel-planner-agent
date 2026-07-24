import React, { createContext, useContext, useState, useEffect } from "react";
import type { Itinerary, Activity, Homestay, Guide } from "../types";
import { MOCK_HOMESTAYS } from "../services/mockData";

/** Backend base URL — empty in dev uses Vite proxy (/api → localhost:5000). */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  travelStyle: string;
  preferences: string[];
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

interface TripContextType {
  currentItinerary: Itinerary | null;
  savedItineraries: Itinerary[];
  isGenerating: boolean;
  generationStep: number;
  generationLogs: string[];
  theme: "light" | "dark";
  user: UserProfile | null;
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "info" | "error") => void;
  removeToast: (id: string) => void;
  toggleTheme: () => void;
  planTrip: (
    cityId: string,
    budget: number,
    days: number,
    travelers: number,
    travelStyle: string,
    interests: string[],
    options: { prioritizeLocal: boolean; keepUnderBudget: boolean; ecoFriendly: boolean },
    startPlace: string,
    startDate: string,
    transitTypes: string[],
    localTransitTypes?: string[],
    accommodationTypes?: string[]
  ) => Promise<boolean>;
  saveTrip: (itinerary: Itinerary) => void;
  deleteTrip: (id: string) => void;
  replaceActivity: (dayNumber: number, activityIdToReplace: string, newActivity: Activity) => void;
  replaceStay: (dayNumber: number, newStay: Homestay) => void;
  replaceGuide: (dayNumber: number, newGuide: Guide | null) => void;
  replanBudget: (targetBudget: number) => void;
  confirmBooking: (itemId: string) => void;
  confirmAllBookings: () => void;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  login: (email: string, name?: string) => void;
  signup: (userData: Partial<UserProfile>) => void;
  logout: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<UserProfile | null>({
    name: "Akshay H",
    email: "akshay@tripway.io",
    phone: "+91 98765 43210",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    travelStyle: "Adventure",
    preferences: ["Nature", "Adventure", "History"]
  });

  // Apply dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const showToast = (message: string, type: "success" | "info" | "error" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
    showToast(`Switched to ${theme === "light" ? "dark" : "light"} mode`, "success");
  };

  const planTrip = async (
    cityId: string,
    budget: number,
    days: number,
    travelers: number,
    travelStyle: string,
    interests: string[],
    options: { prioritizeLocal: boolean; keepUnderBudget: boolean; ecoFriendly: boolean },
    startPlace: string,
    startDate: string,
    transitTypes: string[],
    localTransitTypes: string[] = [],
    accommodationTypes: string[] = []
  ) => {
    setIsGenerating(true);
    setGenerationStep(0);
    setGenerationLogs([]);

    const steps = [
      "Finding destinations in database...",
      "Checking seasonal weather metrics...",
      "Scouting certified local guides...",
      "Negotiating homestay availability...",
      "Calculating transport routes & local operators...",
      "Optimizing itinerary to fit under budget...",
      "Polishing final day-by-day plans..."
    ];

    // Run progress animation in parallel with the real agent call
    const progressPromise = (async () => {
      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(i + 1);
        setGenerationLogs(prev => [...prev, steps[i]]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    })();

    try {
      const response = await fetch(`${API_BASE_URL}/api/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: cityId,
          budget: Number(budget),
          days: Number(days),
          preferences: interests,
          travelers: Number(travelers),
          travelStyle,
          startPlace,
          startDate,
          transitTypes,
          localTransitTypes,
          accommodationTypes,
          options,
        }),
      });

      const result = await response.json();

      // Wait for progress animation to finish so UX feels complete
      await progressPromise;

      if (!response.ok || result.success === false) {
        const message =
          result.error?.message ||
          result.message ||
          "Generation failed. Please try again.";
        throw new Error(message);
      }

      const fetchedItinerary = result.data;
      fetchedItinerary.bookingStatus = {};
      // Backend already echoes user inputs; keep as fallback
      fetchedItinerary.startPlace = fetchedItinerary.startPlace ?? startPlace;
      fetchedItinerary.startDate = fetchedItinerary.startDate ?? startDate;
      fetchedItinerary.transitTypes = fetchedItinerary.transitTypes ?? transitTypes;

      setCurrentItinerary(fetchedItinerary);
      showToast("Itinerary generated successfully by TripWay AI!", "success");
      return true;
    } catch (e) {
      await progressPromise.catch(() => undefined);
      const message = e instanceof Error ? e.message : "Error generating itinerary. Please try again.";
      showToast(message, "error");
      setCurrentItinerary(null);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTrip = (itinerary: Itinerary) => {
    if (savedItineraries.some(t => t.id === itinerary.id)) {
      showToast("This trip is already in your saved list!", "info");
      return;
    }
    setSavedItineraries(prev => [itinerary, ...prev]);
    showToast("Trip saved to your dashboard!", "success");
  };

  const deleteTrip = (id: string) => {
    setSavedItineraries(prev => prev.filter(t => t.id !== id));
    showToast("Trip removed.", "info");
  };

  const replaceActivity = (dayNumber: number, activityIdToReplace: string, newActivity: Activity) => {
    if (!currentItinerary) return;

    const updatedDays = currentItinerary.days.map(d => {
      if (d.day === dayNumber) {
        const updatedActs = d.activities.map(act => 
          act.id === activityIdToReplace ? { ...newActivity, timeSlot: act.timeSlot } : act
        );
        
        // Recalculate cost
        const stayCost = d.stay ? d.stay.pricePerNight : 0;
        const transportCost = d.transport ? d.transport.pricePerDay : 0;
        const guidesCost = d.guide ? d.guide.pricePerDay : 0;
        const actsCost = updatedActs.reduce((acc, a) => acc + a.price, 0) * currentItinerary.travelers;
        
        return {
          ...d,
          activities: updatedActs,
          dailyCost: stayCost + transportCost + guidesCost + actsCost
        };
      }
      return d;
    });

    const totalCost = updatedDays.reduce((acc, d) => acc + d.dailyCost, 0);
    const remainingBudget = Math.max(0, currentItinerary.budget - totalCost);

    // Recalculate local percentage
    let localCost = 0;
    updatedDays.forEach(day => {
      if (day.stay?.isLocal) localCost += day.stay.pricePerNight;
      if (day.transport?.isLocal) localCost += day.transport.pricePerDay;
      if (day.guide?.isLocal) localCost += day.guide.pricePerDay;
      day.activities.forEach(a => {
        if (a.isLocal) localCost += a.price * currentItinerary.travelers;
      });
    });

    setCurrentItinerary({
      ...currentItinerary,
      days: updatedDays,
      totalCost,
      remainingBudget,
      localOperatorPercentage: Math.round((localCost / totalCost) * 100)
    });

    showToast("Itinerary updated. Budget recalculated.", "success");
  };

  const replaceStay = (_dayNumber: number, newStay: Homestay) => {
    if (!currentItinerary) return;

    // Share stays across all days (homestay booking usually spans entire stay, but we support day specific edits)
    // For simplicity, we change stays for ALL days of the itinerary to keep it realistic
    const globalUpdatedDays = currentItinerary.days.map(d => {
      const transportCost = d.transport ? d.transport.pricePerDay : 0;
      const guideCost = d.guide ? d.guide.pricePerDay : 0;
      const actsCost = d.activities.reduce((acc, a) => acc + a.price, 0) * currentItinerary.travelers;
      const stayCost = newStay.pricePerNight;

      return {
        ...d,
        stay: newStay,
        dailyCost: stayCost + transportCost + guideCost + actsCost
      };
    });

    const totalCost = globalUpdatedDays.reduce((acc, d) => acc + d.dailyCost, 0);
    const remainingBudget = Math.max(0, currentItinerary.budget - totalCost);

    // Recalculate local percentage
    let localCost = 0;
    globalUpdatedDays.forEach(day => {
      if (day.stay?.isLocal) localCost += day.stay.pricePerNight;
      if (day.transport?.isLocal) localCost += day.transport.pricePerDay;
      if (day.guide?.isLocal) localCost += day.guide.pricePerDay;
      day.activities.forEach(a => {
        if (a.isLocal) localCost += a.price * currentItinerary.travelers;
      });
    });

    setCurrentItinerary({
      ...currentItinerary,
      days: globalUpdatedDays,
      totalCost,
      remainingBudget,
      localOperatorPercentage: Math.round((localCost / totalCost) * 100)
    });

    showToast(`Stay updated to ${newStay.name}.`, "success");
  };

  const replaceGuide = (dayNumber: number, newGuide: Guide | null) => {
    if (!currentItinerary) return;

    const updatedDays = currentItinerary.days.map(d => {
      if (d.day === dayNumber) {
        const stayCost = d.stay ? d.stay.pricePerNight : 0;
        const transportCost = d.transport ? d.transport.pricePerDay : 0;
        const actsCost = d.activities.reduce((acc, a) => acc + a.price, 0) * currentItinerary.travelers;
        const guideCost = newGuide ? newGuide.pricePerDay : 0;

        return {
          ...d,
          guide: newGuide,
          dailyCost: stayCost + transportCost + guideCost + actsCost
        };
      }
      return d;
    });

    const totalCost = updatedDays.reduce((acc, d) => acc + d.dailyCost, 0);
    const remainingBudget = Math.max(0, currentItinerary.budget - totalCost);

    let localCost = 0;
    updatedDays.forEach(day => {
      if (day.stay?.isLocal) localCost += day.stay.pricePerNight;
      if (day.transport?.isLocal) localCost += day.transport.pricePerDay;
      if (day.guide?.isLocal) localCost += day.guide.pricePerDay;
      day.activities.forEach(a => {
        if (a.isLocal) localCost += a.price * currentItinerary.travelers;
      });
    });

    setCurrentItinerary({
      ...currentItinerary,
      days: updatedDays,
      totalCost,
      remainingBudget,
      localOperatorPercentage: Math.min(100, Math.round((localCost / totalCost) * 100))
    });

    showToast(newGuide ? `Booked guide ${newGuide.name}` : "Guide removed", "success");
  };

  const replanBudget = async (targetBudget: number) => {
    if (!currentItinerary) return;

    // Simulate AI replanning state triggers
    setIsGenerating(true);
    setGenerationStep(1);
    setGenerationLogs(["AI triggered dynamic replanning due to budget threshold scan...", "Analyzing current accommodation variables..."]);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: currentItinerary.city,
          budget: targetBudget,
          days: currentItinerary.totalDays,
          preferences: currentItinerary.preferences,
          travelers: currentItinerary.travelers,
          travelStyle: currentItinerary.travelStyle,
          startPlace: currentItinerary.startPlace ?? "",
          startDate: currentItinerary.startDate ?? "",
          transitTypes: currentItinerary.transitTypes ?? [],
          options: {
            prioritizeLocal: true,
            keepUnderBudget: true,
            ecoFriendly: false,
          },
        }),
      });
      const result = await response.json();
      if (result.success) {
        const newItin = result.data;
        newItin.bookingStatus = currentItinerary.bookingStatus || {};
        newItin.startPlace = currentItinerary.startPlace;
        newItin.startDate = currentItinerary.startDate;
        newItin.transitTypes = currentItinerary.transitTypes;
        setCurrentItinerary(newItin);
        showToast("AI replanned your itinerary successfully to match budget!", "success");
      } else {
        throw new Error(result.error?.message || "Failed to replan");
      }
    } catch (err: any) {
      showToast(err.message || "Replanning failed", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmBooking = (itemId: string) => {
    if (!currentItinerary) return;
    setCurrentItinerary(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        bookingStatus: {
          ...(prev.bookingStatus || {}),
          [itemId]: "confirmed"
        }
      };
    });
    showToast("Booking confirmed successfully!", "success");
  };

  const confirmAllBookings = () => {
    if (!currentItinerary) return;
    const newStatus: Record<string, "pending" | "confirmed"> = { ...(currentItinerary.bookingStatus || {}) };
    
    currentItinerary.days.forEach(d => {
      if (d.stay) newStatus[d.stay.id] = "confirmed";
      if (d.transport) newStatus[d.transport.id] = "confirmed";
      if (d.guide) newStatus[d.guide.id] = "confirmed";
      d.activities.forEach(a => newStatus[a.id] = "confirmed");
    });
    newStatus["transit-outbound"] = "confirmed";
    newStatus["transit-inbound"] = "confirmed";

    setCurrentItinerary(prev => prev ? { ...prev, bookingStatus: newStatus } : null);
    showToast("All items have been booked and confirmed!", "success");
  };

  const login = (email: string, name: string = "Akshay H") => {
    setUser({
      name,
      email,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      travelStyle: "Backpacking",
      preferences: ["Nature", "Offbeat"]
    });
    showToast(`Welcome back, ${name}!`, "success");
  };

  const signup = (userData: Partial<UserProfile>) => {
    setUser({
      name: userData.name || "Explorer",
      email: userData.email || "explorer@tripway.io",
      phone: userData.phone || "",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      travelStyle: userData.travelStyle || "Solo",
      preferences: userData.preferences || ["Nature"]
    });
    showToast("Account created successfully!", "success");
  };

  const logout = () => {
    setUser(null);
    showToast("Logged out successfully.", "info");
  };

  return (
    <TripContext.Provider
      value={{
        currentItinerary,
        savedItineraries,
        isGenerating,
        generationStep,
        generationLogs,
        theme,
        user,
        toasts,
        showToast,
        removeToast,
        toggleTheme,
        planTrip,
        saveTrip,
        deleteTrip,
        replaceActivity,
        replaceStay,
        replaceGuide,
        replanBudget,
        confirmBooking,
        confirmAllBookings,
        setCurrentItinerary,
        login,
        signup,
        logout
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};
