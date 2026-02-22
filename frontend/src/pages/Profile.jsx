// pages/Profile.jsx — User Profile with Favorites & History
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout.jsx";
import { GlassCard } from "../components/ui/GlassCard.jsx";
import { AnimatedButton, GradientBadge } from "../components/ui/index.jsx";
import api from "../services/api.js";

// LocalStorage keys
const STORAGE = {
  FAVORITES: "heritage_favorites",
  HISTORY:   "heritage_history",
  PROFILE:   "heritage_profile",
};

function StatCard({ icon, label, value, color = "gold" }) {
  return (
    <GlassCard hover={false} className="p-6">
      <div className={`w-12 h-12 rounded-xl bg-${color}/10 border border-${color}/30 flex items-center justify-center mb-3`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`font-display text-3xl text-${color} mb-1`}>{value}</p>
      <p className="text-cream/50 text-sm">{label}</p>
    </GlassCard>
  );
}

function HeritageCard({ site, onRemove, showRemove = false }) {
  const navigate = useNavigate();
  const imgUrl = api.imageUrl(site.image_url) || `https://picsum.photos/seed/${site.id}/400/250`;

  return (
    <GlassCard hover className="overflow-hidden" onClick={() => navigate(`/heritage/${site.id}`)}>
      <div className="relative h-40">
        <img src={imgUrl} alt={site.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-dark via-stone-dark/40 to-transparent" />
        {site.unesco_site && (
          <div className="absolute top-2 right-2">
            <GradientBadge color="gold">★ UNESCO</GradientBadge>
          </div>
        )}
        {showRemove && onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(site.id); }}
            className="absolute top-2 left-2 w-8 h-8 rounded-full bg-stone-dark/80 hover:bg-ember/80 border border-gold/20 hover:border-ember flex items-center justify-center transition-all"
          >
            <span className="text-cream/60 hover:text-cream">✕</span>
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base text-cream leading-tight mb-1">{site.name}</h3>
        {site.tamil_name && <p className="text-cream/40 text-xs mb-2">{site.tamil_name}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cream/40 text-xs">
            <span className="text-gold/50">◈</span>
            {site.district}
          </div>
          <GradientBadge color="cream" className="text-[10px]">{site.category}</GradientBadge>
        </div>
      </div>
    </GlassCard>
  );
}

export function Profile() {
  const [activeTab, setActiveTab] = useState("favorites");
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState({ name: "Heritage Explorer", visits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load from localStorage
    const favIds = JSON.parse(localStorage.getItem(STORAGE.FAVORITES) || "[]");
    const histIds = JSON.parse(localStorage.getItem(STORAGE.HISTORY) || "[]");
    const prof = JSON.parse(localStorage.getItem(STORAGE.PROFILE) || '{"name":"Heritage Explorer","visits":0}');
    
    setProfile(prof);

    // Fetch full site data for favorites
    if (favIds.length > 0) {
      try {
        const favSites = await Promise.all(favIds.map((id) => api.getHeritageById(id)));
        setFavorites(favSites);
      } catch (e) {
        console.error("Failed to load favorites:", e);
      }
    }

    // Fetch history
    if (histIds.length > 0) {
      try {
        const histSites = await Promise.all(histIds.slice(0, 12).map((id) => api.getHeritageById(id)));
        setHistory(histSites);
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }

    setLoading(false);
  };

  const removeFavorite = (id) => {
    const updated = favorites.filter((s) => s.id !== id);
    setFavorites(updated);
    localStorage.setItem(STORAGE.FAVORITES, JSON.stringify(updated.map((s) => s.id)));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.setItem(STORAGE.HISTORY, JSON.stringify([]));
  };

  const stats = {
    favorites: favorites.length,
    visited: history.length,
    unescoVisited: history.filter((s) => s.unesco_site).length,
  };

  return (
    <MainLayout title="My Profile">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="glass-dark rounded-3xl p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gold/15 border-2 border-gold/30 flex items-center justify-center">
              <span className="text-5xl">◎</span>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl text-cream mb-2">{profile.name}</h1>
              <p className="text-cream/50 mb-4">Exploring Tamil Nadu's rich heritage</p>
              <div className="flex gap-3">
                <GradientBadge color="gold">Heritage Enthusiast</GradientBadge>
                <GradientBadge color="jade">{stats.visited} Sites Explored</GradientBadge>
              </div>
            </div>
            <AnimatedButton variant="ghost" size="sm">
              ⚙️ Settings
            </AnimatedButton>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon="❤️" label="Favorites" value={stats.favorites} color="gold" />
          <StatCard icon="🏛️" label="Sites Visited" value={stats.visited} color="jade" />
          <StatCard icon="⭐" label="UNESCO Visited" value={stats.unescoVisited} color="ember" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gold/20 pb-2">
          {[
            { id: "favorites", label: "Favorites", icon: "❤️" },
            { id: "history", label: "Recently Viewed", icon: "🕐" },
            { id: "stats", label: "My Stats", icon: "📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${activeTab === tab.id
                  ? "bg-gold/15 border border-gold/40 text-gold"
                  : "text-cream/50 hover:text-cream/80"
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cream/50">Loading...</p>
          </div>
        ) : (
          <>
            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <div>
                {favorites.length === 0 ? (
                  <div className="text-center py-20">
                    <span className="text-6xl mb-4 block">❤️</span>
                    <p className="text-cream/50 mb-4">No favorites yet</p>
                    <p className="text-cream/30 text-sm max-w-md mx-auto">
                      Click the heart icon on any heritage site to add it to your favorites!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {favorites.map((site) => (
                      <HeritageCard key={site.id} site={site} onRemove={removeFavorite} showRemove />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-cream/50 text-sm">{history.length} sites viewed</p>
                  {history.length > 0 && (
                    <AnimatedButton variant="ghost" size="sm" onClick={clearHistory}>
                      Clear History
                    </AnimatedButton>
                  )}
                </div>
                {history.length === 0 ? (
                  <div className="text-center py-20">
                    <span className="text-6xl mb-4 block">🕐</span>
                    <p className="text-cream/50">No history yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {history.map((site) => (
                      <HeritageCard key={site.id} site={site} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <GlassCard hover={false} className="p-6">
                  <h3 className="font-display text-xl text-cream mb-4">Your Heritage Journey</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-cream/60">Total Sites Explored</span>
                      <span className="text-gold font-mono text-lg">{stats.visited}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cream/60">Favorite Sites</span>
                      <span className="text-gold font-mono text-lg">{stats.favorites}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cream/60">UNESCO Sites Visited</span>
                      <span className="text-gold font-mono text-lg">{stats.unescoVisited} / 4</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cream/60">Progress</span>
                      <span className="text-jade font-mono text-lg">{Math.round((stats.visited / 80) * 100)}%</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard hover={false} className="p-6">
                  <h3 className="font-display text-xl text-cream mb-4">Achievements</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "🏛️", label: "First Visit", unlocked: stats.visited > 0 },
                      { icon: "⭐", label: "UNESCO Explorer", unlocked: stats.unescoVisited >= 1 },
                      { icon: "❤️", label: "Curator", unlocked: stats.favorites >= 5 },
                      { icon: "🗺️", label: "Heritage Hunter", unlocked: stats.visited >= 20 },
                    ].map((achievement, i) => (
                      <div
                        key={i}
                        className={`
                          p-4 rounded-xl border flex items-center gap-3
                          ${achievement.unlocked
                            ? "bg-gold/10 border-gold/30"
                            : "bg-stone-light/20 border-stone-mid/30 opacity-40"
                          }
                        `}
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <p className="text-cream text-sm font-medium">{achievement.label}</p>
                          <p className="text-cream/40 text-xs">{achievement.unlocked ? "Unlocked ✓" : "Locked"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}
          </>
        )}

      </div>
    </MainLayout>
  );
}

export default Profile;