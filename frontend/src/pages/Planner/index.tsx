import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ShieldCheck, Compass, Check } from "lucide-react";
import { useTrip } from "../../context/TripContext";
import { MOCK_CITIES } from "../../services/mockData";
import { Breadcrumb } from "../../components/common/Breadcrumb";

export const Planner: React.FC = () => {
  const { planTrip, showToast } = useTrip();
  const navigate = useNavigate();

  // Form State variables
  const [cityId, setCityId] = useState("goa");
  const [budget, setBudget] = useState(25000);
  const [days, setDays] = useState(4);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState("Backpacking");
  
  // Array structures
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Nature", "Adventure"]);
  const [selectedStays, setSelectedStays] = useState<string[]>(["Homestay"]);
  const [selectedTransports, setSelectedTransports] = useState<string[]>(["bike-rental", "auto-rickshaw"]);

  // Option toggles
  const [prioritizeLocal, setPrioritizeLocal] = useState(true);
  const [keepUnderBudget, setKeepUnderBudget] = useState(true);
  const [ecoFriendly, setEcoFriendly] = useState(true);
  const [minimizeTime, setMinimizeTime] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleStay = (stay: string) => {
    setSelectedStays((prev) =>
      prev.includes(stay) ? prev.filter((s) => s !== stay) : [...prev, stay]
    );
  };

  const toggleTransport = (transport: string) => {
    setSelectedTransports((prev) =>
      prev.includes(transport) ? prev.filter((t) => t !== transport) : [...prev, transport]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityId) {
      showToast("Please choose a valid destination hub.", "error");
      return;
    }
    if (selectedInterests.length === 0) {
      showToast("Please select at least one interest.", "error");
      return;
    }

    // Call planning execution
    await planTrip(cityId, budget, days, travelers, travelStyle, selectedInterests, {
      prioritizeLocal,
      keepUnderBudget,
      ecoFriendly
    });
    
    navigate("/results");
  };

  const stylesList = ["Budget", "Luxury", "Adventure", "Backpacking", "Family", "Solo"];
  const interestsList = ["Food", "Nature", "Adventure", "History", "Shopping", "Nightlife"];
  const accommodateList = ["Hotel", "Hostel", "Homestay", "Resort", "Camping"];
  
  const transportTypes = [
    { label: "Public Bus", val: "bus" },
    { label: "Local Auto / Rickshaw", val: "auto-rickshaw" },
    { label: "Cab Service", val: "cab" },
    { label: "Bike Rental", val: "bike-rental" },
    { label: "Walking routes", val: "walking" }
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      <Breadcrumb items={[{ name: "Planner Wizard" }]} />

      <div className="space-y-6 pt-2">
        {/* Head Intro */}
        <div className="space-y-2">
          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-800 dark:text-white flex items-center gap-2">
            <Compass className="h-7 w-7 text-primary animate-pulse" />
            AI Travel Planning Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Formulate detailed, micro-managed itineraries supporting small local businesses and strict budget thresholds.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800/80 shadow-premium space-y-6 bg-white dark:bg-dark-card/90">
          
          {/* Section 1: Basic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            
            {/* Destination Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-350">
                Choose Destination Hub
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="input-premium py-3"
              >
                {MOCK_CITIES.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-dark dark:text-white">
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Limit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-300">
                <span>Total Budget Limit</span>
                <span className="text-primary dark:text-teal-400 font-mono text-sm font-extrabold">₹{budget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer accent-primary"
              />
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Min: ₹5K</span>
                <span>Max: ₹100K</span>
              </div>
            </div>

            {/* Duration Days */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-505 dark:text-slate-350">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="input-premium"
                required
              />
            </div>

            {/* Travelers */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-505 dark:text-slate-350">
                Travelers Gauge
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="input-premium"
                required
              />
            </div>

          </div>

          {/* Section 2: Preferences */}
          <div className="space-y-4 pb-6 border-b border-slate-105 dark:border-slate-800">
            {/* Travel Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-350 block mb-1">
                Preferred Travel Style
              </label>
              <div className="flex flex-wrap gap-2">
                {stylesList.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setTravelStyle(style)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                      travelStyle === style
                        ? "border-primary bg-primary/10 text-primary dark:border-secondary dark:bg-secondary/10 dark:text-secondary"
                        : "border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests checklist */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-350 block mb-1">
                Select Key Activity Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interestsList.map((interest) => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center gap-1.5 ${
                        selected
                          ? "border-secondary bg-secondary/10 text-secondary"
                          : "border-slate-205 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accommodation types */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-350 block mb-1">
                Accommodation Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {accommodateList.map((ch) => {
                  const selected = selectedStays.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleStay(ch)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center gap-1.5 ${
                        selected
                          ? "border-teal-500 bg-teal-500/10 text-[#0F766E]"
                          : "border-slate-205 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transport Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-350 block mb-1">
                Preferred Transport Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {transportTypes.map((tr) => {
                  const selected = selectedTransports.includes(tr.val);
                  return (
                    <button
                      key={tr.val}
                      type="button"
                      onClick={() => toggleTransport(tr.val)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center gap-1.5 ${
                        selected
                          ? "border-accent bg-accent/10 text-accent-dark"
                          : "border-slate-205 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {tr.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Section 3: AI Engine Toggles */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-350">
              TripWay Local Verification Options
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Local prioritizing */}
              <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-start gap-3 bg-slate-50/50 dark:bg-slate-900/35 hover:border-teal-500/30 transition-all">
                <input
                  type="checkbox"
                  id="prioritize"
                  checked={prioritizeLocal}
                  onChange={(e) => setPrioritizeLocal(e.target.checked)}
                  className="mt-1 h-4 w-4 text-secondary focus:ring-secondary border-slate-300 rounded"
                />
                <div>
                  <label htmlFor="prioritize" className="font-heading font-extrabold text-xs text-slate-800 dark:text-white block cursor-pointer">
                    Prioritize Verified Local Operators
                  </label>
                  <span className="text-[10px] text-slate-450 block leading-tight pt-0.5">
                    Ensures stays/guides are certified micro-operators keeping profits regional.
                  </span>
                </div>
              </div>

              {/* Strict Budgeting */}
              <div className="p-4 border border-slate-155 dark:border-slate-800 rounded-2xl flex items-start gap-3 bg-slate-50/50 dark:bg-slate-900/35 hover:border-primary/30 transition-all font-medium">
                <input
                  type="checkbox"
                  id="budgetstrict"
                  checked={keepUnderBudget}
                  onChange={(e) => setKeepUnderBudget(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <div>
                  <label htmlFor="budgetstrict" className="font-heading font-extrabold text-xs text-slate-800 dark:text-white block cursor-pointer">
                    Strict Budget Clamp
                  </label>
                  <span className="text-[10px] text-slate-455 block leading-tight pt-0.5">
                    Automatically replaces activities and models if cumulative cost exceeds limits.
                  </span>
                </div>
              </div>

              {/* Eco friendly */}
              <div className="p-4 border border-slate-155 dark:border-slate-800 rounded-2xl flex items-start gap-3 bg-slate-50/50 dark:bg-slate-900/35 hover:border-secondary/30 transition-all">
                <input
                  type="checkbox"
                  id="ecofriendly"
                  checked={ecoFriendly}
                  onChange={(e) => setEcoFriendly(e.target.checked)}
                  className="mt-1 h-4 w-4 text-secondary focus:ring-secondary border-slate-300 rounded"
                />
                <div>
                  <label htmlFor="ecofriendly" className="font-heading font-extrabold text-xs text-slate-800 dark:text-white block cursor-pointer">
                    Carbon Reduction Route
                  </label>
                  <span className="text-[10px] text-slate-450 block leading-tight pt-0.5">
                    Prefers electric bikes, union shared-shuttles and walking activities.
                  </span>
                </div>
              </div>

              {/* Minimize time */}
              <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-start gap-3 bg-slate-50/50 dark:bg-slate-900/35 hover:border-primary/30 transition-all">
                <input
                  type="checkbox"
                  id="traveltime"
                  checked={minimizeTime}
                  onChange={(e) => setMinimizeTime(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <div>
                  <label htmlFor="traveltime" className="font-heading font-extrabold text-xs text-slate-800 dark:text-white block cursor-pointer">
                    Minimize Driving Intervals
                  </label>
                  <span className="text-[10px] text-slate-450 block leading-tight pt-0.5">
                    Reroutes schedules to build geographic activity clusters.
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full btn-primary py-3.5 text-sm font-semibold rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 mt-6"
          >
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            Launch AI Planner Engine
          </button>

        </form>

        {/* Trust disclaimer */}
        <div className="p-4 bg-teal-500/5 dark:bg-teal-900/10 border border-teal-500/20 rounded-2xl flex gap-3 text-secondary font-medium">
          <ShieldCheck className="h-5 w-5 shrink-0 text-secondary" />
          <p className="text-[10px] sm:text-xs leading-relaxed text-teal-850 dark:text-teal-400">
            TripWay maintains a audited directory of rural hosts, certified local guides and green taxi cooperatives. All rates are updated directly by operators, bypassing booking commission taxes.
          </p>
        </div>
      </div>
    </div>
  );
};
