// components/ui/GradientBadge.jsx
export function GradientBadge({ children, variant = "gold", className = "" }) {
  const variants = {
    gold:    "bg-[rgba(201,168,76,0.12)] border-[rgba(201,168,76,0.3)] text-[#E8C96A]",
    jade:    "bg-[rgba(46,204,138,0.12)] border-[rgba(46,204,138,0.3)] text-[#2ECC8A]",
    sapphire:"bg-[rgba(76,142,232,0.12)] border-[rgba(76,142,232,0.3)] text-[#4C8EE8]",
    crimson: "bg-[rgba(232,76,106,0.12)] border-[rgba(232,76,106,0.3)] text-[#E84C6A]",
    muted:   "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#A0A0C0]",
  };
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
      border tracking-wide uppercase
      ${variants[variant] || variants.gold}
      ${className}
    `}>
      {children}
    </span>
  );
}

// components/ui/LoadingSpinner.jsx
export function LoadingSpinner({ size = "md", gold = true }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${sizes[size]} relative`}>
      <div className={`
        ${sizes[size]} rounded-full border-2
        ${gold ? "border-[rgba(201,168,76,0.15)] border-t-[#C9A84C]" : "border-[rgba(255,255,255,0.1)] border-t-white"}
        animate-spin
      `} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border border-[rgba(201,168,76,0.2)] border-t-[#C9A84C] animate-spin" />
        <div className="absolute inset-2 w-12 h-12 rounded-full border border-[rgba(201,168,76,0.1)] border-b-[#E8C96A] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
      <p className="font-display text-lg text-[rgba(201,168,76,0.7)] tracking-[0.3em] uppercase text-sm">
        Loading Heritage
      </p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-stone border border-[rgba(255,255,255,0.04)]">
      <div className="h-48 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-2/3" />
      </div>
    </div>
  );
}
