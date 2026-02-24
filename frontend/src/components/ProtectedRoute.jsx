// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/firebase.js";

export function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    // Not logged in, redirect to auth page
    return <Navigate to="/auth" replace />;
  }

  // Logged in, show the protected content
  return children;
}

export default ProtectedRoute;
