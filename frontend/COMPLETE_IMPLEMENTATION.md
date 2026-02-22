# 🚀 Complete Frontend Implementation Guide

## ✅ What's Already Built (Dashboard + Map)

- ✅ Full Dashboard with hero, stats, carousel, recommendations
- ✅ Interactive Map with Leaflet, filters, category markers
- ✅ Layout (Sidebar, TopNavbar, MainLayout)
- ✅ UI Components (GlassCard, AnimatedButton, GradientBadge, LoadingSpinner)
- ✅ Services (api.js with all 20+ backend endpoints)
- ✅ Hooks (useFetch.js)

---

## 📦 Required Dependencies (Add to package.json)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "leaflet": "^1.9.4",           // ← For map
    "react-leaflet": "^4.2.1"      // ← For map
  }
}
```

Install:
```bash
npm install leaflet react-leaflet
```

---

## 🏛️ Heritage Detail Page — IMPLEMENTATION

### File: `src/components/heritage/ImageGallery.jsx`

```jsx
// Image carousel with lightbox
import { useState } from "react";

export function ImageGallery({ images = [], mainImage }) {
  const [selected, setSelected] = useState(0);
  const allImages = mainImage ? [mainImage, ...images] : images;

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative h-96 rounded-2xl overflow-hidden group">
        <img
          src={allImages[selected]}
          alt="Heritage site"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-dark via-transparent opacity-60" />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`
                relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden
                border-2 transition-all
                ${i === selected ? "border-gold scale-105" : "border-transparent opacity-60 hover:opacity-100"}
              `}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### File: `src/components/heritage/Timeline.jsx`

```jsx
// Historical timeline component
export function Timeline({ events }) {
  return (
    <div className="relative pl-8 space-y-6">
      {/* Vertical line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-gold/20" />

      {events.map((event, i) => (
        <div key={i} className="relative animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
          {/* Dot */}
          <div className="absolute -left-[26px] w-3 h-3 rounded-full bg-gold border-2 border-stone-dark" />
          
          {/* Content */}
          <div className="glass-dark rounded-xl p-4">
            <p className="text-gold text-sm font-mono mb-1">{event.year}</p>
            <h4 className="text-cream font-medium mb-2">{event.title}</h4>
            <p className="text-cream/60 text-sm">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### File: `src/components/heritage/VoicePlayer.jsx`

```jsx
// TTS voice player with language selection
import { useState } from "react";
import api from "../../services/api.js";
import { AnimatedButton, GradientBadge } from "../ui/index.jsx";

export function VoicePlayer({ heritageId }) {
  const [lang, setLang] = useState("en");
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const LANGS = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ta", name: "Tamil", flag: "🇮🇳" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "fr", name: "French", flag: "🇫🇷" },
  ];

  const handlePlay = async () => {
    try {
      setPlaying(true);
      // Generate TTS
      const result = await api.generateVoice(heritageId, lang);
      
      // Play audio
      const url = api.getPlayUrl(heritageId, lang);
      const audio = new Audio(url);
      audio.play();
      
      audio.onended = () => setPlaying(false);
    } catch (e) {
      console.error("TTS failed:", e);
      setPlaying(false);
    }
  };

  return (
    <div className="glass-dark rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎙️</span>
        <h3 className="font-display text-lg text-cream">Audio Guide</h3>
      </div>

      {/* Language selector */}
      <div className="flex gap-2 mb-4">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`
              px-3 py-2 rounded-lg text-sm border transition-all
              ${lang === l.code
                ? "bg-gold/15 border-gold/40 text-gold"
                : "border-stone-mid/40 text-cream/50 hover:border-gold/30"
              }
            `}
          >
            {l.flag} {l.name}
          </button>
        ))}
      </div>

      {/* Play button */}
      <AnimatedButton
        variant="gold"
        size="lg"
        className="w-full justify-center"
        onClick={handlePlay}
        disabled={playing}
      >
        {playing ? "🔊 Playing..." : "▶️ Play Audio"}
      </AnimatedButton>
    </div>
  );
}
```

### File: `src/pages/HeritageDetail.jsx`

```jsx
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout.jsx";
import { ImageGallery } from "../components/heritage/ImageGallery.jsx";
import { Timeline } from "../components/heritage/Timeline.jsx";
import { VoicePlayer } from "../components/heritage/VoicePlayer.jsx";
import { GradientBadge, AnimatedButton } from "../components/ui/index.jsx";
import useFetch from "../hooks/useFetch.js";
import api from "../services/api.js";

export function HeritageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: site, loading } = useFetch(() => api.getHeritageById(id), [id]);

  if (loading) return <MainLayout title="Loading..."><div className="p-20 text-center text-cream/50">Loading...</div></MainLayout>;
  if (!site) return <MainLayout title="Not Found"><div className="p-20 text-center text-cream/50">Site not found</div></MainLayout>;

  const imgUrl = api.imageUrl(site.image_url) || `https://picsum.photos/seed/${site.id}/1200/600`;

  // Build timeline from site data
  const timeline = [
    { year: site.year_built || "Ancient", title: "Construction", description: `Built during the ${site.dynasty} period.` },
    { year: site.period, title: "Historical Period", description: site.history || "Rich historical significance." },
    ...(site.unesco_site ? [{ year: "UNESCO", title: "World Heritage Status", description: site.unesco_criteria }] : []),
  ];

  return (
    <MainLayout title={site.name}>
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Hero Image + Title */}
        <div className="relative h-96 rounded-3xl overflow-hidden">
          <img src={imgUrl} alt={site.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-dark via-stone-dark/60 to-transparent flex items-end p-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <GradientBadge color="gold">{site.category}</GradientBadge>
                {site.unesco_site && <GradientBadge color="ember">★ UNESCO</GradientBadge>}
              </div>
              <h1 className="font-display text-5xl text-cream mb-2">{site.name}</h1>
              {site.tamil_name && <p className="text-cream/60 text-xl">{site.tamil_name}</p>}
              <p className="text-cream/50 mt-2">{site.district} • {site.dynasty}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            
            {/* Description */}
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="font-display text-2xl text-gold mb-4">Overview</h2>
              <p className="text-cream/70 leading-relaxed">{site.description}</p>
            </div>

            {/* History */}
            {site.history && (
              <div className="glass-dark rounded-2xl p-6">
                <h2 className="font-display text-2xl text-gold mb-4">Historical Significance</h2>
                <p className="text-cream/70 leading-relaxed">{site.history}</p>
              </div>
            )}

            {/* Architecture */}
            {site.architecture && (
              <div className="glass-dark rounded-2xl p-6">
                <h2 className="font-display text-2xl text-gold mb-4">Architecture</h2>
                <p className="text-cream/70 leading-relaxed">{site.architecture}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="font-display text-2xl text-gold mb-6">Timeline</h2>
              <Timeline events={timeline} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Voice Player */}
            <VoicePlayer heritageId={site.id} />

            {/* Visitor Info */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="font-display text-lg text-cream mb-4">Visitor Information</h3>
              <div className="space-y-3 text-sm">
                {site.entry_fee && (
                  <div className="flex justify-between">
                    <span className="text-cream/50">Entry Fee</span>
                    <span className="text-gold">{site.entry_fee}</span>
                  </div>
                )}
                {site.visiting_hours && (
                  <div className="flex justify-between">
                    <span className="text-cream/50">Hours</span>
                    <span className="text-cream">{site.visiting_hours}</span>
                  </div>
                )}
                {site.best_time_to_visit && (
                  <div className="flex justify-between">
                    <span className="text-cream/50">Best Time</span>
                    <span className="text-cream">{site.best_time_to_visit}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-cream/50">Wheelchair</span>
                  <span className={site.wheelchair_accessible ? "text-jade" : "text-cream/30"}>
                    {site.wheelchair_accessible ? "✓ Yes" : "✗ No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cream/50">Parking</span>
                  <span className={site.parking_available ? "text-jade" : "text-cream/30"}>
                    {site.parking_available ? "✓ Yes" : "✗ No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Location */}
            {site.latitude && site.longitude && (
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="font-display text-lg text-cream mb-4">Location</h3>
                <p className="text-cream/60 text-sm mb-3">{site.location || site.district}</p>
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => navigate(`/map?site=${site.id}`)}
                >
                  View on Map
                </AnimatedButton>
              </div>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default HeritageDetail;
```

---

## 🎯 Installation & Run

```bash
# 1. Install ALL dependencies
cd frontend
npm install

# 2. Start frontend
npm run dev
# → http://localhost:5173

# 3. Start backend (separate terminal)
cd major-backend
python main.py
# → http://localhost:8000
```

---

## ✅ Checklist

- [ ] Dashboard loads with stats, carousel
- [ ] Map page shows Tamil Nadu with markers
- [ ] Click marker → navigates to detail page
- [ ] Heritage detail shows all info + voice player
- [ ] Voice player generates TTS on click
- [ ] All API calls connect to backend

**Your frontend is now complete bro! 🚀**

For AIExplorer and Analytics pages, let me know and I'll generate those too!
