/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold:  { DEFAULT: "#C9A84C", light: "#E8C878", dark: "#9A7A2E", glow: "#C9A84C33" },
        stone: { DEFAULT: "#2A2318", light: "#3D3426", dark: "#1A160F", mid: "#4A3F2F" },
        cream: { DEFAULT: "#F5EDD6", light: "#FDF8EE", dim: "#E8D9B5" },
        ember: { DEFAULT: "#C4622D", light: "#E07848" },
        jade:  { DEFAULT: "#2D7A5F", light: "#3D9A77" },
        ink:   { DEFAULT: "#0D0B08" },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gold-gradient":  "linear-gradient(135deg, #C9A84C, #E8C878, #9A7A2E)",
        "stone-gradient": "linear-gradient(180deg, #1A160F 0%, #2A2318 50%, #3D3426 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(255,255,255,0.03))",
        "hero-mesh":      "radial-gradient(ellipse at 20% 50%, #C9A84C18 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #C4622D12 0%, transparent 50%)",
      },
      boxShadow: {
        "gold":    "0 0 30px rgba(201,168,76,0.25), 0 0 60px rgba(201,168,76,0.1)",
        "gold-sm": "0 0 15px rgba(201,168,76,0.2)",
        "glass":   "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,168,76,0.15)",
        "card":    "0 20px 60px rgba(0,0,0,0.5), 0 1px 0 rgba(201,168,76,0.1)",
      },
      animation: {
        "fade-up":    "fadeUp 0.7s ease forwards",
        "fade-in":    "fadeIn 0.5s ease forwards",
        "float":      "float 6s ease-in-out infinite",
        "shimmer":    "shimmer 2.5s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "slide-left": "slideLeft 0.5s ease forwards",
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: "translateY(30px)" },  to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        float:     { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        shimmer:   { from: { backgroundPosition: "-200% center" }, to: { backgroundPosition: "200% center" } },
        pulseGold: { "0%,100%": { boxShadow: "0 0 20px rgba(201,168,76,0.3)" }, "50%": { boxShadow: "0 0 40px rgba(201,168,76,0.6)" } },
        slideLeft: { from: { opacity: 0, transform: "translateX(20px)" }, to: { opacity: 1, transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
}
