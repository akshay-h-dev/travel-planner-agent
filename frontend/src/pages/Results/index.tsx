import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarRange,
  Coins,
  Users,
  Save,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { useTrip } from "../../context/TripContext";
import { Timeline } from "../../components/timeline/Timeline";
import { BudgetSummary } from "../../components/budget/BudgetSummary";
import { Modal } from "../../components/common/Modal";
import { Breadcrumb } from "../../components/common/Breadcrumb";

export const Results: React.FC = () => {
  const {
    currentItinerary,
    saveTrip,
    replanBudget,
    confirmAllBookings,
    showToast,
  } = useTrip();

  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(0);

  if (!currentItinerary) {
    return (
      <div className="flex-1 max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">
          No Active Itinerary
        </h2>

        <p className="text-slate-500 mb-6">
          Start by creating a new trip plan.
        </p>

        <Link
          to="/planner"
          className="btn-primary px-6 py-3 rounded-xl"
        >
          Launch Planner
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

    if (newBudget < 2000) {
      showToast(
        "Budget must be at least ₹2,000.",
        "error"
      );
      return;
    }

    replanBudget(newBudget);
    setIsReplanModalOpen(false);
  };

  const handleDownloadPDF = () => {
    showToast(
      "Trip PDF generated successfully.",
      "success"
    );
  };

  const handleShareTrip = () => {
    navigator.clipboard.writeText(window.location.href);

    showToast(
      "Share link copied.",
      "success"
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div>
          <Breadcrumb
            items={[
              { name: "Planner", path: "/planner" },
              { name: "Results" },
            ]}
          />

          <h1 className="text-3xl font-bold mt-2">
            Trip to {currentItinerary.city}
          </h1>

          <p className="text-slate-500 mt-1">
            {currentItinerary.totalDays} Days •{" "}
            {currentItinerary.travelers} Traveler
            {currentItinerary.travelers > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={handleOpenReplan}
            className="btn-secondary px-5 py-2 rounded-xl flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Replan
          </button>

          <button
            onClick={() => saveTrip(currentItinerary)}
            className="btn-primary px-5 py-2 rounded-xl flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={handleDownloadPDF}
            className="btn-outline px-5 py-2 rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>

          <button
            onClick={handleShareTrip}
            className="btn-outline px-5 py-2 rounded-xl flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

        </div>
      </div>

      {/* Quick Summary */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="glass-card rounded-2xl p-5">
          <CalendarRange className="text-primary mb-3" />
          <p className="text-sm text-slate-500">
            Duration
          </p>
          <h3 className="text-xl font-bold">
            {currentItinerary.totalDays} Days
          </h3>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <Users className="text-primary mb-3" />
          <p className="text-sm text-slate-500">
            Travelers
          </p>
          <h3 className="text-xl font-bold">
            {currentItinerary.travelers}
          </h3>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <Coins className="text-primary mb-3" />
          <p className="text-sm text-slate-500">
            Budget
          </p>
          <h3 className="text-xl font-bold">
            ₹{currentItinerary.budget.toLocaleString()}
          </h3>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <Sparkles className="text-primary mb-3" />
          <p className="text-sm text-slate-500">
            Travel Style
          </p>
          <h3 className="text-xl font-bold capitalize">
            {currentItinerary.travelStyle}
          </h3>
        </div>

      </div>

      {/* Main Content */}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* =========================
      LEFT (2/3 Width)
      Timeline
  ========================== */}

        <div className="lg:col-span-2 space-y-6">

          <div className="glass-card rounded-3xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-bold">
                  Daily Itinerary
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Follow your complete travel schedule day by day.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {currentItinerary.totalDays} Days
              </span>

            </div>

            <Timeline
              days={currentItinerary.days}
              travelers={currentItinerary.travelers}
            />

          </div>

        </div>

        {/* =========================
      RIGHT SIDEBAR
  ========================== */}

        <div className="space-y-6">

          {/* Budget Summary */}

          <div className="glass-card rounded-3xl p-6">

            <h2 className="text-xl font-bold mb-5">
              Budget Overview
            </h2>

            <BudgetSummary itinerary={currentItinerary} />

          </div>

          {/* =========================
        Booking Status
    ========================== */}

          <div className="glass-card rounded-3xl p-6">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">
                Booking Status
              </h2>

              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                Live
              </span>
            </div>

            <div className="space-y-4">

              {/* Hotel */}

              <div className="flex items-center justify-between border rounded-xl px-4 py-3">

                <div>
                  <p className="font-medium">
                    Hotel
                  </p>

                  <p className="text-sm text-slate-500">
                    Accommodation booking
                  </p>
                </div>

                {currentItinerary.bookingStatus?.hotel === "confirmed" ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    Confirmed
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                    Pending
                  </span>
                )}

              </div>

              {/* Transport */}

              <div className="flex items-center justify-between border rounded-xl px-4 py-3">

                <div>
                  <p className="font-medium">
                    Transport
                  </p>

                  <p className="text-sm text-slate-500">
                    Travel tickets
                  </p>
                </div>

                {currentItinerary.bookingStatus?.["transit-outbound"] === "confirmed" &&
                  currentItinerary.bookingStatus?.["transit-inbound"] === "confirmed" ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    Confirmed
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                    Pending
                  </span>
                )}

              </div>

            </div>

            <button
              onClick={confirmAllBookings}
              className="w-full mt-6 btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Confirm All Bookings
            </button>

          </div>

        </div>

      </div>
      {/* =========================
    AI Replan Modal
========================== */}

      <Modal
        isOpen={isReplanModalOpen}
        onClose={() => setIsReplanModalOpen(false)}
        title="Replan Budget"
      >
        <form
          onSubmit={handleReplanSubmit}
          className="space-y-6"
        >

          <div>
            <h3 className="text-lg font-semibold">
              Adjust Your Budget
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Enter a new budget and we'll regenerate the itinerary
              while keeping your trip balanced.
            </p>
          </div>

          {/* Budget Input */}

          <div>

            <label className="block text-sm font-medium mb-2">
              New Budget (₹)
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                ₹
              </span>

              <input
                type="number"
                min={2000}
                value={newBudget}
                onChange={(e) =>
                  setNewBudget(Number(e.target.value))
                }
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-4 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter budget"
                required
              />

            </div>

            <p className="text-xs text-slate-500 mt-2">
              Minimum budget: ₹2,000
            </p>

          </div>

          {/* Budget Preview */}

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4 space-y-2">

            <div className="flex justify-between">

              <span className="text-slate-500">
                Current Budget
              </span>

              <span className="font-semibold">
                ₹{currentItinerary.budget.toLocaleString()}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-500">
                New Budget
              </span>

              <span className="font-bold text-primary">
                ₹{newBudget.toLocaleString()}
              </span>

            </div>

          </div>

          {/* Action Buttons */}

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => setIsReplanModalOpen(false)}
              className="flex-1 border border-slate-300 rounded-xl py-3 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 btn-primary rounded-xl py-3 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Plan
            </button>

          </div>

        </form>

      </Modal>
    </div>
  );
};

export default Results;