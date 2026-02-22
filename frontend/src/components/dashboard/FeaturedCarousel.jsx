// components/dashboard/FeaturedCarousel.jsx
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
      className="carousel-item w-72 md:w-80 rounded-2xl overflow-hidden cursor-pointer group relative"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => navigate(`/heritage/${site.id}`)}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={imgUrl}
          alt={site.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${site.id}/600/400`; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-dark via-stone-dark/40 to-transparent" />

        {/* UNESCO badge */}
        {site.unesco_site && (
          <div className="absolute top-3 right-3">
            <GradientBadge color="gold">★ UNESCO</GradientBadge>
          </div>
        )}

        {/* Category */}
        <div className="absolute top-3 left-3">
          <GradientBadge color="cream">{site.category}</GradientBadge>
        </div>
      </div>

      {/* Card content */}
      <div className="glass-dark p-4 border-t border-gold/10">
        <h3 className="font-display text-lg text-cream leading-tight mb-1 group-hover:text-gold-light transition-colors duration-300">
          {site.name}
        </h3>
        {site.tamil_name && (
          <p className="text-cream/40 text-sm mb-2">{site.tamil_name}</p>
        )}
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
        {/* Hover CTA */}
        <div className="mt-3 h-px bg-gradient-to-r from-gold/0 via-gold/30 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <p className="text-gold/0 group-hover:text-gold/60 text-xs mt-2 transition-all duration-300 flex items-center gap-1">
          Explore site <span>→</span>
        </p>
      </div>
    </div>
  );
}

export function FeaturedCarousel() {
  const scrollRef = useRef(null);
  const timerRef  = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const { data, loading } = useFetch(() =>
    api.getHeritage(1, 16)
  );

  const sites = data?.items || [];

  // Auto-scroll
  useEffect(() => {
    if (!sites.length || isPaused) return;
    timerRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 304, behavior: "smooth" });
      }
    }, 3200);
    return () => clearInterval(timerRef.current);
  }, [sites.length, isPaused]);

  // Skeleton loader
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-xl text-cream/80">Featured Sites</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
        <span className="text-cream/30 text-xs font-mono">{sites.length} sites</span>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="carousel-scroll flex gap-4 pb-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {sites.map((site, i) => (
          <HeritageCard key={site.id} site={site} index={i} />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {[...Array(Math.ceil(sites.length / 3))].map((_, i) => (
          <div
            key={i}
            className="h-0.5 rounded-full bg-gold/20 transition-all duration-300"
            style={{ width: i === 0 ? 24 : 8 }}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturedCarousel;
