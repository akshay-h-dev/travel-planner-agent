import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, CheckCircle, Award, ArrowUpRight } from "lucide-react";
import { MOCK_CITIES, MOCK_ACTIVITIES } from "../../services/mockData";

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const partners = ["IIT Delhi", "BITS Pilani", "Delhi University", "VIT University", "Manipal Academy"];

  return (
    <div className="flex-1 gradient-bg pb-12">
      
      {/* Cinematic Hero Section */}
      <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 py-8">
        
        {/* Background Image Panel */}
        <div className="absolute inset-0 bg-cover bg-center z-0 scale-105 select-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1700&q=80')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-slate-950/70 z-0"></div>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center text-center relative z-10 text-white">
          
          {/* Main slogans title */}
          <div className="max-w-3xl space-y-6 flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 backdrop-blur-sm text-xs font-bold font-mono tracking-wide animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              AI DYNAMIC REPLANNING ITINERARIES
            </span>
            
            <h1 className="font-heading font-extrabold text-4xl sm:text-6xl tracking-tight leading-tight">
              Plan Smarter.<br />
              <span className="bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
                Travel Better.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg font-medium mx-auto">
              TripWay is the only AI-powered itinerary engine that automatically adjusts items when costs change while prioritising high-rated local guides, homestays, and small family operators.
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/planner")}
                className="btn-primary py-3 px-6 text-sm font-semibold rounded-xl"
              >
                Start AI Planning <ChevronRight className="h-4 w-4" />
              </button>
              <a
                href="#how-it-works"
                className="btn-outline border-white/20 text-white hover:bg-white/10 py-3 px-6 text-sm font-semibold rounded-xl flex items-center justify-center gap-1"
              >
                Watch Video Demo
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Trusted students logo banner */}
      <div className="py-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/20 dark:bg-dark-card/25 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-3">
            TRUSTED BY STUDENTS & BACKPACKERS AT LEADING INSTITUTIONS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-50 dark:opacity-40">
            {partners.map((pt, idx) => (
              <span key={idx} className="font-heading font-extrabold text-sm sm:text-base text-slate-500 dark:text-slate-300 tracking-wider">
                {pt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* How TripWay works section */}
      <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white">
            How TripWay Refactors Travel
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            A three-step loop that protects your pocket while funding regional eco-tourism operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card rounded-3xl p-6 border border-slate-150 dark:border-slate-800 space-y-3 relative group">
            <span className="text-4xl text-primary/10 group-hover:text-primary/20 font-heading font-black absolute top-4 right-6 select-none transition-colors">01</span>
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
              ⚙
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white">1. Core Settings Scan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
              Define your target budget, interest vectors, and dates. Our AI maps destination activities from actual verified operator catalogs.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-150 dark:border-slate-800 space-y-3 relative group">
            <span className="text-4xl text-secondary/10 group-hover:text-secondary/20 font-heading font-black absolute top-4 right-6 select-none transition-colors">02</span>
            <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary font-bold">
              🛠
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white">2. Auto Local allocation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
              We bypass corporate aggregator commissions, routing your stay and guide expenses directly to high-rated regional hosts and taxi cooperatives.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-150 dark:border-slate-800 space-y-3 relative group">
            <span className="text-4xl text-accent/15 group-hover:text-accent/25 font-heading font-black absolute top-4 right-6 select-none transition-colors">03</span>
            <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent font-bold">
              ⚡
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white">3. Dynamic Replan Engine</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
              If prices flare or you swap actions, the AI replan engine recalculates variables instantly to stay beneath your set budget cap.
            </p>
          </div>

        </div>
      </section>

      {/* Sustainable local section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Visual blocks */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80" alt="Homestay" className="rounded-2xl h-44 w-full object-cover shadow-md" />
          <img src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=300&q=80" alt="Local guide" className="rounded-2xl h-44 w-full object-cover shadow-md mt-6" />
        </div>

        {/* Text descriptions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary dark:text-teal-400">IMPACT DRIVEN SYSTEM</span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white">
              Why Routing Travels to Local Operators Matters
            </h2>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Almost 75% of travel expenditure typically flows to overseas aggregator hubs (corporate commissions, listing tolls). That leaves villages depleted. TripWay aims to solve this leakage:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
            
            <div className="flex gap-2 items-start text-slate-700 dark:text-slate-350">
              <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
              <div>
                <h4 className="font-bold text-xs">Direct Host Settlement</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed">Hosts keep 100% of room rates with zero aggregator commission cuts.</p>
              </div>
            </div>

            <div className="flex gap-2 items-start text-slate-700 dark:text-slate-350">
              <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
              <div>
                <h4 className="font-bold text-xs">Certified Regional Guides</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed">Hire native storytellers and tribal elders who verify safe hiking tracks.</p>
              </div>
            </div>

            <div className="flex gap-2 items-start text-slate-700 dark:text-slate-350">
              <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
              <div>
                <h4 className="font-bold text-xs">Carbon-Free Commuting</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed">Promotes regional electric scooters and taxi unions over commercial aggregators.</p>
              </div>
            </div>

            <div className="flex gap-2 items-start text-slate-700 dark:text-slate-350">
              <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
              <div>
                <h4 className="font-bold text-xs">Verified Organic Cafes</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed">Eat freshly harvested food grown directly in surrounding forest plantations.</p>
              </div>
            </div>

          </div>

          <button
            onClick={() => navigate("/about")}
            className="btn-outline dark:text-white dark:border-slate-800 text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1"
          >
            Learn About Sustainable Tourism <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </section>

      {/* Featured destinations section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white">
              Explore Featured Regional hubs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Curated locations featuring rich mock itineraries, guides, and stays.
            </p>
          </div>
          
          <button
            onClick={() => navigate("/planner")}
            className="btn-primary rounded-xl py-2 px-4 text-xs font-semibold"
          >
            Open Planner Wizard <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CITIES.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                navigate("/planner", { state: { cityId: c.name } });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="glass-card hover:bg-slate-50/20 border border-slate-205 dark:border-slate-800 rounded-3xl overflow-hidden group cursor-pointer transition-all duration-350 shadow-premium"
            >
              <div className="h-48 w-full overflow-hidden bg-slate-105 relative">
                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <h3 className="absolute bottom-4 left-4 font-heading font-extrabold text-base text-white">
                  {c.name}, <span className="text-secondary-light font-sans font-medium">{c.state}</span>
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                  {c.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.highlights.map((h, i) => (
                    <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-350 px-2 py-0.5 rounded-md font-medium">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular local experiences row */}
      <section className="py-16 bg-white/30 dark:bg-dark-card/20 border-y border-slate-200/50 dark:border-slate-805/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
              Trending Cultural Experiences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Host experiences backed by centuries of heritage, certified on our index.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_ACTIVITIES.slice(0, 4).map((act) => (
              <div key={act.id} className="bg-white dark:bg-dark-card border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div className="h-32 w-full bg-slate-100 overflow-hidden relative">
                  <img src={act.imageUrl} alt={act.name} className="w-full h-full object-cover" />
                  {act.isLocal && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-500 text-white flex items-center gap-0.5 shadow-sm">
                      <Award className="h-2.5 w-2.5" /> LOCAL
                    </span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-medium text-slate-400 block">{act.category}</span>
                    <h4 className="font-heading font-bold text-xs text-slate-800 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {act.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{act.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold">
                    <span className="text-slate-700 dark:text-slate-350">₹{act.price} / seat</span>
                    <span className="text-accent">★ {act.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-extrabold text-2xl text-slate-850 dark:text-white">
            Loved by Conscious Travelers
          </h2>
          <p className="text-xs text-slate-500">
            Read testimonials from students, backpacking experts, and professors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4">
            <span className="text-yellow-400 text-sm">★★★★★</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              "We planned a graduation backpacking trip to Wayanad with a strict budget of 15k. TripWay automatically replaced commercial guides and stays with Mr. Abraham's local treehouse farm. Saved 6k and learned organic coffee harvests!"
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-205 flex items-center justify-center font-bold text-xs text-slate-550">
                AS
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Aditya Shukla</h4>
                <p className="text-[9px] text-slate-400 font-medium">IIT Delhi Grad Student</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4">
            <span className="text-yellow-400 text-sm">★★★★★</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              "I swap activities all the time. On general sites, doing that breaks the budget tracker. TripWay's AI auto-replans the transportation models to fit the rest under the cap. Absolutely revolutionary frontend dashboard!"
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-205 flex items-center justify-center font-bold text-xs text-slate-555">
                KP
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Kriti Patel</h4>
                <p className="text-[9px] text-slate-400 font-medium">Solo Backpacker</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-4">
            <span className="text-yellow-400 text-sm">★★★★★</span>
            <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed font-medium">
              "Supporting remote villagers without losing safety certification is tough. TripWay routes resources to union taxi drivers and verified hosts. Safe, robust, and truly a 100% sustainable innovation."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-205 flex items-center justify-center font-bold text-xs text-slate-500">
                DR
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Dr. Rakesh Sen</h4>
                <p className="text-[9px] text-slate-400 font-medium">Sustainability Professor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
