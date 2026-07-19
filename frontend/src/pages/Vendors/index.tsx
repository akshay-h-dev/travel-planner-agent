import React, { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { VendorCard } from "../../components/vendor/VendorCard";
import { MOCK_HOMESTAYS, MOCK_GUIDES, MOCK_ACTIVITIES } from "../../services/mockData";

export const Vendors: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Homestays", "Guides", "Activities"];

  // Compile unified vendor view for directory
  const unifiedVendors = [
    ...MOCK_HOMESTAYS.map(h => ({
      id: h.id,
      name: h.name,
      photo: h.imageUrl,
      rating: h.rating,
      distance: "1.2 km",
      price: `₹${h.pricePerNight} / night`,
      category: "Homestays",
      isLocal: h.isLocal,
      description: h.description
    })),
    ...MOCK_GUIDES.map(g => ({
      id: g.id,
      name: g.name,
      photo: g.avatarUrl,
      rating: g.rating,
      distance: "0.5 km",
      price: `₹${g.pricePerDay} / day`,
      category: "Guides",
      isLocal: g.isLocal,
      description: g.bio
    })),
    ...MOCK_ACTIVITIES.map(a => ({
      id: a.id,
      name: a.name,
      photo: a.imageUrl,
      rating: a.rating,
      distance: "2.8 km",
      price: `₹${a.price} / ticket`,
      category: "Activities",
      isLocal: a.isLocal,
      description: a.description
    }))
  ];

  const filtered = unifiedVendors.filter(v => {
    const matchesCat = filterCategory === "All" || v.category === filterCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      
      {/* Head section */}
      <div className="space-y-2">
        <Breadcrumb items={[{ name: "Local operator directory" }]} />
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-805 dark:text-white pt-1 flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-secondary" />
          Verified Local Operator Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 max-w-2xl leading-relaxed">
          TripWay directly hosts rural families, tribal guides, and regional cooperatives. All earnings bypass aggregator listing taxes.
        </p>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                filterCategory === cat
                  ? "bg-secondary/15 border-secondary text-secondary"
                  : "border-slate-205 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Text Search bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search operators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium pl-10"
          />
        </div>

      </div>

      {/* Grid listing */}
      {filtered.length === 0 ? (
        <div className="p-12 border border-dashed rounded-3xl text-center text-slate-450">
          No verified directory listings match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((vend) => (
            <VendorCard
              key={vend.id}
              photo={vend.photo}
              name={vend.name}
              rating={vend.rating}
              distance={vend.distance}
              price={vend.price}
              category={vend.category}
              isLocal={vend.isLocal}
              description={vend.description}
            />
          ))}
        </div>
      )}

    </div>
  );
};
