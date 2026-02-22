export function Timeline({ site }) {
  // 🛑 Prevent crash when site not loaded yet
  if (!site) return null;

  const events = [
    site.year_built && {
      year: site.year_built,
      label: "Construction",
      desc: `Built during the ${site.dynasty || ""} period`,
    },
    site.period && {
      year: site.period,
      label: "Historical Era",
      desc: `${site.period} period of Tamil Nadu`,
    },
    site.unesco_site && {
      year: "1987",
      label: "UNESCO Recognition",
      desc: site.unesco_criteria || "World Heritage Site designation",
    },
  ].filter(Boolean);

  if (!events.length) return null;

  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-[#C9A84C] via-[rgba(201,168,76,0.3)] to-transparent" />

      <div className="space-y-8">
        {events.map((ev, i) => (
          <div
            key={i}
            className="relative animate-[fadeUp_0.5s_ease_forwards] opacity-0"
            style={{
              animationDelay: `${i * 150}ms`,
              animationFillMode: "forwards",
            }}
          >
            <div
              className="absolute -left-[21px] w-3 h-3 rounded-full border-2 border-[#C9A84C] bg-[#0A0A0F]"
              style={{ boxShadow: "0 0 10px rgba(201,168,76,0.5)" }}
            />

            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-[rgba(201,168,76,0.15)] transition-colors">
              <span className="text-[#C9A84C] text-xs font-mono tracking-wider font-medium">
                {ev.year}
              </span>
              <h4 className="font-display text-lg text-white mt-1 mb-1">
                {ev.label}
              </h4>
              <p className="text-[#6B6B8F] text-sm leading-relaxed">
                {ev.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}