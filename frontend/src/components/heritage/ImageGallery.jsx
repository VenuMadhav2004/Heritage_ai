// components/heritage/ImageGallery.jsx
import api from "../../services/api";
import { useState } from "react";

export function ImageGallery({ site }) {
  const [lightbox, setLightbox] = useState(false);
  const imgUrl = api.imageUrl(site.image_url);

  return (
    <>
      <div
        className="relative h-[420px] rounded-2xl overflow-hidden cursor-zoom-in group"
        onClick={() => setLightbox(true)}
      >
        <img src={imgUrl} alt={site.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={e => { e.target.src = `https://picsum.photos/seed/${site.id}/800/500`; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-4 right-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-1.5 text-xs text-[#A0A0C0] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          🔍 Click to enlarge
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.95)] flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}>
          <img src={imgUrl} alt={site.name} className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
          <button className="absolute top-4 right-4 text-white text-2xl hover:text-[#C9A84C]">✕</button>
        </div>
      )}
    </>
  );
}
