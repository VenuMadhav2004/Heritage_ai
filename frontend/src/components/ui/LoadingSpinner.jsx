// components/ui/LoadingSpinner.jsx
export function LoadingSpinner({ size = "md" }) {
  const s = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className={`${s} rounded-full border-2 border-[rgba(201,168,76,0.15)] border-t-[#C9A84C] animate-spin`} />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0F] flex flex-col items-center justify-center gap-6 z-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-[1.5px] border-[rgba(201,168,76,0.15)] border-t-[#C9A84C] animate-spin" />
        <div className="absolute inset-2 rounded-full border-[1.5px] border-[rgba(201,168,76,0.08)] border-b-[#E8C96A] animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.2s" }} />
        <div className="absolute inset-4 w-8 h-8 rounded-full flex items-center justify-center">
          <span className="text-[#C9A84C] text-lg">🏛️</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-display text-[#C9A84C] tracking-[0.4em] uppercase text-xs">Loading Heritage</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#12121A] border border-[rgba(255,255,255,0.04)]">
      <div className="h-44 bg-gradient-to-r from-[#12121A] via-[#1A1A28] to-[#12121A] bg-[length:200%] animate-[shimmer_1.5s_infinite]" />
      <div className="p-5 space-y-3">
        <div className="h-5 rounded bg-gradient-to-r from-[#12121A] via-[#1A1A28] to-[#12121A] bg-[length:200%] animate-[shimmer_1.5s_infinite] w-3/4" />
        <div className="h-3 rounded bg-gradient-to-r from-[#12121A] via-[#1A1A28] to-[#12121A] bg-[length:200%] animate-[shimmer_1.5s_infinite] w-1/2" />
        <div className="h-3 rounded bg-gradient-to-r from-[#12121A] via-[#1A1A28] to-[#12121A] bg-[length:200%] animate-[shimmer_1.5s_infinite]" />
      </div>
    </div>
  );
}

export default LoadingSpinner;
