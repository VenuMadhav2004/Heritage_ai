// services/api.js — connects to Tamil Nadu Heritage FastAPI backend
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Static files (images, audio) are served from the server root, not under /api/v1
const STATIC_BASE = BASE.replace(/\/api\/v1\/?$/, "");

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ── Heritage ───────────────────────────────────────────────────────────────
export const api = {
  // GET /heritage/  — paginated list
  getHeritage: (page = 1, pageSize = 20) =>
    req(`/heritage/?page=${page}&page_size=${pageSize}`),

  // GET /heritage/{id}
  getHeritageById: (id) => req(`/heritage/${id}`),

  // POST /heritage/search
  searchHeritage: (filters) =>
    req(`/heritage/search`, { method: "POST", body: JSON.stringify(filters) }),

  // GET /heritage/unesco/sites
  getUnesco: () => req(`/heritage/unesco/sites`),

  // GET /heritage/map/markers  — compact for map
  getMapMarkers: () => req(`/heritage/map/markers`),

  // GET /heritage/category/{name}
  getByCategory: (cat) => req(`/heritage/category/${encodeURIComponent(cat)}`),

  // GET /heritage/district/{name}
  getByDistrict: (d) => req(`/heritage/district/${encodeURIComponent(d)}`),

  // GET /heritage/dynasty/{name}
  getByDynasty: (d) => req(`/heritage/dynasty/${encodeURIComponent(d)}`),

  // POST /heritage/{id}/generate-ai/{type}
  generateAI: (id, type) =>
    req(`/heritage/${id}/generate-ai/${type}`, { method: "POST" }),

  // ── Analytics ─────────────────────────────────────────────────────────────
  // GET /analytics/dashboard  — all stats in one call
  getDashboard: () => req(`/analytics/dashboard`),

  // GET /analytics/overview
  getOverview: () => req(`/analytics/overview`),

  // GET /analytics/districts
  getDistricts: () => req(`/analytics/districts`),

  // GET /analytics/categories
  getCategories: () => req(`/analytics/categories`),

  // GET /analytics/dynasties
  getDynasties: () => req(`/analytics/dynasties`),

  // GET /analytics/unesco
  getUnescoAnalysis: () => req(`/analytics/unesco`),

  // GET /analytics/geographic-coverage
  getGeoCoverage: () => req(`/analytics/geographic-coverage`),

  // ── TTS ───────────────────────────────────────────────────────────────────
  // GET /tts/status
  getTTSStatus: () => req(`/tts/status`),

  // POST /tts/generate/{id}?lang=en
  generateVoice: (id, lang = "en") =>
    req(`/tts/generate/${id}?lang=${lang}`, { method: "POST" }),

  // Optional fallback play URL (not needed if using full_url)
  getPlayUrl: (id, lang = "en") =>
    `${BASE}/tts/play/${id}?lang=${lang}`,

  // ── Upload ────────────────────────────────────────────────────────────────
  getMissingImages: () => req(`/upload/images/missing`),

  // ── System ────────────────────────────────────────────────────────────────
  getHealth: () => req(`/health`, { headers: {} }),  // no prefix needed but ok

  // ── Static asset helpers ──────────────────────────────────────────────────
  // Image URL helper — filename stored in DB → full static URL
  imageUrl: (filename) =>
    filename ? `${STATIC_BASE}/static/images/${filename}` : null,

  // Audio URL helper — accepts either a bare filename or a server path
  // like "/static/audio/foo.mp3" (as returned by the TTS endpoints).
  audioUrl: (pathOrFilename) => {
    if (!pathOrFilename) return null;
    if (/^https?:\/\//i.test(pathOrFilename)) return pathOrFilename;
    if (pathOrFilename.startsWith("/")) return `${STATIC_BASE}${pathOrFilename}`;
    return `${STATIC_BASE}/static/audio/${pathOrFilename}`;
  },

  // Exposed for components that need to build their own static URLs
  staticBase: STATIC_BASE,
};

export default api;
