// components/dashboard/RecommendationPanel.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch.js";
import { GlassCard } from "../ui/GlassCard.jsx";
import { GradientBadge, AnimatedButton } from "../ui/index.jsx";
import api from "../../services/api.js";

// ── UNESCO Quick Toggle ──────────────────────────────────────────────────────
function UNESCOToggle() {
  const navigate = useNavigate();
  const { data, loading } = useFetch(() => api.getUnescoAnalysis());

  const sites = data?.sites || [];

  return (
    <GlassCard hover={false} className="p-5 border border-gold/15">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gold text-sm">★</span>
          <h3 className="font-display text-base text-cream/90">UNESCO World Heritage</h3>
        </div>
        <GradientBadge color="gold">{data?.total_unesco_sites || 4} Sites</GradientBadge>
      </div>

      <div className="flex flex-col gap-2">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-stone-light/30 animate-pulse" />
            ))
          : sites.slice(0, 4).map((site) => (
              <button
                key={site.id}
                onClick={() => navigate(`/heritage/${site.id}`)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/8 border border-transparent hover:border-gold/20 transition-all duration-300 text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-gold/12 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-xs">★</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cream/80 text-sm font-medium truncate group-hover:text-gold-light transition-colors">
                    {site.name}
                  </p>
                  <p className="text-cream/35 text-xs truncate">{site.district}</p>
                </div>
                <span className="text-cream/20 group-hover:text-gold/50 text-xs transition-colors">→</span>
              </button>
            ))
        }
      </div>

      <button
        onClick={() => navigate("/map?filter=unesco")}
        className="mt-4 w-full py-2 rounded-xl border border-gold/20 text-gold/60 text-xs hover:bg-gold/8 hover:text-gold hover:border-gold/40 transition-all"
      >
        View all UNESCO sites →
      </button>
    </GlassCard>
  );
}

// ── Category Quick Filter ────────────────────────────────────────────────────
function CategoryFilter() {
  const navigate = useNavigate();
  const { data } = useFetch(() => api.getCategories());
  const [active, setActive] = useState(null);

  const categories = data?.categories || [];

  const ICONS = {
    Temple: "⛩", Fort: "🏰", Palace: "🏛", Church: "⛪",
    Monument: "◉", "Archaeological Site": "◈", Museum: "◎", "Natural Heritage": "◉",
  };

  return (
    <GlassCard hover={false} className="p-5 border border-gold/15">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base text-cream/90">By Category</h3>
        <span className="text-cream/30 text-xs font-mono">{categories.length} types</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => {
              setActive(cat.category === active ? null : cat.category);
              navigate(`/map?category=${encodeURIComponent(cat.category)}`);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
              border transition-all duration-300
              ${active === cat.category
                ? "bg-gold/15 border-gold/40 text-gold"
                : "border-stone-mid/60 text-cream/50 hover:border-gold/30 hover:text-cream/80"
              }
            `}
          >
            <span>{ICONS[cat.category] || "◉"}</span>
            {cat.category}
            <span className="text-cream/25 font-mono text-[10px]">{cat.count}</span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Mini Map Preview ─────────────────────────────────────────────────────────
function MiniMapPreview() {
  const navigate = useNavigate();

  return (
    <GlassCard hover={false} className="p-5 border border-gold/15 relative overflow-hidden">
      {/* Fake map background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 dot-grid" />
        {/* Tamil Nadu outline hint */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[80px] opacity-10 select-none pointer-events-none text-gold">
          ▲
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base text-cream/90">Map Preview</h3>
          <GradientBadge color="jade">49 Markers</GradientBadge>
        </div>

        {/* Simulated map dots */}
        <div className="relative h-40 rounded-xl overflow-hidden bg-stone-light/20 border border-gold/10 mb-4">
          <div className="absolute inset-0 dot-grid opacity-50" />
          {/* District markers (decorative) */}
          {[
            { x: "48%", y: "30%", label: "Thanjavur" },
            { x: "35%", y: "75%", label: "Madurai" },
            { x: "70%", y: "15%", label: "Chennai" },
            { x: "20%", y: "55%", label: "Coimbatore" },
            { x: "60%", y: "80%", label: "Kanyakumari" },
          ].map((m) => (
            <div
              key={m.label}
              className="absolute flex flex-col items-center cursor-pointer group"
              style={{ left: m.x, top: m.y, transform: "translate(-50%, -50%)" }}
            >
              <div className="w-3 h-3 rounded-full bg-gold border-2 border-stone-dark group-hover:scale-150 transition-transform duration-200 shadow-gold-sm animate-pulse-gold" />
              <span className="text-[8px] text-gold/60 mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        <AnimatedButton
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => navigate("/map")}
        >
          <span>◈</span> Open Full Map
        </AnimatedButton>
      </div>
    </GlassCard>
  );
}

// ── Dynasty Chart ────────────────────────────────────────────────────────────
function DynastyPanel() {
  const { data } = useFetch(() => api.getDynasties());
  const dynasties = (data?.dynasties || []).slice(0, 6);
  const max = Math.max(...dynasties.map((d) => d.count), 1);

  return (
    <GlassCard hover={false} className="p-5 border border-gold/15">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base text-cream/90">By Dynasty</h3>
        <span className="text-cream/30 text-xs font-mono">{dynasties.length} dynasties</span>
      </div>

      <div className="flex flex-col gap-3">
        {dynasties.map((d, i) => (
          <div key={d.dynasty} className="flex items-center gap-3">
            <span className="text-cream/40 text-xs w-4 font-mono">{i + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-cream/70 text-xs">{d.dynasty}</span>
                <span className="text-gold/60 text-xs font-mono">{d.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-light/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-1000"
                  style={{ width: `${(d.count / max) * 100}%`, animationDelay: `${i * 0.1}s` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────
export function RecommendationPanel() {
  return (
    <section className="px-6 mt-8 pb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-xl text-cream/80">Discover More</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <UNESCOToggle />
        <CategoryFilter />
        <MiniMapPreview />
        <DynastyPanel />
      </div>
    </section>
  );
}

export default RecommendationPanel;
