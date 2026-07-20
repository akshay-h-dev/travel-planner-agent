import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarRange, Coins, Users, CloudRain, Save, Download, Share2, AlertOctagon, Compass, Sparkles, MapPin, RefreshCw } from "lucide-react";
import { useTrip } from "../../context/TripContext";
import { Timeline } from "../../components/timeline/Timeline";
import { BudgetSummary } from "../../components/budget/BudgetSummary";
import { CostBreakdown } from "../../components/budget/CostBreakdown";
import { Modal } from "../../components/common/Modal";
import { Breadcrumb } from "../../components/common/Breadcrumb";

export const Results: React.FC = () => {
  const { currentItinerary, saveTrip, replanBudget, confirmAllBookings, showToast } = useTrip();

  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(0);

  if (!currentItinerary) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border text-slate-400">
          <Compass className="h-8 w-8 text-slate-405 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-xl text-slate-800 dark:text-white">
            No Active Itinerary Set
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Please run the AI Trip Planner wizard to compile a new local budget-optimised travel schedule.
          </p>
        </div>
        <Link to="/planner" className="btn-primary inline-flex py-2 px-5 text-xs font-semibold rounded-xl">
          Launch Planner Wizard
        </Link>
      </div>
    );
  }

  const handleOpenReplan = () => {
    setNewBudget(currentItinerary.budget);
    setIsReplanModalOpen(true);
  };

  const handleReplanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget <= 2000) {
      showToast("Budget must be at least ₹2,000 to construct travel variables.", "error");
      return;
    }
    replanBudget(newBudget);
    setIsReplanModalOpen(false);
  };

  const handleDownloadPDF = () => {
    showToast("Successfully generated trip PDF! Download started.", "success");
  };

  const handleShareTrip = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Shareable link copied to clipboard!", "success");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb items={[{ name: "Planner", path: "/planner" }, { name: "Active Itinerary" }]} />
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white flex items-center gap-2 pt-1">
            Trip to {currentItinerary.city}
          </h1>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleOpenReplan}
            className="btn-secondary py-2 px-4 rounded-xl text-xs font-bold flex-1 sm:flex-initial flex items-center justify-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="h-4 w-4 animate-spin-slow" /> AI Dynamic Replan
          </button>
          
          <button
            onClick={() => saveTrip(currentItinerary)}
            className="btn-primary py-2 px-4 rounded-xl text-xs font-bold flex-1 sm:flex-initial flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Save className="h-4 w-4" /> Save Itinerary
          </button>
        </div>
      </div>

      {/* Main Grid: Three Column Matrix Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1: Left Summary Info (col-span-3) */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-20">
          
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 bg-white dark:bg-dark-card/90">
            <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-400">
              Trip Overview
            </h3>

            {/* Quick KPIs stats */}
            <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4.5 w-4.5 text-primary" />
                <span>{currentItinerary.totalDays} Days Itinerary</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-secondary" />
                <span>{currentItinerary.travelers} Traveler{currentItinerary.travelers > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="h-4.5 w-4.5 text-accent" />
                <span>Style: {currentItinerary.travelStyle}</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="h-4.5 w-4.5 text-blue-400" />
                <span>Weather: 24°C / Light Rain</span>
              </div>
            </div>

            {/* Simulated Map Preview static image */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Itinerary route map
              </span>
              <div className="h-32 rounded-2xl overflow-hidden border border-slate-105 bg-slate-150 relative">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=350&q=80"
                  alt="Scenic Route Map"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center p-2">
                  <div className="bg-white/90 dark:bg-dark-card/90 px-3 py-1.5 rounded-lg border border-slate-100/50 shadow flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-danger fill-danger/10" />
                    <span className="text-[9px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Map routing Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts Widget */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 text-danger">
                <AlertOctagon className="h-3.5 w-3.5" /> Emergency Contacts
              </span>
              <div className="text-[10px] text-slate-500 font-medium leading-normal space-y-1">
                <p>Regional Tourism Desk: <b>1800-425-4747</b></p>
                <p>Local Police Helpline: <b>112</b></p>
                <p>TripWay Host Concierge: <b>+91 91191 10001</b></p>
              </div>
            </div>

          </div>

          {/* Transit Card (if applicable) */}
          {currentItinerary.startPlace && (
            <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 bg-white dark:bg-dark-card/90">
              <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-400">
                Long-Distance Transit
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Outbound</div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">
                      {currentItinerary.startPlace} → {currentItinerary.city}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 capitalize">{currentItinerary.transitTypes?.join(", ")}</div>
                  </div>
                  <div className="text-right">
                    {currentItinerary.bookingStatus?.["transit-outbound"] === "confirmed" ? (
                      <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        CONFIRMED
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Inbound</div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">
                      {currentItinerary.city} → {currentItinerary.startPlace}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 capitalize">{currentItinerary.transitTypes?.join(", ")}</div>
                  </div>
                  <div className="text-right">
                    {currentItinerary.bookingStatus?.["transit-inbound"] === "confirmed" ? (
                      <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        CONFIRMED
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick PDF / share buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="btn-outline flex-1 dark:text-white dark:border-slate-800 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button
              onClick={handleShareTrip}
              className="btn-outline flex-1 dark:text-white dark:border-slate-800 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Share2 className="h-4 w-4" /> Share link
            </button>
          </div>

        </div>

        {/* COLUMN 2: Day Schedule timeline (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <Timeline days={currentItinerary.days} travelers={currentItinerary.travelers} />
        </div>

        {/* COLUMN 3: Right Budget Summary, Cost Breakdown panel (col-span-4) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          
          <BudgetSummary itinerary={currentItinerary} />
          
          <CostBreakdown itinerary={currentItinerary} />

          {/* Booking Dashboard */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 bg-white dark:bg-dark-card/90">
            <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-400">
              Booking Status
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Review and confirm all your pending bookings in one click.
            </p>
            <button
              onClick={confirmAllBookings}
              className="w-full btn-primary py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              Confirm All Bookings
            </button>
          </div>

        </div>

      </div>

      {/* AI DYNAMIC REPLANNING MODAL */}
      <Modal
        isOpen={isReplanModalOpen}
        onClose={() => setIsReplanModalOpen(false)}
        title="AI Dynamic Budget Replanning"
      >
        <form onSubmit={handleReplanSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Enter a new target budget cap. The TripWay AI engine will scan stays, remove surcharge guides and switch transport modes automatically to balance costs.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              New Itinerary Budget Cap (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 text-sm font-bold">₹</span>
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                className="input-premium pl-8 py-3"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-secondary py-3 text-sm font-semibold rounded-2xl flex items-center justify-center gap-1 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-white animate-pulse" /> Re-Optimize Itinerary
          </button>
        </form>
      </Modal>

    </div>
  );
};
