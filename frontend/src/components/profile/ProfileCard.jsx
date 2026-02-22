// components/profile/ProfileCard.jsx
export function ProfileCard({ stats }) {
  return (
    <div className="rounded-2xl p-6 text-center"
      style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))", border: "1px solid rgba(201,168,76,0.2)" }}>
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
        style={{ background: "rgba(201,168,76,0.1)", border: "2px solid rgba(201,168,76,0.3)" }}>
        👤
      </div>
      <h2 className="font-display text-2xl text-white mb-1">Heritage Explorer</h2>
      <p className="text-[#6B6B8F] text-sm mb-5">Tamil Nadu Heritage System</p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Visited",   value: stats.visited   },
          { label: "Favorites", value: stats.favorites },
          { label: "Stories",   value: stats.stories   },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
            <p className="font-display text-2xl text-[#C9A84C]">{s.value}</p>
            <p className="text-[#6B6B8F] text-xs">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// components/profile/FavoritesList.jsx
import { HeritageCard } from "../heritage/HeritageCard";

export function FavoritesList({ sites, onSiteClick, onRemove }) {
  if (!sites.length) return (
    <div className="py-16 text-center">
      <p className="text-4xl mb-3">💛</p>
      <p className="font-display text-xl text-[rgba(201,168,76,0.4)] mb-2">No Favorites Yet</p>
      <p className="text-[#6B6B8F] text-sm">Heart any heritage site to save it here</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {sites.map(site => (
        <div key={site.id} className="relative group">
          <HeritageCard site={site} onClick={onSiteClick} />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(site.id); }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[rgba(232,76,106,0.8)] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#E84C6A]"
          >✕</button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// components/profile/ActivityHistory.jsx
export function ActivityHistory({ history }) {
  if (!history.length) return (
    <div className="py-12 text-center">
      <p className="text-3xl mb-3">🏛️</p>
      <p className="font-display text-xl text-[rgba(201,168,76,0.4)] mb-2">No History Yet</p>
      <p className="text-[#6B6B8F] text-sm">Start exploring heritage sites</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {history.map((item, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(201,168,76,0.15)] transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[rgba(201,168,76,0.08)] flex items-center justify-center text-lg flex-shrink-0">
            🏛️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{item.name}</p>
            <p className="text-[#6B6B8F] text-xs">{item.district} · {item.viewedAt}</p>
          </div>
          <span className="text-[#C9A84C] text-xs opacity-60">{item.category}</span>
        </div>
      ))}
    </div>
  );
}
