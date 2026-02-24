// pages/Dashboard.jsx — Fully Responsive for All Screens
import { MainLayout } from "../layout/MainLayout.jsx";
import { PremiumHero } from "../components/dashboard/PremiumHero.jsx";
import { StatsPanel } from "../components/dashboard/StatsPanel.jsx";
import { FeaturedCarousel } from "../components/dashboard/FeaturedCarousel.jsx";
import { RecommendationPanel } from "../components/dashboard/RecommendationPanel.jsx";
import useFetch from "../hooks/useFetch.js";
import api from "../services/api.js";

export function Dashboard() {
  const { data } = useFetch(() => api.getDashboard());
  const overview = data?.overview || {};

  return (
    <MainLayout title="Dashboard">
      
      {/* Hero Section - Full viewport height, responsive */}
      <div className="w-full">
        <PremiumHero
          totalSites={overview.total_sites || 80}
          unescoCount={overview.unesco_sites || 4}
          districts={overview.total_districts || 22}
          languages={11}
        />
      </div>

      {/* Stats Panel - Responsive grid */}
      <div className="w-full px-4 md:px-6 py-6 md:py-8">
        <StatsPanel />
      </div>

      {/* Featured Carousel - Horizontal scroll, responsive cards */}
      <div className="w-full py-6 md:py-8">
        <FeaturedCarousel />
      </div>

      {/* Recommendations - Responsive grid */}
      <div className="w-full px-4 md:px-6 py-6 md:py-8 pb-12">
        <RecommendationPanel />
      </div>

    </MainLayout>
  );
}

export default Dashboard;
