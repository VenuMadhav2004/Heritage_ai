export function StoryMode({ site, onClose }) {
  const story = site.history || site.description || "Story coming soon...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,5,10,0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10"
          style={{ background: "radial-gradient(ellipse, #C9A84C, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4 opacity-40">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A84C]" />
            <span className="text-[#C9A84C]">◈</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A84C]" />
          </div>
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-3">Story Mode</p>
          <h2 className="font-display text-4xl text-white font-light">{site.name}</h2>
          {site.tamil_name && <p className="font-['Noto_Serif_Tamil'] text-[#C9A84C] mt-2">{site.tamil_name}</p>}
        </div>

        {/* Story body */}
        <div className="prose prose-invert max-w-none">
          {story.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} className="text-[#C8C8DC] leading-[1.9] text-base mb-5 font-light
              animate-[fadeUp_0.6s_ease_forwards] opacity-0"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards",
                fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>
              {para}
            </p>
          ))}
        </div>

        {/* Close */}
        <div className="text-center mt-8">
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-[rgba(201,168,76,0.3)] text-[#C9A84C] text-sm hover:bg-[rgba(201,168,76,0.08)] transition-all">
            Close Story
          </button>
        </div>
      </div>
    </div>
  );
}
