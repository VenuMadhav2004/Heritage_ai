// components/dashboard/PremiumHero.jsx — Horizontal Scrolling Sections
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedButton } from "../ui/index.jsx";

const SECTIONS = [
  {
    id: 1,
    title: "Discover the",
    highlight: "Heritage",
    subtitle: "of Tamil Nadu",
    description: "Explore 80 monumental heritage sites spanning millennia — from Chola temples to colonial forts.",
    cta1: { label: "Explore Map", icon: "🗺", link: "/map" },
    cta2: { label: "Ask AI", icon: "✦", link: "/ai" },
  },
  {
    id: 2,
    title: "Experience the",
    highlight: "History",
    subtitle: "through AI",
    description: "AI-guided tours with voice narration in 11 languages. Ask questions, generate stories, explore dynasties.",
    cta1: { label: "AI Explorer", icon: "✦", link: "/ai" },
    cta2: { label: "View Stories", icon: "📖", link: "/stories" },
  },
  {
    id: 3,
    title: "Explore",
    highlight: "Dynasties",
    subtitle: "& Architecture",
    description: "Chola, Pallava, Pandya, Nayak — discover the architectural marvels across 4 UNESCO World Heritage Sites.",
    cta1: { label: "View Map", icon: "🗺", link: "/map" },
    cta2: { label: "Learn More", icon: "◈", link: "/heritage/1" },
  },
];

export function PremiumHero({ totalSites = 80, unescoCount = 4, districts = 22, languages = 11 }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  // Auto-scroll every 8 seconds (slow)
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SECTIONS.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Smooth scroll to section
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const sectionWidth = container.offsetWidth;
      container.scrollTo({
        left: currentIndex * sectionWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SECTIONS.length) % SECTIONS.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SECTIONS.length);
  };

  const currentSection = SECTIONS[currentIndex];

  return (
    <section 
      className="relative h-screen overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-dark via-[#1A160F] to-stone-dark" />
      <div className="absolute inset-0 dot-grid opacity-30" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-8 animate-float bg-gradient-radial from-gold/20 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-6 animate-float bg-gradient-radial from-ember/15 via-transparent to-transparent blur-3xl" style={{ animationDelay: "2s" }} />

      {/* Left Arrow */}
      <button
        onClick={goToPrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full glass-dark border border-gold/30 flex items-center justify-center hover:bg-gold/20 hover:border-gold/60 transition-all group"
      >
        <span className="text-gold text-2xl group-hover:scale-125 transition-transform">←</span>
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full glass-dark border border-gold/30 flex items-center justify-center hover:bg-gold/20 hover:border-gold/60 transition-all group"
      >
        <span className="text-gold text-2xl group-hover:scale-125 transition-transform">→</span>
      </button>

      {/* Content Container */}
      <div 
        ref={containerRef}
        className="relative z-10 h-full flex overflow-x-hidden scroll-smooth"
      >
        {SECTIONS.map((section, idx) => (
          <div
            key={section.id}
            className="min-w-full h-full flex items-center justify-center px-8"
          >
            <div className="text-center max-w-5xl animate-fade-in">
              
              {/* Eyebrow */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                <span className="text-gold/80 text-sm font-mono tracking-[0.3em] uppercase">
                  Tamil Nadu · India
                </span>
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
              </div>

              {/* Headline */}
              <h1 className="font-display font-light leading-[1.1] mb-10">
                <span className="text-cream text-5xl md:text-6xl lg:text-7xl block mb-2">
                  {section.title}
                </span>
                <span className="text-shimmer text-6xl md:text-8xl lg:text-9xl block mb-2 font-bold">
                  {section.highlight}
                </span>
                <span className="text-cream/60 text-4xl md:text-5xl lg:text-6xl block italic font-serif">
                  {section.subtitle}
                </span>
              </h1>

              {/* Description */}
              <p className="text-cream/50 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-12">
                {section.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                <AnimatedButton 
                  variant="gold" 
                  size="lg" 
                  onClick={() => navigate(section.cta1.link)}
                  className="text-base px-8 py-4"
                >
                  <span className="mr-2">{section.cta1.icon}</span>
                  {section.cta1.label}
                </AnimatedButton>
                <AnimatedButton 
                  variant="ghost" 
                  size="lg" 
                  onClick={() => navigate(section.cta2.link)}
                  className="text-base px-8 py-4"
                >
                  <span className="mr-2">{section.cta2.icon}</span>
                  {section.cta2.label}
                </AnimatedButton>
              </div>

              {/* Stats (only on first section) */}
              {idx === 0 && (
                <div className="flex items-center justify-center gap-6">
                  <div className="glass-dark rounded-xl px-6 py-4 border border-gold/10">
                    <div className="font-display text-4xl text-gold mb-1">{totalSites}</div>
                    <div className="text-cream/50 text-xs">Heritage Sites</div>
                  </div>
                  <div className="glass-dark rounded-xl px-6 py-4 border border-gold/10">
                    <div className="font-display text-4xl text-ember mb-1">{unescoCount}</div>
                    <div className="text-cream/50 text-xs">UNESCO Sites</div>
                  </div>
                  <div className="glass-dark rounded-xl px-6 py-4 border border-gold/10">
                    <div className="font-display text-4xl text-jade mb-1">{districts}+</div>
                    <div className="text-cream/50 text-xs">Districts</div>
                  </div>
                  <div className="glass-dark rounded-xl px-6 py-4 border border-gold/10">
                    <div className="font-display text-4xl text-gold mb-1">{languages}</div>
                    <div className="text-cream/50 text-xs">Languages</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {SECTIONS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-8 h-2 bg-gold"
                : "w-2 h-2 bg-gold/30 hover:bg-gold/50"
            }`}
          />
        ))}
      </div>

      {/* Section counter */}
      <div className="absolute top-8 right-8 glass-dark rounded-lg px-4 py-2 border border-gold/20 z-20">
        <span className="text-gold font-mono text-sm">
          {currentIndex + 1} / {SECTIONS.length}
        </span>
      </div>

    </section>
  );
}

export default PremiumHero;