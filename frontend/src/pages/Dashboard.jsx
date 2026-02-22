// pages/Dashboard.jsx
import { MainLayout }          from "../layout/MainLayout.jsx";
import { PremiumHero }         from "../components/dashboard/PremiumHero.jsx";
import { StatsPanel }          from "../components/dashboard/StatsPanel.jsx";
import { FeaturedCarousel }    from "../components/dashboard/FeaturedCarousel.jsx";
import { RecommendationPanel } from "../components/dashboard/RecommendationPanel.jsx";
import useFetch from "../hooks/useFetch.js";
import api from "../services/api.js";

export function Dashboard() {
  const { data } = useFetch(() => api.getDashboard());
  const overview = data?.overview || {};

  return (
    <MainLayout title="Dashboard">

      {/* ── Premium Hero ──────────────────────────────────────────────── */}
      <PremiumHero
        totalSites={overview.total_sites   || 49}
        unescoCount={overview.unesco_sites || 4}
      />

      {/* ── Animated Stats ────────────────────────────────────────────── */}
      <StatsPanel />

      {/* ── Featured Carousel ─────────────────────────────────────────── */}
      <FeaturedCarousel />

      {/* ── Discover More (UNESCO / Category / Map / Dynasty) ─────────── */}
      <RecommendationPanel />

    </MainLayout>
  );
}

export default Dashboard;
