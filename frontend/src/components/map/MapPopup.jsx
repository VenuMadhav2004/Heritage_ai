// components/map/MapPopup.jsx
import { GradientBadge } from "../ui/GradientBadge";
import api from "../../services/api";

export function MapPopup({ site, onViewDetail }) {
  return (
    <div className="w-64 font-sans">
      {/* Image */}
      <div className="h-32 rounded-t-xl overflow-hidden -mx-3 -mt-3 mb-3">
        <img
          src={api.imageUrl(site.image_url)}
          alt={site.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = `https://picsum.photos/seed/${site.id}/300/150`; }}
        />
      </div>
      {/* Badges */}
      <div className="flex gap-1.5 mb-2 flex-wrap">
        <GradientBadge variant="gold" className="text-[10px]">{site.category}</GradientBadge>
        {site.unesco_site && <GradientBadge variant="jade" className="text-[10px]">🌍 UNESCO</GradientBadge>}
      </div>
      {/* Name */}
      <h3 className="font-['Cormorant_Garamond'] text-lg text-white font-medium leading-tight mb-1">{site.name}</h3>
      {site.tamil_name && <p className="text-[#C9A84C] text-xs mb-2">{site.tamil_name}</p>}
      <p className="text-[#6B6B8F] text-xs mb-3 flex items-center gap-1">📍 {site.district} District</p>
      {site.description && (
        <p className="text-[#A0A0C0] text-xs leading-relaxed mb-3 line-clamp-2">{site.description}</p>
      )}
      <button
        onClick={() => onViewDetail?.(site)}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] text-[#0A0A0F] text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        View Details →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// components/map/MapFilters.jsx
import { GradientBadge } from "../ui/GradientBadge";

const CATS = ["All", "Temple", "Fort", "Palace", "Monument", "Archaeological Site", "Natural Heritage"];

export function MapFilters({ filter, setFilter, unescoOnly, setUnescoOnly, count }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Count badge */}
      <GradientBadge variant="muted">{count} sites</GradientBadge>

      {/* UNESCO toggle */}
      <button
        onClick={() => setUnescoOnly(!unescoOnly)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
          unescoOnly
            ? "bg-[rgba(46,204,138,0.15)] border-[rgba(46,204,138,0.3)] text-[#2ECC8A]"
            : "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#6B6B8F] hover:text-[#2ECC8A]"
        }`}
      >
        🌍 UNESCO
      </button>

      {/* Categories */}
      {CATS.map(cat => (
        <button
          key={cat}
          onClick={() => setFilter(cat === "All" ? null : cat)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            filter === (cat === "All" ? null : cat)
              ? "bg-[rgba(201,168,76,0.15)] border-[rgba(201,168,76,0.3)] text-[#E8C96A]"
              : "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#6B6B8F] hover:text-[#C9A84C]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
