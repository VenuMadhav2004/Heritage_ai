// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { PageLoader } from "./components/ui/index.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Public pages
import Auth from "./pages/Auth.jsx";

// Protected pages (lazy-loaded)
import { Dashboard } from "./pages/Dashboard.jsx";
const MapPage = lazy(() => import("./pages/MapPage.jsx"));
const AIExplorer = lazy(() => import("./pages/AIExplorer.jsx"));
const StoriesPage = lazy(() => import("./pages/StoriesPage.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const HeritageDetail = lazy(() => import("./pages/HeritageDetail.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Route */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AIExplorer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stories"
            element={
              <ProtectedRoute>
                <StoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/heritage/:id"
            element={
              <ProtectedRoute>
                <HeritageDetail />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
