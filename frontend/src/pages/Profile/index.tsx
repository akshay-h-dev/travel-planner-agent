import React from "react";
import { useTrip } from "../../context/TripContext";
import { LogOut, Check } from "lucide-react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { TripCard } from "../../components/dashboard/TripCard";

export const Profile: React.FC = () => {
  const { user, savedItineraries, logout } = useTrip();

  const travelStyles = ["Backpacking", "Solo", "Adventure", "Budget", "Luxury", "Family"];
  const preferencesList = ["Nature", "Adventure", "History", "Food", "Shopping", "Nightlife"];

  if (!user) {
    return (
      <div className="flex-1 max-w-md mx-auto py-16 text-center space-y-4">
        <h3 className="font-heading font-extrabold text-lg text-slate-805 dark:text-white">Profile Locked</h3>
        <p className="text-xs text-slate-500">Sign in to check profile variables.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <Breadcrumb items={[{ name: "Profile Details" }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Settings (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4 bg-white dark:bg-dark-card/95">
            
            {/* Avatar Profile */}
            <div className="relative mx-auto w-24 h-24">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full rounded-full object-cover ring-4 ring-primary-light"
              />
              <span className="absolute bottom-0 right-1 px-1.5 py-0.5 rounded text-[8px] bg-secondary text-white font-bold uppercase tracking-wider shadow">
                VERIFIED
              </span>
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-lg text-slate-850 dark:text-white leading-none">
                {user.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">{user.email}</p>
            </div>

            {/* General metrics */}
            <div className="grid grid-cols-2 gap-2 text-center py-2 border-y border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div>
                <span className="text-[10px] text-slate-400 block font-normal leading-none mb-1">Saved Trips</span>
                <span>{savedItineraries.length} active</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-normal leading-none mb-1">Level</span>
                <span className="text-secondary">Gold Explorer</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full btn-outline border-red-200/50 hover:bg-red-50 text-danger text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
            >
              <LogOut className="h-4 w-4" /> Sign Out Session
            </button>

          </div>

          {/* Preferences box */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 bg-white dark:bg-dark-card/95">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
              Travel Preferences
            </h3>

            {/* Style Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Default travel style</span>
              <div className="flex flex-wrap gap-1.5">
                {travelStyles.map((style) => (
                  <span
                    key={style}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                      user.travelStyle === style
                        ? "bg-primary/10 border-primary text-primary dark:bg-secondary/10 dark:border-secondary dark:text-secondary"
                        : "border-slate-200 dark:border-slate-800 text-slate-450"
                    }`}
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Default interests</span>
              <div className="flex flex-wrap gap-1.5">
                {preferencesList.map((pref) => {
                  const hasPref = user.preferences.includes(pref);
                  return (
                    <span
                      key={pref}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1 ${
                        hasPref
                          ? "bg-teal-500/10 border-teal-500/30 text-secondary"
                          : "border-slate-250 dark:border-slate-800 text-slate-450"
                      }`}
                    >
                      {hasPref && <Check className="h-3 w-3" />}
                      {pref}
                    </span>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column Saved Trips (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="font-heading font-extrabold text-lg text-slate-805 dark:text-white">
            Saved Itinerary Archives
          </h2>

          {savedItineraries.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-3xl text-sm text-slate-450">
              No saved schedules yet. Plan a trip to fill your ledger.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {savedItineraries.map((trips) => (
                <TripCard key={trips.id} itinerary={trips} isSaved={true} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
