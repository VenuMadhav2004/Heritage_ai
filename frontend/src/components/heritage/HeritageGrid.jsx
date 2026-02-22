// components/heritage/HeritageGrid.jsx
import { HeritageCard } from "./HeritageCard";
import { SkeletonCard } from "../ui/LoadingSpinner";

export function HeritageGrid({ sites = [], loading = false, onSiteClick }) {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!sites.length) return (
    <div className="py-24 text-center">
      <p className="font-display text-3xl text-[rgba(201,168,76,0.3)] mb-3">No Sites Found</p>
      <p className="text-[#6B6B8F] text-sm">Try adjusting your filters</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {sites.map((site, i) => (
        <div
          key={site.id}
          className="animate-[fadeUp_0.5s_ease_forwards] opacity-0"
          style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
        >
          <HeritageCard site={site} onClick={onSiteClick} />
        </div>
      ))}
    </div>
  );
}
export default HeritageGrid;
