import React, { useState } from "react";
import { Home, Navigation, UserCheck, RefreshCw, PlusCircle, Trash } from "lucide-react";
import type { DayPlan, Activity, Homestay, Guide } from "../../types";
import { ActivityCard } from "./ActivityCard";
import { Modal } from "../common/Modal";
import { useTrip } from "../../context/TripContext";
import { MOCK_ACTIVITIES, MOCK_HOMESTAYS, MOCK_GUIDES } from "../../services/mockData";

interface DayCardProps {
  dayPlan: DayPlan;
  travelers: number;
}

export const DayCard: React.FC<DayCardProps> = ({ dayPlan, travelers }) => {
  const { replaceActivity, replaceStay, replaceGuide } = useTrip();
  const [activeSlot, setActiveSlot] = useState<{ activityId: string } | null>(null);
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Filter possible activity alternates for swap modal
  const availableSwapActivities = MOCK_ACTIVITIES.filter(
    (act) => act.city.toLowerCase() === dayPlan.activities[0]?.city.toLowerCase() &&
    !dayPlan.activities.some((current) => current.id === act.id)
  );

  // Filter homestays for replacement
  const availableStays = MOCK_HOMESTAYS.filter(
    (stay) => stay.city.toLowerCase() === dayPlan.stay?.city.toLowerCase() && stay.id !== dayPlan.stay?.id
  );

  // Filter guides
  const availableGuides = MOCK_GUIDES.filter(
    (guide) => guide.city.toLowerCase() === dayPlan.activities[0]?.city.toLowerCase() && guide.id !== dayPlan.guide?.id
  );

  const handleSwapActivity = (newAct: Activity) => {
    if (!activeSlot) return;
    replaceActivity(dayPlan.day, activeSlot.activityId, newAct);
    setActiveSlot(null);
  };

  const handleSwapStay = (newStay: Homestay) => {
    replaceStay(dayPlan.day, newStay);
    setIsStayModalOpen(false);
  };

  const handleSwapGuide = (newGuide: Guide | null) => {
    replaceGuide(dayPlan.day, newGuide);
    setIsGuideModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium relative transition-all duration-300">
      
      {/* Header Day */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-sm">
            D{dayPlan.day}
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-800 dark:text-white">
              Day {dayPlan.day} Schedule
            </h3>
            <p className="text-xs text-slate-400 font-medium">Itinerary Segment</p>
          </div>
        </div>
        
        {/* Cost Summary indicator */}
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Daily Outflow</span>
          <span className="font-heading font-extrabold text-sm text-primary dark:text-teal-400">
            ₹{dayPlan.dailyCost}
          </span>
        </div>
      </div>

      {/* Main Grid: Activities & Operator cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Activities list */}
        <div className="lg:col-span-8 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
            Daily Activities
          </h4>

          <div className="space-y-3">
            {dayPlan.activities.map((act) => (
              <div key={act.id} className="relative">
                <span className="absolute top-1/2 -left-3.5 transform -translate-y-1/2 w-1.5 h-10 bg-slate-205 dark:bg-slate-700/80 rounded-r-md block"></span>
                <div className="text-[10px] font-bold text-primary dark:text-secondary uppercase select-none tracking-widest pl-1.5 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 dark:bg-secondary"></span>
                  {act.timeSlot}
                </div>
                <ActivityCard
                  activity={act}
                  travelers={travelers}
                  onSwap={() => setActiveSlot({ activityId: act.id })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Stay, Guide, Transport operators */}
        <div className="lg:col-span-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-2">
            Local Resources
          </h4>

          {/* Stay widget */}
          {dayPlan.stay ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" /> Stay Location
                </span>
                <button
                  onClick={() => setIsStayModalOpen(true)}
                  className="text-primary dark:text-secondary hover:underline flex items-center gap-0.5"
                >
                  <RefreshCw className="h-3 w-3" /> Change
                </button>
              </div>
              <div className="p-3 bg-white dark:bg-dark-card border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between items-start gap-1">
                  <span className="font-semibold text-xs text-slate-800 dark:text-white line-clamp-1">
                    {dayPlan.stay.name}
                  </span>
                  {dayPlan.stay.isLocal && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-50 dark:bg-teal-900/30 text-secondary border border-teal-200/30">
                      LOCAL
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-450 line-clamp-1">{dayPlan.stay.description}</p>
                <div className="flex justify-between items-center pt-1 text-[10px] font-bold">
                  <span className="text-slate-450">₹{dayPlan.stay.pricePerNight} / night</span>
                  <span className="text-accent text-[9px]">★ {dayPlan.stay.rating}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed dark:border-slate-850 p-4 text-center rounded-xl text-xs text-slate-450">
              No stay booked.
            </div>
          )}

          {/* Transport widget */}
          {dayPlan.transport ? (
            <div className="space-y-2">
              <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                <Navigation className="h-3.5 w-3.5" /> Transport Model
              </span>
              <div className="p-3 bg-white dark:bg-dark-card border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xs text-slate-800 dark:text-white">
                    {dayPlan.transport.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {dayPlan.transport.type}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">{dayPlan.transport.provider}</p>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  ₹{dayPlan.transport.pricePerDay} / day
                </div>
              </div>
            </div>
          ) : null}

          {/* Guide widget */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" /> Personal Guide
              </span>
              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="text-primary dark:text-secondary hover:underline flex items-center gap-0.5"
              >
                {dayPlan.guide ? <span className="flex items-center gap-0.5"><RefreshCw className="h-3 w-3" /> Change</span> : <span className="flex items-center gap-0.5"><PlusCircle className="h-3 w-3" /> Book</span>}
              </button>
            </div>
            {dayPlan.guide ? (
              <div className="p-3 bg-white dark:bg-dark-card border border-slate-150 dark:border-slate-800 rounded-xl flex items-center gap-3">
                <img
                  src={dayPlan.guide.avatarUrl}
                  alt={dayPlan.guide.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20"
                />
                <div className="flex-1 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs text-slate-800 dark:text-white hover:underline">
                      {dayPlan.guide.name}
                    </span>
                    <span className="text-[9px] text-[#F59E0B]">★ {dayPlan.guide.rating}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-450 leading-none">
                    <span>₹{dayPlan.guide.pricePerDay} / day</span>
                    <button
                      onClick={() => handleSwapGuide(null)}
                      className="text-danger hover:underline hover:text-red-750"
                      title="Remove Guide"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl text-center text-[11px] text-slate-400 font-medium">
                No guide scheduled yet.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODALS */}
      {/* 1. Activity swap modal */}
      <Modal
        isOpen={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        title="Swap Activity Alternative"
      >
        {availableSwapActivities.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-450">
            No local alternates found for this category.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-450 mb-3">
              Swap with organic and local operators who keep 100% of profits within the community:
            </p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {availableSwapActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleSwapActivity(act)}
                  className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary cursor-pointer transition-all bg-white dark:bg-dark-card flex justify-between items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  <div className="flex gap-3 items-center">
                    <img src={act.imageUrl} alt={act.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="font-heading font-semibold text-xs text-slate-800 dark:text-white line-clamp-1">{act.name}</h4>
                      <span className="text-[10px] text-slate-450">{act.category} • rating {act.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-250 block">₹{act.price}</span>
                    <span className="text-[9px] text-teal-500 font-semibold">{act.isLocal ? "Local-First" : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Stay swap modal */}
      <Modal
        isOpen={isStayModalOpen}
        onClose={() => setIsStayModalOpen(false)}
        title="Choose a Local Homestay"
      >
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {availableStays.map((stay) => (
            <div
              key={stay.id}
              onClick={() => handleSwapStay(stay)}
              className="p-3 border border-slate-205 dark:border-slate-800 rounded-2xl hover:border-secondary cursor-pointer transition-all bg-white dark:bg-dark-card flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              <img src={stay.imageUrl} alt={stay.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between items-start gap-1">
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-white line-clamp-1">{stay.name}</h4>
                  <span className="shrink-0 text-[10px] font-bold text-slate-750">₹{stay.pricePerNight}</span>
                </div>
                <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">{stay.description}</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[9px] text-[#F59E0B]">★ {stay.rating} {stay.isLocal ? "• Local Owner" : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* 3. Guide swap modal */}
      <Modal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        title="Scout Certified Local Guides"
      >
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {availableGuides.map((guide) => (
            <div
              key={guide.id}
              onClick={() => handleSwapGuide(guide)}
              className="p-3 border border-slate-205 dark:border-slate-800 rounded-2xl hover:border-primary cursor-pointer transition-all bg-white dark:bg-dark-card flex gap-3 items-center hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              <img src={guide.avatarUrl} alt={guide.name} className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-primary/10" />
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-white">{guide.name}</h4>
                  <span className="text-xs font-bold">₹{guide.pricePerDay} / day</span>
                </div>
                <p className="text-[10px] text-slate-450 line-clamp-1 leading-normal">{guide.bio}</p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {guide.specialties.slice(0,2).map((s,i)=>(
                    <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 px-1 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                  <span className="text-[9px] text-[#F59E0B] font-bold ml-auto">★ {guide.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  );
};
