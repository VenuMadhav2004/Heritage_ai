// hooks/useRecommendations.js
import { useState, useEffect } from "react";
import api from "../services/api";

export function useRecommendations(currentSiteId) {
  const [recs,    setRecs]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentSiteId) return;
    setLoading(true);
    api.getHeritage(1, 49)
      .then(d => {
        const others = (d.items || []).filter(s => s.id !== parseInt(currentSiteId));
        setRecs(others.sort(() => Math.random() - 0.5).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [currentSiteId]);

  return { recs, loading };
}
