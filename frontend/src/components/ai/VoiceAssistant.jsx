// components/ai/VoiceAssistant.jsx
import { useState, useRef } from "react";
import api from "../../services/api";

const LANGS = {
  Indian: [
    { code: "ta", name: "Tamil",     native: "தமிழ்",   flag: "🇮🇳" },
    { code: "hi", name: "Hindi",     native: "हिन्दी",   flag: "🇮🇳" },
    { code: "te", name: "Telugu",    native: "తెలుగు",  flag: "🇮🇳" },
    { code: "kn", name: "Kannada",   native: "ಕನ್ನಡ",   flag: "🇮🇳" },
    { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  ],
  International: [
    { code: "en", name: "English",  native: "English",  flag: "🇬🇧" },
    { code: "fr", name: "French",   native: "Français", flag: "🇫🇷" },
    { code: "de", name: "German",   native: "Deutsch",  flag: "🇩🇪" },
    { code: "ja", name: "Japanese", native: "日本語",    flag: "🇯🇵" },
    { code: "zh", name: "Chinese",  native: "中文",      flag: "🇨🇳" },
    { code: "ar", name: "Arabic",   native: "العربية",  flag: "🇸🇦" },
  ],
};

export function VoiceAssistant({ siteId, siteName }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [selLang, setSelLang] = useState(null);
  const [error,   setError]   = useState(null);
  const audioRef              = useRef(null);

  const handlePlay = async (lang) => {
    setSelLang(lang.code);
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateVoice(siteId, lang.code);
      if (res.full_url) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(res.full_url);
        audioRef.current.onended = () => setPlaying(false);
        await audioRef.current.play();
        setPlaying(true);
        setOpen(false);
      }
    } catch (e) {
      setError("Could not generate audio. Check if TTS service is running.");
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    setPlaying(false);
    setSelLang(null);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => playing ? stopAudio() : setOpen(!open)}
        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
          playing
            ? "bg-[rgba(201,168,76,0.2)] border-[rgba(201,168,76,0.4)] text-[#E8C96A] animate-[pulseGold_2s_infinite]"
            : "bg-[rgba(201,168,76,0.08)] border-[rgba(201,168,76,0.2)] text-[#C9A84C] hover:bg-[rgba(201,168,76,0.15)]"
        }`}
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border border-[rgba(201,168,76,0.3)] border-t-[#C9A84C] animate-spin" />
        ) : (
          <span className="text-base">{playing ? "⏹" : "🔊"}</span>
        )}
        {playing ? `Playing ${selLang?.toUpperCase()}` : "Voice Guide"}
      </button>

      {/* Language picker modal */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-3 left-0 z-50 w-80 rounded-2xl overflow-hidden"
            style={{
              background: "#1A1A28",
              border: "1px solid rgba(201,168,76,0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Select Language</p>
                <p className="text-[#6B6B8F] text-xs">Voice guide for {siteName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#6B6B8F] hover:text-white text-lg">✕</button>
            </div>

            <div className="p-3 space-y-3 max-h-72 overflow-y-auto">
              {Object.entries(LANGS).map(([region, langs]) => (
                <div key={region}>
                  <p className="text-[#6B6B8F] text-[10px] tracking-[0.2em] uppercase px-1 mb-1.5">{region}</p>
                  <div className="grid grid-cols-1 gap-1">
                    {langs.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handlePlay(lang)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[rgba(201,168,76,0.08)] border border-transparent hover:border-[rgba(201,168,76,0.15)] transition-all group"
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="flex-1">
                          <span className="text-white text-sm group-hover:text-[#E8C96A] transition-colors">{lang.name}</span>
                          <span className="text-[#6B6B8F] text-xs ml-2">— {lang.native}</span>
                        </div>
                        <span className="text-[#C9A84C] text-xs opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.04)]">
                <p className="text-[#E84C6A] text-xs">{error}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default VoiceAssistant;
