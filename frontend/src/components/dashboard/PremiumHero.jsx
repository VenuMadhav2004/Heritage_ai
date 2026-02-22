// components/dashboard/PremiumHero.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedButton } from "../ui/index.jsx";

const ROTATING_WORDS = ["Heritage", "History", "Dynasties", "Architecture", "Temples"];

export function PremiumHero({ totalSites = 49, unescoCount = 4 }) {
  const navigate = useNavigate();
  const [wordIdx, setWordIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="relative min-h-[520px] flex items-center overflow-hidden rounded-3xl mx-6 mt-6">

      {/* ── Layered background ──────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-hero-mesh" />
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Decorative orbs */}
      <div className="absolute top-12 right-24 w-64 h-64 rounded-full opacity-10 animate-float"
           style={{ background: "radial-gradient(circle, #C9A84C, transparent 70%)" }} />
      <div className="absolute bottom-0 left-1/2 w-96 h-40 opacity-8"
           style={{ background: "radial-gradient(ellipse, #C4622D40, transparent 70%)" }} />
      <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-5 animate-float"
           style={{ animationDelay: "2s", background: "radial-gradient(circle, #2D7A5F, transparent 70%)" }} />

      {/* Geometric decorations */}
      <div className="absolute top-8 right-8 w-32 h-32 border border-gold/10 rounded-2xl rotate-12" />
      <div className="absolute top-12 right-12 w-24 h-24 border border-gold/5 rounded-xl rotate-6" />
      <div className="absolute bottom-8 right-40 w-2 h-2 rounded-full bg-gold/40 animate-pulse" />
      <div className="absolute top-20 left-1/2 w-1.5 h-1.5 rounded-full bg-gold/30 animate-pulse" style={{ animationDelay: "1s" }} />

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-12 py-16 max-w-3xl">

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <div className="h-px w-8 bg-gold/60" />
          <span className="text-gold/80 text-xs font-mono tracking-[0.25em] uppercase">
            Tamil Nadu · India
          </span>
          <div className="h-px w-8 bg-gold/60" />
        </div>

        {/* Headline */}
        <h1 className="font-display font-light leading-[1.05] mb-6">
          <span className="text-cream text-5xl md:text-6xl block animate-fade-up">Discover the</span>
          <span
            className="text-shimmer text-5xl md:text-7xl block transition-all duration-300"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
          >
            {ROTATING_WORDS[wordIdx]}
          </span>
          <span className="text-cream/60 text-4xl md:text-5xl block animate-fade-up stagger-3 italic">
            of Tamil Nadu
          </span>
        </h1>

        {/* Sub */}
        <p className="text-cream/50 text-base leading-relaxed max-w-lg mb-10 animate-fade-up stagger-4">
          Explore {totalSites} monumental heritage sites spanning millennia —
          from Chola temples to colonial forts. AI-guided, voice-narrated,
          across {unescoCount} UNESCO World Heritage Sites.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 animate-fade-up stagger-5">
          <AnimatedButton variant="gold" size="lg" onClick={() => navigate("/map")}>
            <span>◈</span> Explore Map
          </AnimatedButton>
          <AnimatedButton variant="ghost" size="lg" onClick={() => navigate("/ai")}>
            <span>✦</span> Ask AI
          </AnimatedButton>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-8 mt-12 animate-fade-up stagger-6">
          {[
            { val: totalSites, label: "Heritage Sites" },
            { val: unescoCount,   label: "UNESCO Sites" },
            { val: "22+",     label: "Districts" },
            { val: "11",      label: "Languages" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="font-display text-gold text-2xl font-semibold">{s.val}</span>
              <span className="text-cream/35 text-xs tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right decorative panel ───────────────────────────────────────── */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
        {["Temple", "Fort", "Palace", "Monument"].map((cat, i) => (
          <button
            key={cat}
            onClick={() => navigate(`/map?category=${cat}`)}
            className="glass px-4 py-2.5 rounded-xl text-xs text-cream/50 hover:text-gold hover:border-gold/30 transition-all duration-300 text-left min-w-[110px] animate-slide-left"
            style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
          >
            <span className="text-gold/40 mr-2">›</span>{cat}
          </button>
        ))}
      </div>

    </section>
  );
}

export default PremiumHero;
