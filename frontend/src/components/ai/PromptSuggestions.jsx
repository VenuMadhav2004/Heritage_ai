// components/ai/PromptSuggestions.jsx
export function PromptSuggestions({ onSelect }) {
  const prompts = [
    { icon: "🏛️", label: "Tell me about Brihadeeswarar Temple",    category: "Heritage" },
    { icon: "⚔️", label: "Explain the Chola dynasty's legacy",      category: "Dynasty"  },
    { icon: "🌍", label: "List all UNESCO sites in Tamil Nadu",      category: "UNESCO"   },
    { icon: "🗿", label: "Describe Pallava temple architecture",     category: "Architecture" },
    { icon: "📖", label: "Generate a story about Mahabalipuram",     category: "Story"    },
    { icon: "🗺️", label: "What are the must-visit sites in Madurai?", category: "Travel"  },
    { icon: "⏳", label: "Create a timeline of Tamil Nadu heritage", category: "Timeline" },
    { icon: "🎨", label: "Describe Dravidian art and sculpture",     category: "Art"      },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {prompts.map((p) => (
        <button
          key={p.label}
          onClick={() => onSelect(p.label)}
          className="group text-left px-3.5 py-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(201,168,76,0.06)] hover:border-[rgba(201,168,76,0.2)] transition-all duration-200"
        >
          <span className="text-base mb-1.5 block">{p.icon}</span>
          <span className="text-[#A0A0C0] text-xs leading-tight group-hover:text-[#E8C96A] transition-colors line-clamp-2">
            {p.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// components/ai/AIResponseCard.jsx
import { useState, useEffect } from "react";

export function AIResponseCard({ response, loading, prompt }) {
  const [displayed, setDisplayed] = useState("");
  const [done,      setDone]      = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!response || loading) { setDisplayed(""); setDone(false); return; }
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(response.slice(0, i));
      i += 3;
      if (i > response.length) { setDisplayed(response); setDone(true); clearInterval(id); }
    }, 12);
    return () => clearInterval(id);
  }, [response, loading]);

  if (!loading && !response) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-[rgba(201,168,76,0.15)] bg-[rgba(201,168,76,0.04)]">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[rgba(201,168,76,0.1)] flex items-center gap-3">
        <div className="w-6 h-6 rounded-lg bg-[rgba(201,168,76,0.15)] flex items-center justify-center text-sm">✦</div>
        <span className="text-[#C9A84C] text-xs font-medium tracking-wide">AI Response</span>
        {!done && !loading && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />}
      </div>

      {/* Body */}
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[100, 85, 92, 70].map((w, i) => (
              <div key={i} className="h-3 rounded bg-gradient-to-r from-[#1A1A28] via-[#22223A] to-[#1A1A28] animate-[shimmer_1.5s_infinite]" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <div>
            {prompt && (
              <p className="text-[#6B6B8F] text-xs italic mb-4 pb-3 border-b border-[rgba(255,255,255,0.04)]">
                "{prompt}"
              </p>
            )}
            <p className="text-[#C8C8DC] leading-[1.85] font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem" }}>
              {displayed}
              {!done && <span className="animate-pulse text-[#C9A84C]">▋</span>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
