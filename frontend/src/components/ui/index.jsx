// components/ui/AnimatedButton.jsx
export function AnimatedButton({ children, onClick, variant = "gold", size = "md", className = "", disabled = false }) {
  const variants = {
    gold:    "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-stone-dark font-semibold hover:shadow-gold hover:scale-[1.03]",
    ghost:   "border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/60",
    glass:   "glass text-cream hover:border-gold/40",
    danger:  "bg-ember/20 border border-ember/40 text-ember hover:bg-ember/30",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-xl
        transition-all duration-300 ease-out
        ${variants[variant]} ${sizes[size]}
        disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// components/ui/GradientBadge.jsx
export function GradientBadge({ children, color = "gold", className = "" }) {
  const colors = {
    gold:  "border-gold/30 bg-gold/10 text-gold-light",
    jade:  "border-jade/30 bg-jade/10 text-jade-light",
    ember: "border-ember/30 bg-ember/10 text-ember-light",
    cream: "border-cream/20 bg-cream/5 text-cream",
  };
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full
      border text-xs font-medium tracking-wide
      ${colors[color]} ${className}
    `}>
      {children}
    </span>
  );
}

// components/ui/LoadingSpinner.jsx
export function LoadingSpinner({ size = "md", color = "gold" }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${sizes[size]} relative`}>
      <div className={`absolute inset-0 rounded-full border-2 border-stone-mid`} />
      <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-${color} animate-spin`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-stone-dark flex flex-col items-center justify-center gap-6 z-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-stone-mid" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-gold animate-spin" />
        <div className="absolute inset-2 w-12 h-12 rounded-full border-2 border-transparent border-b-gold/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
      <p className="font-display text-gold/70 text-lg tracking-widest animate-pulse">LOADING</p>
    </div>
  );
}

export default AnimatedButton;
