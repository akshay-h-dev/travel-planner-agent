import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Award, Compass, PlusCircle, TrendingUp, BarChart2 } from "lucide-react";
import { useTrip } from "../../context/TripContext";
import { TripCard } from "../../components/dashboard/TripCard";
import { Breadcrumb } from "../../components/common/Breadcrumb";

export const Dashboard: React.FC = () => {
  const { savedItineraries, user } = useTrip();
  const navigate = useNavigate();

  // Accumulate mock stats
  const tripsCount = savedItineraries.length;
  const communitiesSupported = savedItineraries.length > 0 
    ? Math.round(savedItineraries.reduce((acc, t) => acc + t.localOperatorPercentage, 0) / savedItineraries.length) 
    : 85; // default/mock
  
  const savedAggregatorCash = savedItineraries.length > 0
    ? savedItineraries.reduce((acc, t) => acc + Math.round(t.totalCost * 0.28), 0)
    : 4500; // default/mock

  const stats = [
    { label: "Planned Trips", val: tripsCount, change: "+1 this month", icon: <Compass className="w-5 h-5 text-primary" /> },
    { label: "Community Fund Routing", val: `${communitiesSupported}%`, change: "Direct payments", icon: <Award className="w-5 h-5 text-secondary" /> },
    { label: "Broker Commissions Saved", val: `₹${savedAggregatorCash}`, change: "Zero middleman taxes", icon: <TrendingUp className="w-5 h-5 text-success" /> }
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb items={[{ name: "Dashboard" }]} />
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white pt-1">
            Welcome back, {user?.name || "Explorer"}
          </h1>
          <p className="text-xs text-slate-500 font-medium">Control panel for your local travel itineraries.</p>
        </div>

        <button
          onClick={() => navigate("/planner")}
          className="btn-primary py-2.5 px-5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-sm"
        >
          <PlusCircle className="h-4.5 w-4.5" /> Plan New Trip
        </button>
      </div>

      {/* KPI Stats Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((st, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-150 dark:border-slate-805 space-y-2 flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{st.label}</span>
              <div className="text-2xl font-heading font-extrabold text-slate-805 dark:text-white">{st.val}</div>
              <span className="text-[10px] text-slate-400 block font-medium">{st.change}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 shrink-0">
              {st.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Active Itineraries vs Operator Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Column Left: Saved Trips list (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-1.5">
              <BarChart2 className="h-5 w-5 text-primary" /> Active & Saved Itineraries
            </h2>
            <span className="text-[10px] font-bold text-slate-400">{savedItineraries.length} trip schedule{savedItineraries.length > 1 ? "s" : ""} saved</span>
          </div>

          {savedItineraries.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-3xl space-y-4">
              <Compass className="h-10 w-10 text-slate-350 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-sm text-slate-805 dark:text-slate-205">No itineraries in your dashboard</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Start configuring parameters inside the planner to build local-supporting itineraries.
                </p>
              </div>
              <button
                onClick={() => navigate("/planner")}
                className="btn-primary py-2 px-4 rounded-xl text-xs font-semibold inline-flex"
              >
                Plan Itinerary now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {savedItineraries.map((itinerary) => (
                <TripCard key={itinerary.id} itinerary={itinerary} isSaved={true} />
              ))}
            </div>
          )}
        </div>

        {/* Column Right: Community Impact feed (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 bg-white dark:bg-dark-card/90">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
              Community Hub Feed
            </h3>
            
            <div className="space-y-4">
              
              <div className="flex gap-3 items-start border-l-2 border-teal-500 pl-3 py-0.5">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase text-secondary font-mono">STAY VERIFIED</span>
                  <h4 className="font-bold text-xs leading-none text-slate-805 dark:text-white">Casa Da Flora Restored</h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    D'Souza family cleared annual tourism audit. Goa tax union rated 4.9.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start border-l-2 border-primary pl-3 py-0.5">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase text-primary font-mono">GUIDE ALERT</span>
                  <h4 className="font-bold text-xs leading-none text-slate-805 dark:text-white">Dev Thakur (Mountaineer)</h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    Dev posted new weather safety checks for Solang Valley passes.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start border-l-2 border-accent pl-3 py-0.5">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase text-accent font-mono">SYSTEM NEWS</span>
                  <h4 className="font-bold text-xs leading-none text-slate-805 dark:text-white">Zero aggregator commissions</h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    Successfully bypassed ₹45K of middleman commissions for users in Kerala.
                  </p>
                </div>
              </div>

            </div>

            <Link
              to="/vendors"
              className="btn-outline dark:text-white dark:border-slate-800 w-full rounded-xl py-2 text-[10px] font-bold flex items-center justify-center gap-1"
            >
              Browse Vendor Local Directory <Compass className="w-3.5 h-3.5" />
            </Link>

          </div>
        </div>

      </div>

    </div>
  );
};
