// components/dashboard/StatsPanel.jsx
import { useEffect, useRef, useState } from "react";
import { GlassCard } from "../ui/GlassCard.jsx";
import useFetch from "../../hooks/useFetch.js";
import api from "../../services/api.js";

function AnimatedCounter({ target, duration = 1800, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!target || started.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

const STAT_CONFIG = [
  {
    key: "total",
    label: "Heritage Sites",
    icon: "◉",
    color: "gold",
    suffix: "",
    desc: "Across Tamil Nadu",
  },
  {
    key: "unesco",
    label: "UNESCO Sites",
    icon: "★",
    color: "ember",
    suffix: "",
    desc: "World Heritage",
  },
  {
    key: "districts",
    label: "Districts",
    icon: "◈",
    color: "jade",
    suffix: "+",
    desc: "Coverage",
  },
  {
    key: "dynasties",
    label: "Dynasties",
    icon: "⬡",
    color: "gold",
    suffix: "",
    desc: "Historical periods",
  },
];

const COLOR_MAP = {
  gold:  { text: "text-gold",  border: "border-gold/20",  bg: "bg-gold/8",  glow: "rgba(201,168,76,0.15)" },
  ember: { text: "text-ember", border: "border-ember/20", bg: "bg-ember/8", glow: "rgba(196,98,45,0.15)" },
  jade:  { text: "text-jade",  border: "border-jade/20",  bg: "bg-jade/8",  glow: "rgba(45,122,95,0.15)" },
};

export function StatsPanel() {
  const { data, loading } = useFetch(() => api.getDashboard());

  const overview = data?.overview || {};

  const values = {
    total:     overview.total_sites     || 49,
    unesco:    overview.unesco_sites    || 4,
    districts: overview.total_districts || 22,
    dynasties: overview.total_dynasties || 9,
  };

  return (
    <section className="px-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-display text-xl text-cream/80">At a Glance</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIG.map((stat, i) => {
          const c = COLOR_MAP[stat.color];
          return (
            <GlassCard
              key={stat.key}
              hover={false}
              className={`
                p-6 border ${c.border} animate-fade-up
              `}
              style={{ animationDelay: `${i * 0.1}s`,
                       boxShadow: loading ? "none" : `0 0 30px ${c.glow}` }}
            >
              {/* Icon */}
              <div className={`${c.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                <span className={`${c.text} text-lg`}>{stat.icon}</span>
              </div>

              {/* Number */}
              <div className={`font-display text-4xl font-semibold ${c.text} mb-1`}>
                {loading
                  ? <span className="opacity-30">—</span>
                  : <AnimatedCounter target={values[stat.key]} suffix={stat.suffix} />
                }
              </div>

              {/* Label */}
              <p className="text-cream/70 text-sm font-medium">{stat.label}</p>
              <p className="text-cream/30 text-xs mt-0.5">{stat.desc}</p>

              {/* Bottom indicator */}
              <div className={`mt-4 h-0.5 rounded-full bg-gradient-to-r from-${stat.color} to-transparent opacity-40`} />
            </GlassCard>
          );
        })}
      </div>

      {/* AI + Coverage sub-row */}
      {!loading && overview.ai_generation && (
        <div className="mt-4 glass rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-jade animate-pulse" />
            <span className="text-cream/50 text-sm">AI Content Generated</span>
            <span className="text-gold font-mono text-sm font-medium">
              {overview.ai_generation.total_generated} entries
            </span>
          </div>
          <div className="h-px flex-1 bg-gold/10" />
          <div className="flex items-center gap-3">
            <span className="text-cream/50 text-sm">Image Coverage</span>
            <span className="text-gold font-mono text-sm">
              {overview.media?.image_pct ?? 0}%
            </span>
          </div>
          <div className="h-px w-8 bg-gold/10" />
          <div className="flex items-center gap-3">
            <span className="text-cream/50 text-sm">GPS Coverage</span>
            <span className="text-jade font-mono text-sm">
              {overview.content?.coords_pct ?? 100}%
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default StatsPanel;
