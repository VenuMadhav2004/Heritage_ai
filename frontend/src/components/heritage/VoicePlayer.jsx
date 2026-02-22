import { useState, useEffect, useRef } from "react";
import api from "../../services/api.js";
import { AnimatedButton } from "../ui/index.jsx";

export function VoicePlayer({ heritageId }) {
  const [languages, setLanguages] = useState([]);
  const [lang, setLang] = useState("en");
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  // 🔥 Load languages dynamically from backend
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const res = await api.getTTSStatus(); // must call /tts/status
        if (res.ready) {
          setLanguages(res.languages);
        }
      } catch (err) {
        console.error("Failed to load languages", err);
      }
    };
    loadLanguages();
  }, []);

  const handlePlay = async () => {
    try {
      setPlaying(true);

      // Stop previous audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // 🔥 Generate audio (backend returns full_url)
      const result = await api.generateVoice(heritageId, lang);

      if (!result.success) {
        throw new Error(result.error);
      }

      const audio = new Audio(result.full_url);
      audioRef.current = audio;

      audio.play();

      audio.onended = () => {
        setPlaying(false);
      };

    } catch (e) {
      console.error("TTS failed:", e);
      setPlaying(false);
    }
  };

  return (
    <div className="glass-dark rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎙️</span>
        <h3 className="font-display text-lg text-cream">Audio Guide</h3>
      </div>

      {/* Language selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`
              px-3 py-2 rounded-lg text-sm border transition-all
              ${lang === l.code
                ? "bg-gold/15 border-gold/40 text-gold"
                : "border-stone-mid/40 text-cream/50 hover:border-gold/30"
              }
            `}
          >
            {l.flag} {l.name}
          </button>
        ))}
      </div>

      {/* Play button */}
      <AnimatedButton
        variant="gold"
        size="lg"
        className="w-full justify-center"
        onClick={handlePlay}
        disabled={playing}
      >
        {playing ? "🔊 Playing..." : "▶️ Play Audio"}
      </AnimatedButton>
    </div>
  );
}