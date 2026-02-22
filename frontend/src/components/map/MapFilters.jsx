// components/map/MapFilters.jsx
import { useState, useEffect } from "react";
import { GradientBadge, AnimatedButton } from "../ui/index.jsx";
import useFetch from "../../hooks/useFetch.js";
import api from "../../services/api.js";

const CATEGORY_ICONS = {
  Temple: "⛩", Fort: "🏰", Palace: "🏛", Church: "⛪",
  Monument: "◉", "Archaeological Site": "◈", Museum: "◎", "Natural Heritage": "🌿",
};

export function MapFilters({ filters, onFilterChange }) {
  const [expanded, setExpanded] = useState(true);
  const { data: categoriesData } = useFetch(() => api.getCategories());
  const { data: districtsData } = useFetch(() => api.getDistricts());

  const categories = categoriesData?.categories || [];
  const districts = (districtsData?.districts || []).map((d) => d.district);

  const toggleCategory = (cat) => {
    onFilterChange({
      ...filters,
      category: filters.category === cat ? null : cat,
    });
  };

  const toggleDistrict = (dist) => {
    onFilterChange({
      ...filters,
      district: filters.district === dist ? null : dist,
    });
  };

  const toggleUnesco = () => {
    onFilterChange({
      ...filters,
      unescoOnly: !filters.unescoOnly,
    });
  };

  const clearFilters = () => {
    onFilterChange({ category: null, district: null, unescoOnly: false });
  };

  const activeCount = [filters.category, filters.district, filters.unescoOnly].filter(Boolean).length;

  return (
    <div className="glass-dark rounded-2xl p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gold text-lg">◈</span>
          <h3 className="font-display text-base text-cream">Filters</h3>
          {activeCount > 0 && (
            <GradientBadge color="gold" className="text-[10px]">
              {activeCount}
            </GradientBadge>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-cream/40 hover:text-cream transition-colors"
        >
          {expanded ? "−" : "+"}
        </button>
      </div>

      {expanded && (
        <>
          {/* UNESCO Toggle */}
          <div className="mb-4">
            <button
              onClick={toggleUnesco}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl
                border transition-all duration-300
                ${filters.unescoOnly
                  ? "bg-gold/15 border-gold/40 text-gold"
                  : "border-stone-mid/40 text-cream/50 hover:border-gold/30"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">★</span>
                <span className="text-sm font-medium">UNESCO Only</span>
              </div>
              <span className="text-xs opacity-60">4 sites</span>
            </button>
          </div>

          {/* Category Filters */}
          <div className="mb-4">
            <p className="text-cream/40 text-xs uppercase tracking-wide mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => toggleCategory(cat.category)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                    border transition-all duration-300
                    ${filters.category === cat.category
                      ? "bg-gold/15 border-gold/40 text-gold"
                      : "border-stone-mid/40 text-cream/50 hover:border-gold/30"
                    }
                  `}
                >
                  <span>{CATEGORY_ICONS[cat.category] || "◉"}</span>
                  {cat.category}
                  <span className="text-[10px] opacity-50">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* District Filters */}
          <div className="mb-4">
            <p className="text-cream/40 text-xs uppercase tracking-wide mb-2">District</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {districts.slice(0, 10).map((dist) => (
                <button
                  key={dist}
                  onClick={() => toggleDistrict(dist)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-xs
                    transition-all duration-300
                    ${filters.district === dist
                      ? "bg-gold/10 text-gold border border-gold/30"
                      : "text-cream/50 hover:bg-stone-light/30"
                    }
                  `}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {/* Clear All */}
          {activeCount > 0 && (
            <AnimatedButton
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={clearFilters}
            >
              Clear all filters
            </AnimatedButton>
          )}
        </>
      )}
    </div>
  );
}

export default MapFilters;
