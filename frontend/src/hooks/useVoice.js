// hooks/useVoice.js
import { useState, useRef } from "react";
import api from "../services/api";

export function useVoice() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lang,    setLang]    = useState("en");
  const audioRef = useRef(null);

  const play = async (siteId, langCode = lang) => {
    setLoading(true);
    try {
      const res = await api.generateVoice(siteId, langCode);
      if (res.full_url) {
        audioRef.current?.pause();
        audioRef.current = new Audio(res.full_url);
        audioRef.current.onended = () => setPlaying(false);
        await audioRef.current.play();
        setPlaying(true);
      }
    } finally { setLoading(false); }
  };

  const stop = () => { audioRef.current?.pause(); setPlaying(false); };

  return { playing, loading, lang, setLang, play, stop };
}
