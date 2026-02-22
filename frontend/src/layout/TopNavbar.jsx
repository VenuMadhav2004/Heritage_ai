// layout/TopNavbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedButton } from "../components/ui/index.jsx";

export function TopNavbar({ title = "Dashboard" }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/ai?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-6"
      style={{
        left: "var(--sidebar-w)",
        height: "var(--navbar-h)",
        background: "linear-gradient(180deg, rgba(26,22,15,0.95) 0%, rgba(26,22,15,0.0) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Page title */}
      <div className="flex flex-col">
        <h1 className="font-display text-xl text-cream/90 leading-none">{title}</h1>
        <div className="w-8 h-px bg-gold/40 mt-1" />
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/40 text-sm">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search monuments, dynasties, districts…"
            className="
              w-full pl-9 pr-4 py-2 rounded-xl
              bg-stone-light/40 border border-gold/15
              text-cream/80 text-sm placeholder:text-cream/25
              focus:outline-none focus:border-gold/40 focus:bg-stone-light/60
              transition-all duration-300
            "
          />
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <AnimatedButton variant="ghost" size="sm" onClick={() => navigate("/ai")}>
          <span>✦</span> AI Explorer
        </AnimatedButton>
        <button
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-xl glass border border-gold/20 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/40 transition-all"
        >
          ◎
        </button>
      </div>
    </header>
  );
}

export default TopNavbar;
