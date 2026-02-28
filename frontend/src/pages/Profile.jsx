// pages/Profile.jsx — Dynamic User Profile with Notes & Editing (No Photo)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout.jsx";
import { GlassCard } from "../components/ui/GlassCard.jsx";
import { AnimatedButton, GradientBadge } from "../components/ui/index.jsx";
import { getCurrentUser } from "../services/firebase.js";
import api from "../services/api.js";

const STORAGE = {
  FAVORITES: "heritage_favorites",
  HISTORY: "heritage_history",
  NOTES: "heritage_notes",
  PROFILE: "user_profile",
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

function NoteCard({ note, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-dark rounded-xl p-4 border border-gold/10 hover:border-gold/30 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-cream font-medium mb-1">{note.title}</h4>
          <p className="text-cream/40 text-xs">{new Date(note.date).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(note)}
            className="w-8 h-8 rounded-lg glass hover:bg-gold/10 flex items-center justify-center transition-all"
            title="Edit"
          >
            <span className="text-gold text-sm">✎</span>
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="w-8 h-8 rounded-lg glass hover:bg-ember/10 flex items-center justify-center transition-all"
            title="Delete"
          >
            <span className="text-ember text-sm">✕</span>
          </button>
        </div>
      </div>
      <p className={`text-cream/70 text-sm ${!isExpanded && note.content.length > 150 ? 'line-clamp-3' : ''}`}>
        {note.content}
      </p>
      {note.content.length > 150 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gold text-xs mt-2 hover:underline"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
      {note.siteId && (
        <div className="mt-3 pt-3 border-t border-gold/10">
          <span className="text-cream/40 text-xs">Related: </span>
          <span className="text-gold/60 text-xs">{note.siteName}</span>
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [editedProfile, setEditedProfile] = useState({});

  // Note modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: "", content: "", siteId: null, siteName: "" });

  useEffect(() => {
    loadUserData();
    loadData();
  }, []);

  const loadUserData = () => {
    const firebaseUser = getCurrentUser();
    const localProfile = JSON.parse(localStorage.getItem(STORAGE.PROFILE) || "{}");
    
    if (firebaseUser) {
      setProfile({
        name: firebaseUser.displayName || localProfile.name || "Heritage Explorer",
        email: firebaseUser.email || "",
        phone: localProfile.phone || "",
        location: localProfile.location || "Tamil Nadu, India",
        bio: localProfile.bio || "Exploring the rich cultural heritage of Tamil Nadu",
      });
    } else {
      setProfile({
        name: localProfile.name || "Heritage Explorer",
        email: localProfile.email || "",
        phone: localProfile.phone || "",
        location: localProfile.location || "Tamil Nadu, India",
        bio: localProfile.bio || "Exploring the rich cultural heritage",
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    
    const favIds = JSON.parse(localStorage.getItem(STORAGE.FAVORITES) || "[]");
    const histIds = JSON.parse(localStorage.getItem(STORAGE.HISTORY) || "[]");
    const storedNotes = JSON.parse(localStorage.getItem(STORAGE.NOTES) || "[]");
    
    setNotes(storedNotes);

    if (favIds.length > 0) {
      try {
        const favSites = await Promise.all(favIds.map((id) => api.getHeritageById(id)));
        setFavorites(favSites.filter(Boolean));
      } catch (e) {
        console.error("Failed to load favorites:", e);
      }
    }

    if (histIds.length > 0) {
      try {
        const histSites = await Promise.all(histIds.slice(0, 12).map((id) => api.getHeritageById(id)));
        setHistory(histSites.filter(Boolean));
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }

    setLoading(false);
  };

  const saveProfile = () => {
    const updated = { ...profile, ...editedProfile };
    setProfile(updated);
    localStorage.setItem(STORAGE.PROFILE, JSON.stringify(updated));
    setIsEditingProfile(false);
    setEditedProfile({});
  };

  const cancelEdit = () => {
    setIsEditingProfile(false);
    setEditedProfile({});
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

  const openNoteModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({ title: note.title, content: note.content, siteId: note.siteId, siteName: note.siteName });
    } else {
      setEditingNote(null);
      setNoteForm({ title: "", content: "", siteId: null, siteName: "" });
    }
    setShowNoteModal(true);
  };

  const saveNote = () => {
    const allNotes = [...notes];
    
    if (editingNote) {
      const index = allNotes.findIndex(n => n.id === editingNote.id);
      allNotes[index] = { ...editingNote, ...noteForm, date: Date.now() };
    } else {
      allNotes.push({
        id: Date.now(),
        ...noteForm,
        date: Date.now(),
      });
    }
    
    setNotes(allNotes);
    localStorage.setItem(STORAGE.NOTES, JSON.stringify(allNotes));
    setShowNoteModal(false);
    setNoteForm({ title: "", content: "", siteId: null, siteName: "" });
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem(STORAGE.NOTES, JSON.stringify(updated));
  };

  const stats = {
    favorites: favorites.length,
    visited: history.length,
    unescoVisited: history.filter((s) => s.unesco_site).length,
    notes: notes.length,
  };

  return (
    <MainLayout title="My Profile">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Header - Editable (No Photo) */}
        <div className="glass-dark rounded-3xl p-8">
          <div className="flex items-start gap-6">

            {/* Profile Info */}
            <div className="flex-1">
              {isEditingProfile ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedProfile.name !== undefined ? editedProfile.name : profile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-2 rounded-xl bg-stone-light/40 border border-gold/15 text-cream text-xl focus:outline-none focus:border-gold/40"
                  />
                  <input
                    type="email"
                    value={editedProfile.email !== undefined ? editedProfile.email : profile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    placeholder="Email"
                    className="w-full px-4 py-2 rounded-xl bg-stone-light/40 border border-gold/15 text-cream focus:outline-none focus:border-gold/40"
                  />
                  <input
                    type="tel"
                    value={editedProfile.phone !== undefined ? editedProfile.phone : profile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-4 py-2 rounded-xl bg-stone-light/40 border border-gold/15 text-cream focus:outline-none focus:border-gold/40"
                  />
                  <input
                    type="text"
                    value={editedProfile.location !== undefined ? editedProfile.location : profile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    placeholder="Location"
                    className="w-full px-4 py-2 rounded-xl bg-stone-light/40 border border-gold/15 text-cream focus:outline-none focus:border-gold/40"
                  />
                  <textarea
                    value={editedProfile.bio !== undefined ? editedProfile.bio : profile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    placeholder="Bio"
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl bg-stone-light/40 border border-gold/15 text-cream focus:outline-none focus:border-gold/40 resize-none"
                  />
                  <div className="flex gap-3">
                    <AnimatedButton variant="gold" size="sm" onClick={saveProfile}>
                      ✓ Save
                    </AnimatedButton>
                    <AnimatedButton variant="ghost" size="sm" onClick={cancelEdit}>
                      Cancel
                    </AnimatedButton>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-3xl text-cream mb-2">{profile.name}</h1>
                  {profile.email && <p className="text-cream/60 text-sm mb-1">{profile.email}</p>}
                  {profile.phone && <p className="text-cream/60 text-sm mb-1">📞 {profile.phone}</p>}
                  {profile.location && <p className="text-cream/60 text-sm mb-3">📍 {profile.location}</p>}
                  <p className="text-cream/50 mb-4">{profile.bio}</p>
                  <div className="flex gap-3">
                    <GradientBadge color="gold">Heritage Enthusiast</GradientBadge>
                    <GradientBadge color="jade">{stats.visited} Sites Explored</GradientBadge>
                  </div>
                </>
              )}
            </div>

            {/* Edit Button */}
            {!isEditingProfile && (
              <AnimatedButton variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>
                ✎ Edit Profile
              </AnimatedButton>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="❤️" label="Favorites" value={stats.favorites} color="gold" />
          <StatCard icon="🏛️" label="Sites Visited" value={stats.visited} color="jade" />
          <StatCard icon="⭐" label="UNESCO Visited" value={stats.unescoVisited} color="ember" />
          <StatCard icon="📝" label="Notes" value={stats.notes} color="gold" />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gold/20 pb-2">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "favorites", label: "Favorites", icon: "❤️" },
            { id: "history", label: "History", icon: "🕐" },
            { id: "notes", label: "Notes", icon: "📝" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-gold/15 border border-gold/40 text-gold"
                  : "text-cream/50 hover:text-cream/80"
              }`}
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
            {/* Overview Tab */}
            {activeTab === "overview" && (
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
                      <span className="text-cream/60">Notes Created</span>
                      <span className="text-gold font-mono text-lg">{stats.notes}</span>
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
                        className={`p-4 rounded-xl border flex items-center gap-3 ${
                          achievement.unlocked
                            ? "bg-gold/10 border-gold/30"
                            : "bg-stone-light/20 border-stone-mid/30 opacity-40"
                        }`}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.map((site) => (
                      <HeritageCard key={site.id} site={site} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-cream/50 text-sm">{notes.length} notes</p>
                  <AnimatedButton variant="gold" size="sm" onClick={() => openNoteModal()}>
                    + New Note
                  </AnimatedButton>
                </div>
                {notes.length === 0 ? (
                  <div className="text-center py-20">
                    <span className="text-6xl mb-4 block">📝</span>
                    <p className="text-cream/50 mb-4">No notes yet</p>
                    <p className="text-cream/30 text-sm max-w-md mx-auto mb-6">
                      Create notes to remember details about heritage sites you visit
                    </p>
                    <AnimatedButton variant="gold" onClick={() => openNoteModal()}>
                      Create First Note
                    </AnimatedButton>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.map((note) => (
                      <NoteCard key={note.id} note={note} onEdit={openNoteModal} onDelete={deleteNote} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNoteModal(false)} />
          <div className="relative max-w-2xl w-full glass-dark rounded-2xl p-6 border border-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl text-cream">
                {editingNote ? "Edit Note" : "New Note"}
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="w-8 h-8 rounded-lg glass hover:bg-ember/10 flex items-center justify-center"
              >
                <span className="text-cream">✕</span>
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                placeholder="Note title"
                className="w-full px-4 py-3 rounded-xl bg-stone-light/40 border border-gold/15 text-cream focus:outline-none focus:border-gold/40"
              />
              <textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                placeholder="Write your note here..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-stone-light/40 border border-gold/15 text-cream focus:outline-none focus:border-gold/40 resize-none"
              />

              <div className="flex gap-3">
                <AnimatedButton
                  variant="gold"
                  onClick={saveNote}
                  disabled={!noteForm.title.trim() || !noteForm.content.trim()}
                >
                  {editingNote ? "Update Note" : "Save Note"}
                </AnimatedButton>
                <AnimatedButton variant="ghost" onClick={() => setShowNoteModal(false)}>
                  Cancel
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Profile;