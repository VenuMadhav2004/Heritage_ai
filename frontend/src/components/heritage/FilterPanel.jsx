// components/heritage/FilterPanel.jsx
import { useState } from "react";

const CATEGORIES = ["All", "Temple", "Fort", "Palace", "Monument", "Archaeological Site", "Natural Heritage", "Museum"];
const DYNASTIES  = ["All", "Chola", "Pallava", "Pandya", "Nayak", "Vijayanagara", "British Colonial"];

export function FilterPanel({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  const set = (key, val) => onChange({ ...filters, [key]: val === "All" ? null : val });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* UNESCO toggle */}
      <button
        onClick={() => set("unesco_only", !filters.unesco_only)}
        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${
          filters.unesco_only
            ? "bg-[rgba(46,204,138,0.15)] border-[rgba(46,204,138,0.3)] text-[#2ECC8A]"
            : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#6B6B8F] hover:text-[#2ECC8A] hover:border-[rgba(46,204,138,0.2)]"
        }`}
      >
        🌍 UNESCO Only
      </button>

      {/* Category */}
      <select
        value={filters.category || "All"}
        onChange={e => set("category", e.target.value)}
        className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#A0A0C0] text-xs rounded-xl px-3 py-2 outline-none hover:border-[rgba(201,168,76,0.2)] focus:border-[rgba(201,168,76,0.3)] focus:text-[#C9A84C] transition-all appearance-none cursor-pointer"
      >
        {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#12121A]">{c}</option>)}
      </select>

      {/* Dynasty */}
      <select
        value={filters.dynasty || "All"}
        onChange={e => set("dynasty", e.target.value)}
        className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#A0A0C0] text-xs rounded-xl px-3 py-2 outline-none hover:border-[rgba(201,168,76,0.2)] focus:border-[rgba(201,168,76,0.3)] focus:text-[#C9A84C] transition-all appearance-none cursor-pointer"
      >
        {DYNASTIES.map(d => <option key={d} value={d} className="bg-[#12121A]">{d}</option>)}
      </select>

      {/* Clear */}
      {(filters.category || filters.dynasty || filters.unesco_only) && (
        <button
          onClick={() => onChange({ category: null, dynasty: null, unesco_only: false, query: "" })}
          className="px-3.5 py-2 rounded-xl text-xs border border-[rgba(232,76,106,0.2)] text-[#E84C6A] hover:bg-[rgba(232,76,106,0.08)] transition-all"
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}
export default FilterPanel;
