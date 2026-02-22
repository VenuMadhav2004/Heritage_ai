"""
TTS Service — Tamil Nadu Heritage Management System
Dynamic multi-language voice generation
Supports 11 languages: 5 Indian + 6 International
Generated ON DEMAND when user clicks the voice button
"""
import os
import re
import logging
import time
from pathlib import Path
from typing import Optional, Dict
from sqlalchemy.orm import Session

from config import (
    AUDIO_DIR,
    TTS_ENABLED,
    TTS_SUPPORTED_LANGUAGES,
    TTS_DEFAULT_LANG,
    get_audio_url,
)
from models.heritage import Heritage

logger = logging.getLogger(__name__)

# ─── gTTS import ─────────────────────────────────────────────────────────────
try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
    logger.info("✅ gTTS loaded")
except ImportError:
    GTTS_AVAILABLE = False
    logger.warning("⚠️  gTTS missing — pip install gTTS")


# ============================================================================
# HELPERS
# ============================================================================

def _safe_name(name: str) -> str:
    """brihadeeswarar_temple"""
    n = name.lower().strip()
    n = re.sub(r"[^a-z0-9\s]", "", n)
    return re.sub(r"\s+", "_", n)


def _audio_filename(site_name: str, lang: str) -> str:
    """brihadeeswarar_temple_en.mp3"""
    return f"{_safe_name(site_name)}_{lang}.mp3"


def _audio_path(site_name: str, lang: str) -> Path:
    return AUDIO_DIR / _audio_filename(site_name, lang)


def _validate_lang(lang: str) -> str:
    """Validate and return lang code, fallback to 'en'"""
    if lang in TTS_SUPPORTED_LANGUAGES:
        return lang
    logger.warning(f"Unsupported lang '{lang}', falling back to 'en'")
    return "en"


# ============================================================================
# SCRIPT BUILDERS — one per language family
# ============================================================================

def _build_script_english(h: Heritage) -> str:
    parts = [f"Welcome to {h.name}."]
    if h.district:
        parts.append(f"Located in {h.district} district, Tamil Nadu, India.")
    if h.dynasty:
        parts.append(f"Built during the {h.dynasty} dynasty.")
    if h.year_built:
        parts.append(f"It dates back to {h.year_built}.")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.architecture:
        parts.append(h.architecture)
    if h.unesco_site:
        c = f", known for {h.unesco_criteria}" if h.unesco_criteria else ""
        parts.append(f"This is a UNESCO World Heritage Site{c}.")
    if h.visiting_hours:
        parts.append(f"Visiting hours: {h.visiting_hours}.")
    if h.entry_fee:
        parts.append(f"Entry fee: {h.entry_fee}.")
    if h.best_time_to_visit:
        parts.append(f"Best time to visit: {h.best_time_to_visit}.")
    return "  ".join(parts)


def _build_script_tamil(h: Heritage) -> str:
    parts = []
    name = h.tamil_name or h.name
    parts.append(f"{name} இல் உங்களை வரவேற்கிறோம்.")
    if h.district:
        parts.append(f"இது தமிழ்நாடு, {h.district} மாவட்டத்தில் அமைந்துள்ளது.")
    if h.dynasty:
        parts.append(f"{h.dynasty} வம்சத்தால் கட்டப்பட்டது.")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("இது யுனெஸ்கோ உலக பாரம்பரிய தளமாகும்.")
    if h.visiting_hours:
        parts.append(f"காலை {h.visiting_hours} வரை திறந்திருக்கும்.")
    if h.entry_fee:
        parts.append(f"நுழைவு கட்டணம்: {h.entry_fee}.")
    return "  ".join(parts)


def _build_script_hindi(h: Heritage) -> str:
    parts = [f"{h.name} में आपका स्वागत है।"]
    if h.district:
        parts.append(f"यह तमिलनाडु के {h.district} जिले में स्थित है।")
    if h.dynasty:
        parts.append(f"यह {h.dynasty} वंश के काल में बनाया गया था।")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("यह एक यूनेस्को विश्व धरोहर स्थल है।")
    if h.visiting_hours:
        parts.append(f"दर्शन का समय: {h.visiting_hours}।")
    if h.entry_fee:
        parts.append(f"प्रवेश शुल्क: {h.entry_fee}।")
    return "  ".join(parts)


def _build_script_telugu(h: Heritage) -> str:
    parts = [f"{h.name} కు స్వాగతం."]
    if h.district:
        parts.append(f"ఇది తమిళనాడులోని {h.district} జిల్లాలో ఉంది.")
    if h.dynasty:
        parts.append(f"ఇది {h.dynasty} వంశం కాలంలో నిర్మించబడింది.")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("ఇది యునెస్కో ప్రపంచ వారసత్వ ప్రదేశం.")
    if h.visiting_hours:
        parts.append(f"సందర్శన వేళలు: {h.visiting_hours}.")
    if h.entry_fee:
        parts.append(f"ప్రవేశ రుసుము: {h.entry_fee}.")
    return "  ".join(parts)


def _build_script_kannada(h: Heritage) -> str:
    parts = [f"{h.name} ಗೆ ಸ್ವಾಗತ."]
    if h.district:
        parts.append(f"ಇದು ತಮಿಳುನಾಡಿನ {h.district} ಜಿಲ್ಲೆಯಲ್ಲಿದೆ.")
    if h.dynasty:
        parts.append(f"ಇದನ್ನು {h.dynasty} ರಾಜವಂಶದ ಕಾಲದಲ್ಲಿ ನಿರ್ಮಿಸಲಾಯಿತು.")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("ಇದು ಯುನೆಸ್ಕೋ ವಿಶ್ವ ಪರಂಪರೆ ತಾಣವಾಗಿದೆ.")
    if h.visiting_hours:
        parts.append(f"ಭೇಟಿ ವೇಳೆ: {h.visiting_hours}.")
    if h.entry_fee:
        parts.append(f"ಪ್ರವೇಶ ಶುಲ್ಕ: {h.entry_fee}.")
    return "  ".join(parts)


def _build_script_malayalam(h: Heritage) -> str:
    parts = [f"{h.name} -ലേക്ക് സ്വാഗതം."]
    if h.district:
        parts.append(f"ഇത് തമിഴ്നാട്ടിലെ {h.district} ജില്ലയിൽ സ്ഥിതിചെയ്യുന്നു.")
    if h.dynasty:
        parts.append(f"ഇത് {h.dynasty} രാജവംശ കാലഘട്ടത്തിൽ നിർമ്മിച്ചതാണ്.")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("ഇത് യുനെസ്‌കോ ലോക പൈതൃക സ്ഥലമാണ്.")
    if h.visiting_hours:
        parts.append(f"സന്ദർശന സമയം: {h.visiting_hours}.")
    if h.entry_fee:
        parts.append(f"പ്രവേശന ഫീസ്: {h.entry_fee}.")
    return "  ".join(parts)


def _build_script_french(h: Heritage) -> str:
    parts = [f"Bienvenue à {h.name}."]
    if h.district:
        parts.append(f"Situé dans le district de {h.district}, Tamil Nadu, Inde.")
    if h.dynasty:
        parts.append(f"Construit pendant la dynastie {h.dynasty}.")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("Ce site est classé au patrimoine mondial de l'UNESCO.")
    if h.visiting_hours:
        parts.append(f"Heures de visite: {h.visiting_hours}.")
    if h.entry_fee:
        parts.append(f"Entrée: {h.entry_fee}.")
    return "  ".join(parts)


def _build_script_german(h: Heritage) -> str:
    parts = [f"Willkommen bei {h.name}."]
    if h.district:
        parts.append(f"Befindet sich im Bezirk {h.district}, Tamil Nadu, Indien.")
    if h.dynasty:
        parts.append(f"Erbaut während der {h.dynasty}-Dynastie.")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("Diese Stätte ist UNESCO-Weltkulturerbe.")
    if h.visiting_hours:
        parts.append(f"Besuchszeiten: {h.visiting_hours}.")
    if h.entry_fee:
        parts.append(f"Eintritt: {h.entry_fee}.")
    return "  ".join(parts)


def _build_script_japanese(h: Heritage) -> str:
    parts = [f"{h.name}へようこそ。"]
    if h.district:
        parts.append(f"インド、タミル・ナードゥ州{h.district}地区に位置しています。")
    if h.dynasty:
        parts.append(f"{h.dynasty}朝時代に建設されました。")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("このサイトはユネスコ世界遺産に登録されています。")
    if h.visiting_hours:
        parts.append(f"見学時間：{h.visiting_hours}。")
    if h.entry_fee:
        parts.append(f"入場料：{h.entry_fee}。")
    return "  ".join(parts)


def _build_script_chinese(h: Heritage) -> str:
    parts = [f"欢迎来到{h.name}。"]
    if h.district:
        parts.append(f"位于印度泰米尔纳德邦{h.district}区。")
    if h.dynasty:
        parts.append(f"建于{h.dynasty}王朝时期。")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("这是联合国教科文组织世界遗产地。")
    if h.visiting_hours:
        parts.append(f"参观时间：{h.visiting_hours}。")
    if h.entry_fee:
        parts.append(f"门票：{h.entry_fee}。")
    return "  ".join(parts)


def _build_script_arabic(h: Heritage) -> str:
    parts = [f"مرحبًا بكم في {h.name}."]
    if h.district:
        parts.append(f"يقع في منطقة {h.district}، ولاية تاميل نادو، الهند.")
    if h.dynasty:
        parts.append(f"بُني خلال عهد أسرة {h.dynasty}.")
    if h.description:
        parts.append(h.description)
    if h.cultural_significance:
        parts.append(h.cultural_significance)
    if h.unesco_site:
        parts.append("هذا الموقع مدرج ضمن مواقع التراث العالمي لليونسكو.")
    if h.visiting_hours:
        parts.append(f"ساعات الزيارة: {h.visiting_hours}.")
    if h.entry_fee:
        parts.append(f"رسوم الدخول: {h.entry_fee}.")
    return "  ".join(parts)


# ─── Script dispatcher ────────────────────────────────────────────────────────
SCRIPT_BUILDERS = {
    "en": _build_script_english,
    "ta": _build_script_tamil,
    "hi": _build_script_hindi,
    "te": _build_script_telugu,
    "kn": _build_script_kannada,
    "ml": _build_script_malayalam,
    "fr": _build_script_french,
    "de": _build_script_german,
    "ja": _build_script_japanese,
    "zh": _build_script_chinese,
    "ar": _build_script_arabic,
}


def build_script(heritage: Heritage, lang: str) -> str:
    """Build the spoken script for any supported language"""
    builder = SCRIPT_BUILDERS.get(lang, _build_script_english)
    return builder(heritage)


# ============================================================================
# CORE GENERATE FUNCTION  ← called by API on button click
# ============================================================================
def generate_audio(
    heritage: Heritage,
    db: Session,
    lang: str = "en",
    force: bool = False,
) -> Dict:
    """
    Dynamically generate TTS audio for a heritage site in any supported language.

    Called on-demand when the user clicks the voice button and selects a language.
    Caches the result so re-clicking the same language is instant.

    Args:
        heritage : Heritage ORM instance
        db       : SQLAlchemy session
        lang     : Language code ('en','ta','hi','te','kn','ml','fr','de','ja','zh','ar')
        force    : Re-generate even if cached file exists

    Returns:
        dict with full_url ready to feed <audio src="...">
    """
    lang = _validate_lang(lang)

    if not TTS_ENABLED:
        return {"success": False, "error": "TTS disabled in config.py"}

    if not GTTS_AVAILABLE:
        return {
            "success": False,
            "error": "gTTS not installed. Run:  pip install gTTS",
        }

    # Language info for response
    lang_info = TTS_SUPPORTED_LANGUAGES.get(lang, {})
    out_path  = _audio_path(heritage.name, lang)
    filename  = _audio_filename(heritage.name, lang)

    # ── cache hit ──────────────────────────────────────────────────────────
    if out_path.exists() and not force:
        logger.info(f"🎵 Cache hit: {filename}")
        return {
            "success":       True,
            "cached":        True,
            "heritage_id":   heritage.id,
            "heritage_name": heritage.name,
            "lang":          lang,
            "lang_name":     lang_info.get("name", lang),
            "lang_native":   lang_info.get("native", lang),
            "filename":      filename,
            "full_url":      get_audio_url(filename),
            "file_size_kb":  round(out_path.stat().st_size / 1024, 2),
        }

    # ── build script ───────────────────────────────────────────────────────
    script = build_script(heritage, lang)
    if not script.strip():
        return {"success": False, "error": "No content to speak for this site"}

    # ── generate ───────────────────────────────────────────────────────────
    try:
        start = time.time()

        # gTTS slow=False for natural speed, tld varies by language
        tld_map = {
    "en": "co.in",
    "ta": "co.in",
    "hi": "co.in",
    "te": "co.in",
    "kn": "co.in",
    "ml": "co.in",
    "fr": "fr",
    "de": "de",
    "ja": "co.jp",
    "zh": "com.cn",
    "ar": "com.ar",
}
        tld = tld_map.get(lang, "com")

        tts = gTTS(text=script, lang=lang, slow=False, tld=tld)
        tts.save(str(out_path))

        elapsed_ms = int((time.time() - start) * 1000)

        # Update DB audio path
        heritage.audio_path = filename
        db.commit()

        logger.info(f"🎙️  Generated [{lang}] audio for '{heritage.name}' in {elapsed_ms}ms")

        return {
            "success":        True,
            "cached":         False,
            "heritage_id":    heritage.id,
            "heritage_name":  heritage.name,
            "lang":           lang,
            "lang_name":      lang_info.get("name", lang),
            "lang_native":    lang_info.get("native", lang),
            "lang_flag":      lang_info.get("flag", ""),
            "filename":       filename,
            "full_url":       get_audio_url(filename),
            "file_size_kb":   round(out_path.stat().st_size / 1024, 2),
            "generation_ms":  elapsed_ms,
            "script_length":  len(script),
        }

    except Exception as e:
        logger.error(f"❌ TTS [{lang}] failed for '{heritage.name}': {e}")
        # Clean up partial file if any
        if out_path.exists():
            os.remove(out_path)
        return {
            "success":     False,
            "heritage_id": heritage.id,
            "lang":        lang,
            "error":       str(e),
        }


# ============================================================================
# STATUS + LANGUAGES LIST (for frontend language picker)
# ============================================================================
def get_tts_status() -> Dict:
    """Return service status + full language list for the frontend picker"""
    return {
        "tts_enabled":      TTS_ENABLED,
        "gtts_available":   GTTS_AVAILABLE,
        "ready":            TTS_ENABLED and GTTS_AVAILABLE,
        "total_languages":  len(TTS_SUPPORTED_LANGUAGES),
        "languages":        [
            {
                "code":    code,
                "name":    info["name"],
                "native":  info["native"],
                "flag":    info["flag"],
                "region":  info["region"],
            }
            for code, info in TTS_SUPPORTED_LANGUAGES.items()
        ],
        "indian_languages": [
            c for c, i in TTS_SUPPORTED_LANGUAGES.items() if i["region"] == "Indian"
        ],
        "international_languages": [
            c for c, i in TTS_SUPPORTED_LANGUAGES.items() if i["region"] == "International"
        ],
    }


# ============================================================================
# AUDIO STATUS FOR ONE SITE
# ============================================================================
def get_site_audio_status(heritage: Heritage) -> Dict:
    """
    For each supported language, tell the frontend which audio files
    are already cached and which need to be generated.
    """
    languages = []
    for code, info in TTS_SUPPORTED_LANGUAGES.items():
        path    = _audio_path(heritage.name, code)
        exists  = path.exists()
        languages.append({
            "code":      code,
            "name":      info["name"],
            "native":    info["native"],
            "flag":      info["flag"],
            "region":    info["region"],
            "cached":    exists,
            "url":       get_audio_url(_audio_filename(heritage.name, code)) if exists else None,
            "size_kb":   round(path.stat().st_size / 1024, 2) if exists else 0,
            "generate_endpoint": f"/api/v1/tts/generate/{heritage.id}?lang={code}",
            "play_endpoint":     f"/api/v1/tts/play/{heritage.id}?lang={code}",
        })

    cached_count = sum(1 for l in languages if l["cached"])

    return {
        "heritage_id":   heritage.id,
        "heritage_name": heritage.name,
        "total_languages": len(languages),
        "cached_count":    cached_count,
        "languages":       languages,
    }


# ============================================================================
# DELETE ONE LANGUAGE AUDIO
# ============================================================================
def delete_audio_file(heritage: Heritage, db: Session, lang: str = "en") -> Dict:
    path = _audio_path(heritage.name, lang)
    if not path.exists():
        return {"success": False, "error": f"No audio file found for lang '{lang}'"}
    os.remove(path)
    heritage.audio_path = None
    db.commit()
    return {
        "success": True,
        "deleted": path.name,
        "message": f"Audio [{lang}] deleted for '{heritage.name}'",
    }