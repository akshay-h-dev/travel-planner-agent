import React, { createContext, useContext, useState, useEffect } from "react";
import type { Itinerary, Activity, Homestay, Guide } from "../types";
import { generateItinerary, MOCK_HOMESTAYS } from "../services/mockData";

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
    options: { prioritizeLocal: boolean; keepUnderBudget: boolean; ecoFriendly: boolean }
  ) => Promise<void>;
  saveTrip: (itinerary: Itinerary) => void;
  deleteTrip: (id: string) => void;
  replaceActivity: (dayNumber: number, activityIdToReplace: string, newActivity: Activity) => void;
  replaceStay: (dayNumber: number, newStay: Homestay) => void;
  replaceGuide: (dayNumber: number, newGuide: Guide | null) => void;
  replanBudget: (targetBudget: number) => void;
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
    options: { prioritizeLocal: boolean; keepUnderBudget: boolean; ecoFriendly: boolean }
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

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(i + 1);
      setGenerationLogs(prev => [...prev, steps[i]]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const generated = generateItinerary(
        cityId,
        budget,
        days,
        travelers,
        travelStyle,
        interests,
        options
      );
      setCurrentItinerary(generated);
      showToast("Itinerary generated successfully by TripWay AI!", "success");
    } catch (e) {
      showToast("Error generating itinerary. Please try again.", "error");
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

  const replanBudget = (targetBudget: number) => {
    if (!currentItinerary) return;

    // Simulate AI replanning state triggers
    setIsGenerating(true);
    setGenerationStep(1);
    setGenerationLogs(["AI triggered dynamic replanning due to budget threshold scan...", "Analyzing current accommodation variables..."]);
    
    setTimeout(() => {
      setGenerationLogs(prev => [...prev, "Swapping premium commercial events with high-rated local operators...", "Applying eco-friendly transportation discounts..."]);
      
      setTimeout(() => {
        // Run replan parameters
        const cheaperStayOptions = MOCK_HOMESTAYS.filter(
          s => s.city.toLowerCase() === currentItinerary.city.toLowerCase().replace("north ", "") && s.pricePerNight < (currentItinerary.days[0].stay?.pricePerNight || 9999)
        );
        
        let newStay = currentItinerary.days[0].stay;
        if (cheaperStayOptions.length > 0) {
          newStay = cheaperStayOptions.reduce((prev, curr) => prev.pricePerNight < curr.pricePerNight ? prev : curr);
        }

        const updatedDays = currentItinerary.days.map(d => {
          // Remove guide on alternate days if extremely tight
          const finalGuide = targetBudget < currentItinerary.totalCost * 0.8 ? null : d.guide;
          
          const stayCost = newStay ? newStay.pricePerNight : 0;
          const transportCost = d.transport ? d.transport.pricePerDay : 0;
          const guideCost = finalGuide ? finalGuide.pricePerDay : 0;
          const actsCost = d.activities.reduce((acc, a) => acc + a.price, 0) * currentItinerary.travelers;

          return {
            ...d,
            stay: newStay,
            guide: finalGuide,
            dailyCost: stayCost + transportCost + guideCost + actsCost
          };
        });

        const totalCost = updatedDays.reduce((acc, d) => acc + d.dailyCost, 0);
        
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
          budget: targetBudget,
          days: updatedDays,
          totalCost,
          remainingBudget: Math.max(0, targetBudget - totalCost),
          localOperatorPercentage: Math.min(100, Math.round((localCost / totalCost) * 105))
        });
        
        setIsGenerating(false);
        showToast("AI replanned your itinerary successfully to match budget!", "success");
      }, 1000);

    }, 1000);
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
