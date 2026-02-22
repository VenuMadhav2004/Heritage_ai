// components/ui/GlassCard.jsx
export function GlassCard({ children, className = "", hover = true, glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative glass rounded-2xl overflow-hidden
        ${hover ? "card-hover cursor-pointer" : ""}
        ${glow ? "animate-pulse-gold" : ""}
        ${className}
      `}
    >
      {/* inner top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      {children}
    </div>
  );
}

export default GlassCard;
