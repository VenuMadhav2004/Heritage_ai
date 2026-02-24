// layout/Sidebar.jsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "../services/firebase.js";

const NAV = [
  { to: "/",         icon: "⬡", label: "Dashboard",   sub: "Overview" },
  { to: "/map",      icon: "◈", label: "Explore Map",  sub: "Interactive" },
  { to: "/ai",       icon: "✦", label: "AI Explorer",  sub: "Smart Search" },
  { to: "/stories",  icon: "◉", label: "Stories",      sub: "Narratives" },
  { to: "/profile",  icon: "◎", label: "Profile",      sub: "Your Space" },
];

export function Sidebar({ onClose }) {
  const location = useLocation();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col"
      style={{ width: "var(--sidebar-w)" }}
    >
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-dark via-stone to-stone-dark border-r border-gold/10" />
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="relative flex flex-col h-full px-4 py-6 gap-6">

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 lg:hidden w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-gold/10"
          >
            <span className="text-cream/60">✕</span>
          </button>
        )}

        {/* Logo */}
        <div className="flex flex-col items-start gap-1 px-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-sm animate-float">
              ✦
            </div>
            <span className="font-display text-gold-light font-semibold text-lg leading-none">
              Tamil<br/>Heritage
            </span>
          </div>
          <div className="gold-line ml-1 mt-1" />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`
                  group relative flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-300
                  ${active
                    ? "glass glow-gold text-cream"
                    : "text-cream/40 hover:text-cream/80 hover:bg-stone-light/30"
                  }
                `}
              >
                {/* gold left indicator */}
                <div className={`
                  absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r
                  transition-all duration-300
                  ${active ? "bg-gold opacity-100" : "bg-gold opacity-0 group-hover:opacity-40"}
                `} />

                <span className={`text-base w-6 text-center transition-colors duration-300 ${active ? "text-gold" : "group-hover:text-gold/60"}`}>
                  {item.icon}
                </span>

                <div className="flex flex-col">
                  <span className={`text-sm font-medium transition-colors duration-300 ${active ? "text-cream" : ""}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-cream/30">
                    {item.sub}
                  </span>
                </div>

                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={async () => {
            const result = await signOut();
            if (result.success) {
              window.location.href = "/auth";
            }
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl border border-ember/30 bg-ember/10 hover:bg-ember/20 text-ember transition-all"
        >
          <span className="text-lg">🚪</span>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">Logout</span>
            <span className="text-[10px] opacity-60">Sign out</span>
          </div>
        </button>

        {/* Bottom info */}
        <div className="glass rounded-xl p-3 flex flex-col gap-1">
          <p className="text-[10px] text-cream/30 uppercase tracking-widest">System</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
            <span className="text-xs text-cream/50">Backend connected</span>
          </div>
          <p className="text-[10px] text-gold/40 font-mono mt-1">v1.0.0</p>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
