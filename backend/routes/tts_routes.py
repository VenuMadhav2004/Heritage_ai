"""
TTS Routes — Tamil Nadu Heritage Management System
On-demand dynamic voice generation with language selection.
Triggered when user clicks the voice button on the frontend.
"""
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models.heritage import Heritage
from services.tts_service import (
    generate_audio,
    get_tts_status,
    get_site_audio_status,
    delete_audio_file,
    _audio_path,
    _audio_filename,
)

router = APIRouter(
    prefix="/tts",
    tags=["Voice / TTS"],
)


# ─── helper ──────────────────────────────────────────────────────────────────
def _get_or_404(db: Session, heritage_id: int) -> Heritage:
    h = db.query(Heritage).filter(Heritage.id == heritage_id).first()
    if not h:
        raise HTTPException(status_code=404, detail=f"Heritage site {heritage_id} not found")
    return h


# ============================================================================
# 1. LANGUAGES LIST
#    Frontend calls this to populate the language picker modal/dropdown
# ============================================================================
@router.get("/languages")
def list_languages():
    """
    Returns all supported languages for the voice button picker.

    **Frontend usage:**
    ```js
    // On page load, fetch language options
    const res  = await fetch('/api/v1/tts/languages');
    const data = await res.json();
    // data.languages → array of {code, name, native, flag, region}
    // Use to render a language selector modal / dropdown
    ```

    Returns 11 languages grouped as Indian and International.
    """
    status = get_tts_status()
    return {
        "total":         status["total_languages"],
        "tts_ready":     status["ready"],
        "languages":     status["languages"],
        "indian":        [l for l in status["languages"] if l["region"] == "Indian"],
        "international": [l for l in status["languages"] if l["region"] == "International"],
    }


# ============================================================================
# 2. TTS STATUS  (health check for the voice subsystem)
# ============================================================================
@router.get("/status")
def tts_status():
    """
    Check if the TTS engine is available and configured.

    Returns ready flag, supported language count, and language list.
    """
    return get_tts_status()


# ============================================================================
# 3. SITE AUDIO STATUS  (which languages already have cached audio)
# ============================================================================
@router.get("/status/{heritage_id}")
def site_audio_status(
    heritage_id: int = Path(..., description="Heritage site ID"),
    db: Session = Depends(get_db),
):
    """
    Returns audio cache status for every language for one heritage site.

    **Frontend usage:**
    ```js
    // After user selects a site, check what's already cached
    const res    = await fetch(`/api/v1/tts/status/${siteId}`);
    const status = await res.json();
    // status.languages → [{code, name, cached, url, play_endpoint}, ...]
    // Highlight cached languages in green in the picker
    ```
    """
    heritage = _get_or_404(db, heritage_id)
    return get_site_audio_status(heritage)


# ============================================================================
# 4. GENERATE — called when user picks a language and clicks PLAY
#    This is the core "voice button" endpoint
# ============================================================================
@router.post("/generate/{heritage_id}")
def generate_voice(
    heritage_id: int  = Path(..., description="Heritage site ID"),
    lang: str         = Query("en",  description="Language code: en|ta|hi|te|kn|ml|fr|de|ja|zh|ar"),
    force: bool       = Query(False, description="Regenerate even if cached"),
    db: Session       = Depends(get_db),
):
    """
    **Core voice button endpoint.**

    Called on-demand when user selects a language and clicks the play button.
    Returns cached audio instantly if it exists, otherwise generates it first.

    **Frontend flow:**
    ```
    User opens site detail page
        → Clicks 🔊 Voice button
        → Language picker modal appears
        → User selects 'Tamil' (ta)
        → POST /api/v1/tts/generate/{id}?lang=ta
        → Response: { full_url: "http://...brihadeeswarar_ta.mp3" }
        → Frontend plays: new Audio(full_url).play()
    ```

    **Supported languages:**
    - Indian:        ta (Tamil), hi (Hindi), te (Telugu), kn (Kannada), ml (Malayalam)
    - International: en (English), fr (French), de (German), ja (Japanese), zh (Chinese), ar (Arabic)
    """
    from config import TTS_SUPPORTED_LANGUAGES
    if lang not in TTS_SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language '{lang}'. "
                   f"Supported: {', '.join(TTS_SUPPORTED_LANGUAGES.keys())}",
        )

    heritage = _get_or_404(db, heritage_id)
    result   = generate_audio(heritage, db, lang=lang, force=force)

    if not result["success"]:
        raise HTTPException(
            status_code=503,
            detail=f"TTS generation failed: {result.get('error', 'unknown error')}",
        )

    return result


# ============================================================================
# 5. PLAY — stream audio directly to browser
#    Auto-generates if not cached yet
# ============================================================================
@router.get("/play/{heritage_id}")
def play_audio(
    heritage_id: int = Path(..., description="Heritage site ID"),
    lang: str        = Query("en", description="Language code"),
    db: Session      = Depends(get_db),
):
    """
    Stream audio file directly.

    Auto-generates the file if it doesn't exist yet.

    **Frontend usage:**
    ```jsx
    // Option A — HTML audio element
    <audio controls src={`/api/v1/tts/play/${siteId}?lang=${selectedLang}`} />

    // Option B — JS Audio API
    const audio = new Audio(`/api/v1/tts/play/${siteId}?lang=ta`);
    audio.play();
    ```
    """
    from config import TTS_SUPPORTED_LANGUAGES
    if lang not in TTS_SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language '{lang}'")

    heritage = _get_or_404(db, heritage_id)
    path     = _audio_path(heritage.name, lang)

    # Auto-generate if missing
    if not path.exists():
        result = generate_audio(heritage, db, lang=lang)
        if not result["success"]:
            raise HTTPException(
                status_code=503,
                detail=f"Could not generate audio: {result.get('error')}",
            )

    return FileResponse(
        path       = str(path),
        media_type = "audio/mpeg",
        filename   = path.name,
        headers    = {"Cache-Control": "public, max-age=86400"},  # cache 24h
    )


# ============================================================================
# 6. GENERATE ALL LANGUAGES for one site  (optional pre-cache)
# ============================================================================
@router.post("/generate/{heritage_id}/all-languages")
def generate_all_languages(
    heritage_id: int = Path(..., description="Heritage site ID"),
    force: bool      = Query(False, description="Regenerate all"),
    db: Session      = Depends(get_db),
):
    """
    Pre-generate audio in all supported languages for one site.

    Useful if you want to cache everything in advance.
    Can take 30-60 seconds for all 11 languages.
    """
    from config import TTS_SUPPORTED_LANGUAGES
    heritage = _get_or_404(db, heritage_id)

    results    = {}
    success_n  = 0
    cached_n   = 0
    failed_n   = 0

    for lang in TTS_SUPPORTED_LANGUAGES:
        res = generate_audio(heritage, db, lang=lang, force=force)
        results[lang] = {
            "success":  res["success"],
            "cached":   res.get("cached", False),
            "url":      res.get("full_url"),
            "error":    res.get("error"),
        }
        if res["success"]:
            cached_n  += 1 if res.get("cached") else 0
            success_n += 0 if res.get("cached") else 1
        else:
            failed_n += 1

    return {
        "heritage_id":   heritage_id,
        "heritage_name": heritage.name,
        "total":         len(TTS_SUPPORTED_LANGUAGES),
        "generated":     success_n,
        "from_cache":    cached_n,
        "failed":        failed_n,
        "by_language":   results,
    }


# ============================================================================
# 7. DELETE one language audio
# ============================================================================
@router.delete("/delete/{heritage_id}")
def delete_audio(
    heritage_id: int = Path(...),
    lang: str        = Query("en", description="Language code to delete"),
    db: Session      = Depends(get_db),
):
    """Delete cached audio for a specific language."""
    from config import TTS_SUPPORTED_LANGUAGES
    if lang not in TTS_SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language '{lang}'")

    heritage = _get_or_404(db, heritage_id)
    return delete_audio_file(heritage, db, lang=lang)


# ============================================================================
# 8. AUDIO OVERVIEW — all sites × all languages
# ============================================================================
@router.get("/overview")
def audio_overview(db: Session = Depends(get_db)):
    """
    Overview of audio coverage across all sites and languages.

    Shows which sites have audio ready for which languages.
    Useful for the admin dashboard.
    """
    from config import TTS_SUPPORTED_LANGUAGES

    sites  = db.query(Heritage).order_by(Heritage.id).all()
    lang_codes = list(TTS_SUPPORTED_LANGUAGES.keys())

    overview = []
    for s in sites:
        lang_status = {}
        for code in lang_codes:
            p = _audio_path(s.name, code)
            lang_status[code] = p.exists()

        cached_count = sum(1 for v in lang_status.values() if v)
        overview.append({
            "id":            s.id,
            "name":          s.name,
            "district":      s.district,
            "cached_count":  cached_count,
            "total_langs":   len(lang_codes),
            "languages":     lang_status,
        })

    # Summary
    total_possible = len(sites) * len(lang_codes)
    total_cached   = sum(s["cached_count"] for s in overview)

    return {
        "total_sites":     len(sites),
        "total_languages": len(lang_codes),
        "total_possible":  total_possible,
        "total_cached":    total_cached,
        "coverage_pct":    round(total_cached / total_possible * 100, 2) if total_possible else 0,
        "sites":           overview,
    }