// routes.jsx
import { Routes, Route } from "react-router-dom";
import { MainLayout }   from "./layout/MainLayout";
import { Dashboard }    from "./pages/Dashboard";
import { lazy, Suspense } from "react";
import { PageLoader }   from "./components/ui/GradientBadge";

// Lazy load other pages
const MapPage       = lazy(() => import("./pages/MapPage"));
const AIExplorer    = lazy(() => import("./pages/AIExplorer"));
const StoriesPage   = lazy(() => import("./pages/StoriesPage"));
const Profile       = lazy(() => import("./pages/Profile"));
const HeritageDetail = lazy(() => import("./pages/HeritageDetail"));
const ExplorePage   = lazy(() => import("./pages/ExplorePage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index              element={<Dashboard />} />
          <Route path="explore"     element={<ExplorePage />} />
          <Route path="map"         element={<MapPage />} />
          <Route path="ai"          element={<AIExplorer />} />
          <Route path="stories"     element={<StoriesPage />} />
          <Route path="profile"     element={<Profile />} />
          <Route path="heritage/:id" element={<HeritageDetail />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
