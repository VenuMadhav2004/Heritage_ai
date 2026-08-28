// pages/AIExplorer.jsx — REAL WOW AI with Gemini, Image Upload, Voice, TTS
import { useState, useRef, useEffect } from "react";
import { MainLayout } from "../layout/MainLayout.jsx";
import api from "../services/api.js";

// API endpoints — read from environment, fall back to localhost for dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const API_BASE = API_URL.replace("/api/v1", "");

const SUGGESTIONS = [
  { id: 1, icon: "🏛️", text: "Tell me about Brihadeeswarar Temple" },
  { id: 2, icon: "⚔️", text: "Explain the Chola dynasty's legacy" },
  { id: 3, icon: "🌍", text: "List UNESCO sites in Tamil Nadu" },
  { id: 4, icon: "📖", text: "Write a story about Mahabalipuram" },
  { id: 5, icon: "🗺️", text: "Suggest a 5-day heritage tour" },
  { id: 6, icon: "🎨", text: "Describe Dravidian architecture" },
];

const TTS_LANGS = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
];

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 px-4 py-3">
      {[0, 0.15, 0.3].map((delay, i) => (
        <div key={i} className="w-2 h-2 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: `${delay}s` }} />
      ))}
    </div>
  );
}

function ChatMessage({ msg, onSpeak }) {
  const [showTTS, setShowTTS] = useState(false);
  const isUser = msg.role === "user";
  
  return (
    <div className={`flex gap-4 mb-6 ${isUser ? "justify-end" : ""} animate-fade-up group`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light flex items-center justify-center shadow-gold-sm">
          <span className="text-stone-dark font-bold text-lg">✦</span>
        </div>
      )}

      <div className={`max-w-3xl ${isUser ? "text-right" : ""}`}>
        <div className={`inline-block px-5 py-3 rounded-2xl relative ${isUser ? "bg-gold/15 border border-gold/30 text-cream" : "bg-stone-light/40 border border-stone-mid/40 text-cream/90"}`}>
          <div className="prose prose-invert max-w-none">
            <p className="leading-relaxed whitespace-pre-wrap text-[15px] m-0">{msg.content}</p>
          </div>
          
          {/* TTS Button for AI messages */}
          {!isUser && msg.content && (
            <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowTTS(!showTTS)}
                className="w-8 h-8 rounded-lg bg-gold/20 hover:bg-gold/30 border border-gold/40 flex items-center justify-center transition-all"
                title="Speak this message"
              >
                <span className="text-gold text-sm">🔊</span>
              </button>
              
              {showTTS && (
                <div className="absolute top-full mt-2 right-0 glass-dark rounded-xl p-3 border border-gold/20 shadow-gold min-w-[200px] z-10">
                  <p className="text-cream/60 text-xs mb-2">Select Language:</p>
                  <div className="space-y-1">
                    {TTS_LANGS.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { onSpeak(msg.content, lang.code); setShowTTS(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gold/10 transition-all text-left"
                      >
                        <span>{lang.flag}</span>
                        <span className="text-cream text-sm">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`text-cream/30 text-[11px] mt-1.5 px-2 ${isUser ? "text-right" : ""}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-light/60 border border-gold/20 flex items-center justify-center">
          <span className="text-gold text-lg">◎</span>
        </div>
      )}
    </div>
  );
}

export function AIExplorer() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text = input, image = imageFile) => {
    if (!text.trim() && !image) return;

    const userMsg = {
      role: "user",
      content: image ? `[Image] ${text.trim() || "Analyze this image"}` : text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setImageFile(null);
    setImagePreview(null);
    setIsTyping(true);

    try {
      let response;
      
      if (image) {
        // Image + text request
        const formData = new FormData();
        formData.append("message", text.trim() || "What is this temple? Describe it in detail.");
        formData.append("image", image);
        
        const res = await fetch(`${API_URL}/ai/chat/vision`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        response = data.response;
      } else {
        // Text-only request
        const history = messages.map((m) => ({ role: m.role, content: m.content }));
        
        const res = await fetch(`${API_URL}/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            conversation_history: history,
          }),
        });
        const data = await res.json();
        response = data.response;
      }

      const aiMsg = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error("AI error:", e);
      const errorMsg = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please check if the backend is running and try again.",
        timestamp: new Date(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSpeak = async (text, lang) => {
    try {
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        setAudioPlaying(null);
      }

      const res = await fetch(`${API_URL}/ai/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: lang }),
      });
      const data = await res.json();

      if (data.success) {
        const audioUrl = `${API_BASE}${data.audio_url}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setAudioPlaying(lang);
        audio.onended = () => setAudioPlaying(null);
        await audio.play();
      }
    } catch (e) {
      console.error("TTS error:", e);
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <MainLayout title="WOW AI">
      <div className="flex flex-col h-[calc(100vh-var(--navbar-h))]">
        
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto">
            
            {showWelcome && (
              <div className="text-center mb-12 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-dark via-gold to-gold-light mb-6 shadow-gold animate-float">
                  <span className="text-4xl text-stone-dark">✦</span>
                </div>
                <h1 className="font-display text-5xl text-cream mb-4">WOW AI Explorer</h1>
                <p className="text-cream/60 text-lg max-w-2xl mx-auto mb-2">
                  Real Gemini AI • Image Recognition • Voice Output
                </p>
                <p className="text-gold/60 text-sm">
                  Upload temple photos, ask questions, get AI responses in 11 languages
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto mt-8">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => sendMessage(s.text)}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-stone-light/20 border border-stone-mid/40 hover:bg-gold/10 hover:border-gold/30 transition-all text-left animate-fade-up"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{s.icon}</div>
                      <span className="text-cream/80 group-hover:text-cream text-sm font-medium flex-1">{s.text}</span>
                      <span className="text-gold/40 group-hover:text-gold transition-colors text-sm">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} onSpeak={handleSpeak} />
            ))}

            {isTyping && (
              <div className="flex gap-4 mb-6 animate-fade-up">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light flex items-center justify-center shadow-gold-sm">
                  <span className="text-stone-dark font-bold text-lg animate-pulse">✦</span>
                </div>
                <div className="bg-stone-light/40 border border-stone-mid/40 rounded-2xl">
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-gold/20 bg-stone-dark/95 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-6 py-4">
            
            {/* Image preview */}
            {imagePreview && (
              <div className="mb-3 flex items-center gap-3 glass rounded-xl p-3 border border-gold/20">
                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-cream text-sm">Image attached</p>
                  <p className="text-cream/40 text-xs">{imageFile?.name}</p>
                </div>
                <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-cream/60 hover:text-ember transition-colors">✕</button>
              </div>
            )}

            <div className="flex items-end gap-3">
              {/* Image upload button */}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-stone-light/40 hover:bg-gold/10 border border-gold/15 hover:border-gold/30 flex items-center justify-center transition-all disabled:opacity-40"
                title="Upload image"
              >
                <span className="text-xl">📸</span>
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder={imageFile ? "Ask about this image..." : "Ask about heritage, upload a temple photo..."}
                rows={1}
                className="flex-1 px-5 py-4 rounded-2xl resize-none bg-stone-light/40 border border-gold/15 text-cream placeholder:text-cream/30 text-[15px] focus:outline-none focus:border-gold/40 transition-all"
                style={{ maxHeight: "120px", minHeight: "48px" }}
                disabled={isTyping}
                onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              />

              <button
                onClick={() => sendMessage()}
                disabled={(!input.trim() && !imageFile) || isTyping}
                className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-dark via-gold to-gold-light hover:shadow-gold hover:scale-105 disabled:opacity-40 disabled:scale-100 transition-all flex items-center justify-center"
              >
                {isTyping ? (
                  <div className="w-5 h-5 border-2 border-stone-dark/30 border-t-stone-dark rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6 text-stone-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </button>
            </div>

            <p className="text-cream/30 text-xs mt-3 flex items-center justify-center gap-4">
              <span>📸 Upload temple photos for AI identification</span>
              <span className="text-cream/20">•</span>
              <span>🔊 Click speaker icon to hear responses</span>
            </p>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default AIExplorer;
