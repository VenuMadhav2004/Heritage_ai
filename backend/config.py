"""
Configuration — Tamil Nadu Heritage Management System
Reads ALL secrets and environment-specific settings from .env
Never hardcode API keys or passwords here.
"""
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# ── Load .env file first, before reading any os.getenv() ─────────────────────
load_dotenv()

# ============================================================================
# PROJECT METADATA
# ============================================================================
PROJECT_NAME = "Tamil Nadu Heritage Management System"
VERSION      = "1.0.0"
DESCRIPTION  = "AI-Powered Heritage Site Discovery & Management Platform"
API_PREFIX   = "/api/v1"
ENVIRONMENT  = os.getenv("ENVIRONMENT", "development")

# ============================================================================
# DIRECTORY PATHS
# ============================================================================
BASE_DIR   = Path(__file__).resolve().parent
DATA_DIR   = BASE_DIR / "data"
STATIC_DIR = BASE_DIR / "static"
IMAGES_DIR = STATIC_DIR / "images"   # drop images here manually
AUDIO_DIR  = STATIC_DIR / "audio"    # TTS auto-saves mp3s here

CSV_FILE_PATH = DATA_DIR / "tamilnadu_heritage.csv"

# Auto-create directories
for _dir in [DATA_DIR, STATIC_DIR, IMAGES_DIR, AUDIO_DIR]:
    _dir.mkdir(exist_ok=True, parents=True)

# ============================================================================
# DATABASE
# Reads from .env → DATABASE_URL
# Falls back to SQLite for local development
# ============================================================================
DATABASE_URL = os.getenv(
    "DATABASE_URL"
   
)

# ============================================================================
# CORS
# ============================================================================
CORS_ORIGINS: List[str] = [
    "http://localhost:3000",    # React CRA
    "http://localhost:5173",    # Vite
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

# ============================================================================
# STATIC FILE URL HELPERS
# Reads BASE_URL from .env
# image_url in DB/CSV = just filename  →  "brihadeeswarar_temple.jpg"
# get_image_url() builds full URL      →  "http://localhost:8000/static/images/..."
# ============================================================================
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

def get_image_url(filename: str) -> str:
    """
    filename (from DB)  →  full URL for frontend

    "brihadeeswarar_temple.jpg"
        → "http://localhost:8000/static/images/brihadeeswarar_temple.jpg"
    """
    if not filename:
        return f"{BASE_URL}/static/images/placeholder.jpg"
    if filename.startswith("http"):
        return filename
    if filename.startswith("static/"):
        return f"{BASE_URL}/{filename}"
    return f"{BASE_URL}/static/images/{filename}"


def get_audio_url(filename: str) -> str:
    """
    filename (from TTS)  →  full URL for frontend audio player

    "brihadeeswarar_temple_en.mp3"
        → "http://localhost:8000/static/audio/brihadeeswarar_temple_en.mp3"
    """
    if not filename:
        return None
    if filename.startswith("http"):
        return filename
    if filename.startswith("static/"):
        return f"{BASE_URL}/{filename}"
    return f"{BASE_URL}/static/audio/{filename}"

# ============================================================================
# AI SERVICE — GEMINI
# Reads GEMINI_API_KEY from .env
# ============================================================================
GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY", "")       # ← from .env
GEMINI_MODEL     = "gemini-2.5-flash"
AI_ENABLED       = bool(GEMINI_API_KEY)                   # auto-enables when key present
AI_CACHE_ENABLED = True      # store generated content in DB → avoid repeat API calls
AI_MAX_RETRIES   = 3
AI_TIMEOUT       = 30        # seconds

AI_PROMPTS = {
    "description": (
        "Generate a concise, engaging description of {site_name}, a {heritage_type} "
        "located in {district}, Tamil Nadu. Focus on its unique characteristics and "
        "cultural importance. Keep it under 150 words, accessible to general visitors."
    ),
    "history": (
        "Provide a detailed historical analysis of {site_name} covering:\n"
        "- Historical background and period ({period})\n"
        "- Key historical events and significance\n"
        "- Notable rulers or patrons involved\n"
        "- Evolution over time\n"
        "Keep it structured and factual, around 200-250 words."
    ),
    "architecture": (
        "Analyze the architectural features of {site_name}:\n"
        "- Architectural style and influences\n"
        "- Unique structural elements\n"
        "- Construction techniques of the {period} period\n"
        "- Artistic and decorative elements\n"
        "Focus on what makes it architecturally significant. Around 200 words."
    ),
    "cultural_significance": (
        "Explain the cultural importance of {site_name}:\n"
        "- Cultural and religious significance\n"
        "- Role in local traditions and festivals\n"
        "- UNESCO status explanation (if applicable)\n"
        "- Lesser-known interesting facts\n"
        "Make it engaging and educational. Around 150 words."
    ),
}

# ============================================================================
# TTS — DYNAMIC MULTI-LANGUAGE VOICE
# No static audio — generated on-demand when user clicks the voice button
# ============================================================================
TTS_ENABLED      = True
TTS_DEFAULT_LANG = "en"

TTS_SUPPORTED_LANGUAGES = {
    # ── Indian ────────────────────────────────────────────────────────────────
    "ta": {"name": "Tamil",     "native": "தமிழ்",   "flag": "🇮🇳", "region": "Indian"},
    "hi": {"name": "Hindi",     "native": "हिन्दी",   "flag": "🇮🇳", "region": "Indian"},
    "te": {"name": "Telugu",    "native": "తెలుగు",  "flag": "🇮🇳", "region": "Indian"},
    "kn": {"name": "Kannada",   "native": "ಕನ್ನಡ",   "flag": "🇮🇳", "region": "Indian"},
    "ml": {"name": "Malayalam", "native": "മലയാളം", "flag": "🇮🇳", "region": "Indian"},
    # ── International ─────────────────────────────────────────────────────────
    "en": {"name": "English",   "native": "English",  "flag": "🇬🇧", "region": "International"},
    "fr": {"name": "French",    "native": "Français", "flag": "🇫🇷", "region": "International"},
    "de": {"name": "German",    "native": "Deutsch",  "flag": "🇩🇪", "region": "International"},
    "ja": {"name": "Japanese",  "native": "日本語",    "flag": "🇯🇵", "region": "International"},
    "zh": {"name": "Chinese",   "native": "中文",      "flag": "🇨🇳", "region": "International"},
    "ar": {"name": "Arabic",    "native": "العربية",  "flag": "🇸🇦", "region": "International"},
}

# ============================================================================
# SECURITY
# Reads SECRET_KEY from .env
# ============================================================================
SECRET_KEY                  = os.getenv("SECRET_KEY", "")   # ← from .env
ALGORITHM                   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Warn in development if secrets are missing
if ENVIRONMENT == "development":
    if not GEMINI_API_KEY:
        print("⚠️  GEMINI_API_KEY not set in .env — AI features disabled")
    if not SECRET_KEY:
        print("⚠️  SECRET_KEY not set in .env — using empty key (dev only)")

# ============================================================================
# PAGINATION
# ============================================================================
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE     = 100

# ============================================================================
# LOGGING
# ============================================================================
LOG_LEVEL  = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# ============================================================================
# HERITAGE REFERENCE DATA
# ============================================================================
HERITAGE_CATEGORIES = [
    "Temple", "Fort", "Palace", "Church",
    "Monument", "Archaeological Site", "Museum", "Natural Heritage",
]

DYNASTIES = [
    "Chola", "Pallava", "Pandya", "Nayak",
    "Vijayanagara", "British Colonial", "French Colonial",
    "Danish", "Dutch", "Portuguese Colonial",
]