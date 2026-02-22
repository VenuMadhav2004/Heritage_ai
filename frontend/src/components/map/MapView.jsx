// components/map/MapView.jsx
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api.js";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Category color mapping
const CATEGORY_COLORS = {
  Temple:              "#C9A84C",  // gold
  Fort:                "#C4622D",  // ember
  Palace:              "#9A7A2E",  // dark gold
  Monument:            "#2D7A5F",  // jade
  "Archaeological Site": "#E8C878",  // light gold
  Museum:              "#3D9A77",  // light jade
  Church:              "#C9A84C",  // gold
  "Natural Heritage":  "#2D7A5F",  // jade
};

function createCustomIcon(category, isUnesco) {
  const color = CATEGORY_COLORS[category] || "#C9A84C";
  const size = isUnesco ? 32 : 24;
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid ${isUnesco ? "#FFD700" : "rgba(255,255,255,0.3)"};
        border-radius: 50%;
        box-shadow: 0 0 ${isUnesco ? "20px" : "10px"} ${color}80,
                    0 4px 12px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isUnesco ? "16px" : "12px"};
        animation: ${isUnesco ? "pulse-glow 2s infinite" : "none"};
      ">
        ${isUnesco ? "★" : "◉"}
      </div>
      <style>
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px ${color}80, 0 4px 12px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 30px ${color}ff, 0 4px 12px rgba(0,0,0,0.5); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function MapView({ filters, onMarkerClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch markers
  useEffect(() => {
    async function fetchMarkers() {
      setLoading(true);
      try {
        const data = await api.getMapMarkers();
        setSites(data);
      } catch (e) {
        console.error("Failed to load map markers:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchMarkers();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Tamil Nadu center
    const map = L.map(mapRef.current, {
      center: [11.1271, 78.6569],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;
    markersLayer.current = L.featureGroup().addTo(map);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers based on filters
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current || loading) return;

    markersLayer.current.clearLayers();

    let filtered = sites;

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter((s) => s.category === filters.category);
    }
    if (filters.unescoOnly) {
      filtered = filtered.filter((s) => s.unesco_site);
    }
    if (filters.district) {
      filtered = filtered.filter((s) => s.district === filters.district);
    }

    // Add markers
    filtered.forEach((site) => {
      if (!site.latitude || !site.longitude) return;

      const icon = createCustomIcon(site.category, site.unesco_site);
      const marker = L.marker([site.latitude, site.longitude], { icon });

      // Popup content
      const imgUrl = api.imageUrl(site.image_url) || `https://picsum.photos/seed/${site.id}/300/200`;
      marker.bindPopup(`
        <div style="min-width: 200px; font-family: 'DM Sans', sans-serif;">
          <img src="${imgUrl}" 
               style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
               onerror="this.src='https://picsum.photos/seed/${site.id}/300/200'" />
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #C9A84C;">
            ${site.name}
          </h3>
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #888;">
            ${site.district} • ${site.category}
          </p>
          ${site.unesco_site ? '<span style="font-size: 10px; color: #FFD700;">★ UNESCO Site</span>' : ''}
        </div>
      `, {
        maxWidth: 220,
        className: "custom-popup",
      });

      marker.on("click", () => {
        if (onMarkerClick) onMarkerClick(site);
      });

      marker.addTo(markersLayer.current);
    });

    // Fit bounds if markers exist
    const layers = markersLayer.current.getLayers();

if (layers.length > 0) {
  const bounds = L.featureGroup(layers).getBounds();
  mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
}
  }, [sites, filters, loading, onMarkerClick]);

  return (
  <div className="relative w-full h-screen">
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
    />

    {loading && (
      <div className="absolute inset-0 flex items-center justify-center bg-stone-dark/80 backdrop-blur-sm rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-cream/50 text-sm">Loading map...</p>
        </div>
      </div>
    )}
  

      {/* Marker count */}
      {!loading && (
        <div className="absolute top-4 right-4 glass rounded-xl px-4 py-2 text-sm">
          <span className="text-gold font-mono">{markersLayer.current?.getLayers().length || 0}</span>
          <span className="text-cream/50 ml-2">markers</span>
        </div>
      )}

      {/* Custom popup styles */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: linear-gradient(135deg, rgba(42,35,24,0.95), rgba(26,22,15,0.95));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        .custom-popup .leaflet-popup-tip {
          background: rgba(42,35,24,0.95);
          border: 1px solid rgba(201,168,76,0.2);
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}

export default MapView;
