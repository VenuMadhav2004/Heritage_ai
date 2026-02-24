// layout/TopNavbar.jsx — Responsive with Mobile Menu
import { useState } from "react";

export function TopNavbar({ title, onMenuClick }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <nav
      className="fixed top-0 z-30 bg-stone-dark/95 backdrop-blur-xl border-b border-gold/10"
      style={{
        left: 0,
        right: 0,
        height: "var(--navbar-h)",
      }}
    >
      <div className="h-full flex items-center justify-between gap-4 px-4 md:px-6">
        
        {/* Left: Menu Button (Mobile) + Title */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-gold/10 transition-all"
          >
            <span className="text-gold text-xl">☰</span>
          </button>

          {/* Page Title */}
          <h1 className="font-display text-lg md:text-xl text-cream truncate">
            {title}
          </h1>
        </div>

        {/* Center: Search Bar (Hidden on small mobile) */}
        <div className="hidden sm:flex flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search monuments, dynasties, districts..."
              className="
                w-full px-4 py-2 pl-10 rounded-xl text-sm
                bg-stone-light/40 border border-gold/10
                text-cream placeholder:text-cream/30
                focus:outline-none focus:border-gold/40 focus:bg-stone-light/60
                transition-all
              "
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/40">
              🔍
            </span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* AI Explorer Button */}
          <button
            onClick={() => window.location.href = "/ai"}
            className="
              flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl
              bg-gold/10 border border-gold/30
              hover:bg-gold/20 hover:border-gold/50
              transition-all text-gold text-sm
            "
          >
            <span className="text-base">✦</span>
            <span className="hidden md:inline">AI Explorer</span>
          </button>

          {/* Settings (Mobile: Icon only) */}
          <button className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-gold/10 transition-all">
            <span className="text-cream/60">⚙</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default TopNavbar;
