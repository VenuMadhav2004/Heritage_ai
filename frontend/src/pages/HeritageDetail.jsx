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