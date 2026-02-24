// components/dashboard/FeaturedCarousel.jsx — Slower + Speed Controls
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch.js";
import { GradientBadge } from "../ui/index.jsx";
import api from "../../services/api.js";

function HeritageCard({ site, index }) {
  const navigate = useNavigate();
  const imgUrl = api.imageUrl(site.image_url) || `https://picsum.photos/seed/${site.id}/600/400`;

  return (
    <div
      className="carousel-item w-72 md:w-80 rounded-2xl overflow-hidden cursor-pointer group relative flex-shrink-0"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => navigate(`/heritage/${site.id}`)}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={imgUrl}
          alt={site.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${site.id}/600/400`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-dark via-stone-dark/40 to-transparent" />

        {site.unesco_site && (
          <div className="absolute top-3 right-3">
            <GradientBadge color="gold">★ UNESCO</GradientBadge>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <GradientBadge color="cream">{site.category}</GradientBadge>
        </div>
      </div>

      <div className="glass-dark p-4 border-t border-gold/10">
        <h3 className="font-display text-lg text-cream leading-tight mb-1 group-hover:text-gold-light transition-colors">
          {site.name}
        </h3>
        {site.tamil_name && <p className="text-cream/40 text-sm mb-2">{site.tamil_name}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cream/40 text-xs">
            <span className="text-gold/50">◈</span>
            {site.district}
          </div>
          {site.dynasty && (
            <span className="text-[10px] text-gold/50 font-mono bg-gold/8 px-2 py-0.5 rounded-full border border-gold/15">
              {site.dynasty}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeaturedCarousel() {
  const scrollRef = useRef(null);
  const timerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState("slow"); // slow=8s, medium=5s, fast=3s

  const { data, loading } = useFetch(() => api.getHeritage(1, 16));
  const sites = data?.items || [];

  const SPEEDS = { slow: 8000, medium: 5000, fast: 3000 };

  useEffect(() => {
    if (!sites.length || isPaused) return;

    timerRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 320, behavior: "smooth" });
      }
    }, SPEEDS[speed]);

    return () => clearInterval(timerRef.current);
  }, [sites.length, isPaused, speed]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 320, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="px-6 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-display text-xl text-cream/80">Featured Sites</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
        </div>
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-72 h-72 rounded-2xl bg-stone-light/30 animate-pulse flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 mt-8">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-xl text-cream/80">Featured Sites</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
        
        {/* Speed controls */}
        <div className="flex items-center gap-2">
          <span className="text-cream/30 text-xs">Speed:</span>
          {["slow", "medium", "fast"].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded text-[10px] uppercase tracking-wide transition-all ${
                speed === s
                  ? "bg-gold/20 text-gold border border-gold/40"
                  : "text-cream/40 hover:text-cream/60 border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="text-cream/30 text-xs font-mono">{sites.length}</span>
      </div>

      <div className="relative group/carousel">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-dark border border-gold/20 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-gold/20 transition-all"
        >
          <span className="text-gold text-xl">←</span>
        </button>

        <button
          onClick={() => scroll(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass-dark border border-gold/20 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-gold/20 transition-all"
        >
          <span className="text-gold text-xl">→</span>
        </button>

        <div
          ref={scrollRef}
          className="carousel-scroll flex gap-4 pb-4 scroll-smooth"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {sites.map((site, i) => (
            <HeritageCard key={site.id} site={site} index={i} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3">
        {isPaused && (
          <span className="text-gold/60 text-xs flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-gold/60 animate-pulse" />
            Paused
          </span>
        )}
        <div className="flex gap-2">
          {[...Array(Math.ceil(sites.length / 3))].map((_, i) => (
            <div key={i} className="h-0.5 rounded-full bg-gold/20" style={{ width: i === 0 ? 24 : 8 }} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCarousel;