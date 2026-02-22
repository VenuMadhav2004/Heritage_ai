# 🏛️ Tamil Nadu Heritage — Premium Frontend

## ✨ Features

### ✅ 1. Dashboard
- Premium glass-morphism hero section
- Animated stat counters (80 sites, 4 UNESCO, 22 districts)
- Auto-scrolling featured carousel
- Quick filters (category, UNESCO, district, dynasty)

### ✅ 2. Interactive Map
- Leaflet-powered full-screen map
- Category-based colored markers (Temple=gold, Fort=ember)
- UNESCO sites with glowing star markers
- Live filters (category, district, UNESCO toggle)
- Image popups on marker click
- Click marker → navigate to detail page

### ✅ 3. Heritage Detail Page
- Large hero image with gradient overlay
- Historical timeline component
- Voice player with 11 languages (Tamil, Hindi, English, French, German, Japanese, Chinese, Arabic, Telugu, Kannada, Malayalam)
- Visitor information (fees, hours, accessibility)
- "View on Map" button

### ✅ 4. Premium UI Components
- Glass-morphism cards
- Animated buttons with gold gradients
- Gradient badges
- Loading spinners
- Animated counters

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Frontend runs at: **http://localhost:5173**

### 3. Start Backend (Separate Terminal)
```bash
cd major-backend
python main.py
```
Backend runs at: **http://localhost:8000**

---

## 📦 Tech Stack

- **React 18** — UI framework
- **React Router 6** — Navigation
- **Tailwind CSS** — Styling
- **Leaflet** — Interactive maps
- **Vite** — Build tool
- **Custom Design System** — Gold-themed heritage aesthetic

---

## 🎨 Design Tokens

```
Gold:   #C9A84C (primary accent)
Stone:  #2A2318 (background)
Cream:  #F5EDD6 (text)
Ember:  #C4622D (highlight)
Jade:   #2D7A5F (success)
```

**Fonts:**
- Display: Cormorant Garamond (serif)
- Body: DM Sans (sans-serif)

---

## 📂 Project Structure

```
frontend/
├── public/
├── src/
│   ├── layout/              # Sidebar, TopNavbar, MainLayout
│   ├── components/
│   │   ├── ui/              # GlassCard, AnimatedButton, etc.
│   │   ├── dashboard/       # Hero, Stats, Carousel
│   │   ├── map/             # MapView, MapFilters
│   │   └── heritage/        # Detail page components
│   ├── pages/               # Dashboard, MapPage, HeritageDetail
│   ├── services/            # api.js (backend integration)
│   ├── hooks/               # useFetch, useVoice
│   └── index.css            # Global styles + animations
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🔌 Backend API Integration

All endpoints connected:

| Feature | Endpoint |
|---------|----------|
| Dashboard stats | `/api/v1/analytics/dashboard` |
| Heritage list | `/api/v1/heritage/` |
| Map markers | `/api/v1/heritage/map/markers` |
| Site detail | `/api/v1/heritage/{id}` |
| Categories | `/api/v1/analytics/categories` |
| Districts | `/api/v1/analytics/districts` |
| UNESCO sites | `/api/v1/analytics/unesco` |
| Voice generation | `/api/v1/tts/generate/{id}?lang=en` |
| Voice playback | `/api/v1/tts/play/{id}?lang=en` |

---

## 🎯 Available Pages

- `/` — Dashboard (stats + carousel + filters)
- `/map` — Interactive map with filters
- `/heritage/:id` — Heritage site detail page
- `/ai` — AI Explorer (stub — ready to build)
- `/stories` — Stories page (stub)
- `/profile` — Profile page (stub)

---

## 🛠️ Build for Production

```bash
npm run build
```

Outputs to `dist/` folder — deploy to any static host (Vercel, Netlify, GitHub Pages).

---

## 📱 Responsive Design

- Desktop: Full layout with sidebar
- Tablet: Responsive grid
- Mobile: Touch-optimized (future enhancement)

---

## 🎨 Animations

- Fade-up on scroll
- Shimmer text effects
- Floating elements
- Pulse-glow markers
- Carousel auto-scroll
- Counter animations

---

## ✅ Checklist

- [x] Dashboard with stats
- [x] Map with 80+ markers
- [x] Heritage detail pages
- [x] Voice player (11 languages)
- [x] Category filters
- [x] UNESCO toggle
- [x] District filters
- [x] Responsive layout
- [x] Glass-morphism UI
- [x] Animated components

---

## 🚀 Next Steps

1. Add AI Explorer page (chat interface)
2. Add Analytics page (charts)
3. Add Stories page (narrative mode)
4. Add Profile page (favorites, history)
5. Mobile optimization
6. PWA support
7. Image lightbox
8. Share functionality

---

## 📄 License

Part of Tamil Nadu Heritage Management System — Major Project

---

**Built with ❤️ for preserving Tamil Nadu's heritage**
