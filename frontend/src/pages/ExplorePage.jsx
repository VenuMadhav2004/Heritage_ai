// pages/ExplorePage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HeritageGrid } from "../components/heritage/HeritageGrid";
import { FilterPanel }  from "../components/heritage/FilterPanel";
import api from "../services/api";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [sites,    setSites]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [page,     setPage]    = useState(1);
  const [total,    setTotal]   = useState(0);
  const [hasMore,  setHasMore] = useState(false);
  const [filters,  setFilters] = useState({ category: null, dynasty: null, unesco_only: false, query: "" });

  const load = useCallback(async (pg = 1, reset = true) => {
    setLoading(true);
    try {
      let data;
      if (filters.query || filters.category || filters.dynasty || filters.unesco_only) {
        data = await api.searchHeritage({
          query:       filters.query || undefined,
          category:    filters.category || undefined,
          dynasty:     filters.dynasty || undefined,
          unesco_only: filters.unesco_only || undefined,
          page: pg, page_size: 20,
        });
      } else {
        data = await api.getHeritage(pg, 20);
      }
      const items = data.items || [];
      setSites(prev => reset ? items : [...prev, ...items]);
      setTotal(data.total || 0);
      setHasMore((data.page || pg) < (data.total_pages || 1));
      setPage(pg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(1, true); }, [filters]);

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white font-light mb-2">Explore Heritage</h1>
        <p className="text-[#6B6B8F] text-sm">{total} sites across Tamil Nadu</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B8F]">🔍</span>
        <input
          type="text"
          value={filters.query}
          onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
          placeholder="Search by name, district, dynasty…"
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-[#6B6B8F] outline-none"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      {/* Grid */}
      <HeritageGrid sites={sites} loading={loading && page === 1}
        onSiteClick={s => navigate(`/heritage/${s.id}`)} />

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-8">
          <button onClick={() => load(page + 1, false)}
            disabled={loading}
            className="px-8 py-3 rounded-xl border border-[rgba(201,168,76,0.2)] text-[#C9A84C] text-sm hover:bg-[rgba(201,168,76,0.08)] disabled:opacity-50 transition-all">
            {loading ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
