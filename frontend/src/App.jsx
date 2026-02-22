// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { PageLoader } from "./components/ui/index.jsx";

// Eager-load Dashboard (first page)
import { Dashboard } from "./pages/Dashboard.jsx";

// Lazy-load all other pages
const MapPage      = lazy(() => import("./pages/MapPage.jsx"));
const AIExplorer   = lazy(() => import("./pages/AIExplorer.jsx"));
const StoriesPage  = lazy(() => import("./pages/StoriesPage.jsx"));
const Profile      = lazy(() => import("./pages/Profile.jsx"));
const HeritageDetail = lazy(() => import("./pages/HeritageDetail.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/map"            element={<MapPage />} />
          <Route path="/ai"             element={<AIExplorer />} />
          <Route path="/stories"        element={<StoriesPage />} />
          <Route path="/profile"        element={<Profile />} />
          <Route path="/heritage/:id"   element={<HeritageDetail />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
