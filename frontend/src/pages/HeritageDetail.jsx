// pages/HeritageDetail.jsx — Heritage Site Detail Page
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "../layout/MainLayout.jsx";
import { VoiceAssistant } from "../components/ai/VoiceAssistant.jsx";
import { GradientBadge, AnimatedButton } from "../components/ui/index.jsx";
import useFetch from "../hooks/useFetch.js";
import api from "../services/api.js";

export function HeritageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: site, loading } = useFetch(() => api.getHeritageById(id), [id]);

  // Save to history
  useEffect(() => {
    if (site) {
      const history = JSON.parse(localStorage.getItem("heritage_history") || "[]");
      const updated = [parseInt(id), ...history.filter(h => h !== parseInt(id))].slice(0, 20);
      localStorage.setItem("heritage_history", JSON.stringify(updated));
    }
  }, [site, id]);

  if (loading) {
    return (
      <MainLayout title="Loading...">
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!site) {
    return (
      <MainLayout title="Not Found">
        <div className="text-center py-20">
          <p className="text-cream/50 mb-4">Heritage site not found</p>
          <AnimatedButton variant="gold" onClick={() => navigate("/")}>
            ← Back to Dashboard
          </AnimatedButton>
        </div>
      </MainLayout>
    );
  }

  const imgUrl = api.imageUrl(site.image_url) || `https://picsum.photos/seed/${site.id}/1200/600`;

  return (
    <MainLayout title={site.name}>
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Hero Image + Title */}
        <div className="relative h-96 rounded-3xl overflow-hidden animate-fade-in">
          <img 
            src={imgUrl} 
            alt={site.name} 
            className="w-full h-full object-cover" 
            onError={(e) => { e.target.src = `https://picsum.photos/seed/${site.id}/1200/600`; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-dark via-stone-dark/60 to-transparent flex items-end p-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <GradientBadge color="gold">{site.category}</GradientBadge>
                {site.unesco_site && <GradientBadge color="ember">★ UNESCO</GradientBadge>}
                {site.dynasty && <GradientBadge color="jade">{site.dynasty}</GradientBadge>}
              </div>
              <h1 className="font-display text-5xl text-cream mb-2">{site.name}</h1>
              {site.tamil_name && <p className="text-cream/60 text-xl">{site.tamil_name}</p>}
              <p className="text-cream/50 mt-2">{site.district} • {site.period || "Ancient"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            {site.description && (
              <div className="glass-dark rounded-2xl p-6 animate-fade-up">
                <h2 className="font-display text-2xl text-gold mb-4">Overview</h2>
                <p className="text-cream/70 leading-relaxed">{site.description}</p>
              </div>
            )}

            {/* History */}
            {site.history && (
              <div className="glass-dark rounded-2xl p-6 animate-fade-up stagger-2">
                <h2 className="font-display text-2xl text-gold mb-4">Historical Significance</h2>
                <p className="text-cream/70 leading-relaxed whitespace-pre-wrap">{site.history}</p>
              </div>
            )}

            {/* Architecture */}
            {site.architecture && (
              <div className="glass-dark rounded-2xl p-6 animate-fade-up stagger-3">
                <h2 className="font-display text-2xl text-gold mb-4">Architecture</h2>
                <p className="text-cream/70 leading-relaxed whitespace-pre-wrap">{site.architecture}</p>
              </div>
            )}

            {/* Cultural Significance */}
            {site.cultural_significance && (
              <div className="glass-dark rounded-2xl p-6 animate-fade-up stagger-4">
                <h2 className="font-display text-2xl text-gold mb-4">Cultural Significance</h2>
                <p className="text-cream/70 leading-relaxed whitespace-pre-wrap">{site.cultural_significance}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Voice Assistant */}
            <div className="glass-dark rounded-2xl p-6 animate-fade-up stagger-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎙️</span>
                <h3 className="font-display text-lg text-cream">Audio Guide</h3>
              </div>
              <p className="text-cream/50 text-sm mb-4">
                Listen to AI-generated voice narration in 11 languages
              </p>
              <VoiceAssistant siteId={site.id} siteName={site.name} />
            </div>

            {/* Visitor Info */}
            <div className="glass-dark rounded-2xl p-6 animate-fade-up stagger-6">
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
                {site.year_built && (
                  <div className="flex justify-between">
                    <span className="text-cream/50">Built</span>
                    <span className="text-cream">{site.year_built}</span>
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
              <div className="glass-dark rounded-2xl p-6 animate-fade-up stagger-7">
                <h3 className="font-display text-lg text-cream mb-4">Location</h3>
                <p className="text-cream/60 text-sm mb-3">{site.location || site.district}</p>
                <p className="text-cream/40 text-xs font-mono mb-3">
                  {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                </p>
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