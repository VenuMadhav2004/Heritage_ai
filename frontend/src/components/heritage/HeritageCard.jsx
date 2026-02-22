// components/heritage/HeritageCard.jsx
import { GradientBadge } from "../ui/GradientBadge";
import api from "../../services/api";

export function HeritageCard({ site, onClick, compact = false }) {
  return (
    <div
      onClick={() => onClick?.(site)}
      className="group rounded-2xl overflow-hidden cursor-pointer bg-[#12121A] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(201,168,76,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(201,168,76,0.06)]"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: compact ? "140px" : "200px" }}>
        <img
          src={api.imageUrl(site.image_url)}
          alt={site.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={e => { e.target.src = `https://picsum.photos/seed/${site.id}/400/300`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121A] via-[rgba(18,18,26,0.3)] to-transparent" />
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {site.unesco_site && <GradientBadge variant="jade" className="text-[10px] py-0.5 px-2">🌍 UNESCO</GradientBadge>}
        </div>
        {/* Category pill bottom right */}
        <div className="absolute bottom-3 right-3">
          <GradientBadge variant="gold" className="text-[10px] py-0.5 px-2">{site.category}</GradientBadge>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-display text-xl text-white leading-tight mb-0.5 group-hover:text-[#E8C96A] transition-colors duration-200 line-clamp-1">
          {site.name}
        </h3>
        {site.tamil_name && !compact && (
          <p className="font-['Noto_Serif_Tamil'] text-[#C9A84C] text-xs mb-2 opacity-70">{site.tamil_name}</p>
        )}
        <div className="flex items-center gap-3 text-[#6B6B8F] text-xs">
          <span className="flex items-center gap-1"><span className="text-[#C9A84C]">📍</span>{site.district}</span>
          {site.dynasty && <span className="flex items-center gap-1"><span className="text-[#C9A84C]">⚔️</span>{site.dynasty}</span>}
        </div>
        {!compact && site.description && (
          <p className="text-[#A0A0C0] text-xs mt-3 leading-relaxed line-clamp-2">{site.description}</p>
        )}
      </div>
    </div>
  );
}

export default HeritageCard;
