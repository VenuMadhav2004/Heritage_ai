// pages/MapPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout.jsx";
import { MapView } from "../components/map/MapView.jsx";
import { MapFilters } from "../components/map/MapFilters.jsx";
import { AnimatedButton } from "../components/ui/index.jsx";

export function MapPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: null,
    district: null,
    unescoOnly: false,
  });
  const [fullscreen, setFullscreen] = useState(false);

  const handleMarkerClick = (site) => {
    navigate(`/heritage/${site.id}`);
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-dark">
        <div className="absolute top-4 right-4 z-10">
          <AnimatedButton
            variant="glass"
            size="sm"
            onClick={() => setFullscreen(false)}
          >
            ✕ Exit Fullscreen
          </AnimatedButton>
        </div>
        <MapView filters={filters} onMarkerClick={handleMarkerClick} />
      </div>
    );
  }

  return (
    <MainLayout title="Explore Map">
      <div className="p-6 flex gap-4 h-[calc(100vh-var(--navbar-h)-48px)]">
        
        {/* Filters Sidebar */}
        <div className="w-72 flex-shrink-0">
          <MapFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapView filters={filters} onMarkerClick={handleMarkerClick} />
          
          {/* Fullscreen button */}
          <div className="absolute bottom-4 right-4">
            <AnimatedButton
              variant="glass"
              size="sm"
              onClick={() => setFullscreen(true)}
            >
              ⛶ Fullscreen
            </AnimatedButton>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default MapPage;
