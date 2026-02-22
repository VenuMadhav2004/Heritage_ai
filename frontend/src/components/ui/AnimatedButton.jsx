// components/ui/AnimatedButton.jsx
export function AnimatedButton({ children, onClick, variant = "gold", size = "md", className = "", disabled = false, type = "button" }) {
  const variants = {
    gold: `
      bg-gradient-to-r from-[#C9A84C] via-[#E8C96A] to-[#9A7A32]
      text-[#0A0A0F] font-semibold
      hover:shadow-[0_0_40px_rgba(201,168,76,0.5)]
      hover:scale-[1.02] active:scale-[0.98]
    `,
    ghost: `
      bg-transparent border border-[rgba(201,168,76,0.3)] text-[#C9A84C]
      hover:bg-[rgba(201,168,76,0.08)] hover:border-[rgba(201,168,76,0.5)]
      active:scale-[0.98]
    `,
    glass: `
      bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white
      hover:bg-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.12)]
      active:scale-[0.98]
    `,
    danger: `
      bg-[rgba(232,76,106,0.15)] border border-[rgba(232,76,106,0.3)] text-[#E84C6A]
      hover:bg-[rgba(232,76,106,0.25)] active:scale-[0.98]
    `,
  };
  const sizes = {
    sm: "px-4 py-2 text-xs rounded-lg",
    md: "px-6 py-2.5 text-sm rounded-xl",
    lg: "px-8 py-3.5 text-sm rounded-2xl",
    xl: "px-10 py-4 text-base rounded-2xl",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium tracking-wide
        transition-all duration-200
        disabled:opacity-40 disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
export default AnimatedButton;
