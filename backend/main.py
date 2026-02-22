"""
Main Application — Tamil Nadu Heritage Management System
FastAPI entry point with all routers, middleware, and startup logic
"""
import logging
import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from config import (
    PROJECT_NAME, VERSION, DESCRIPTION,
    CORS_ORIGINS, API_PREFIX, STATIC_DIR,
    LOG_LEVEL, LOG_FORMAT,
)
from database import init_database, get_db, check_database_connection, get_database_stats
from routes import heritage_routes, analytics_routes, upload_routes, tts_routes
from services.data_loader import load_heritage_data, validate_data_quality
from services.gemini_service import check_ai_status
from services.tts_service import get_tts_status

# ============================================================================
# LOGGING
# ============================================================================
logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT)
logger = logging.getLogger(__name__)

# ============================================================================
# DATABASE — create tables on import
# ============================================================================
init_database()

# ============================================================================
# FASTAPI APP
# ============================================================================
app = FastAPI(
    title=PROJECT_NAME,
    version=VERSION,
    description=DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ============================================================================
# MIDDLEWARE — CORS
# ============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# STATIC FILE SERVING
# ============================================================================
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# ============================================================================
# ROUTERS
# ============================================================================
app.include_router(heritage_routes.router,  prefix=API_PREFIX)
app.include_router(analytics_routes.router, prefix=API_PREFIX)
app.include_router(upload_routes.router,    prefix=API_PREFIX)
app.include_router(tts_routes.router,       prefix=API_PREFIX)

# AI Chat Routes
from routes import ai_routes
app.include_router(ai_routes.router,        prefix=API_PREFIX)

# ============================================================================
# ROOT ENDPOINTS
# ============================================================================
@app.get("/", tags=["System"])
def root():
    """API root — quick overview of available endpoint groups"""
    return {
        "project":     PROJECT_NAME,
        "version":     VERSION,
        "docs":        "/docs",
        "endpoints": {
            "heritage":   f"{API_PREFIX}/heritage",
            "analytics":  f"{API_PREFIX}/analytics",
            "upload":     f"{API_PREFIX}/upload",
            "tts":        f"{API_PREFIX}/tts",
        },
    }


@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """Live health check — database, AI, and TTS status"""
    db_ok  = check_database_connection()
    ai     = check_ai_status()
    tts    = get_tts_status()
    return {
        "status":   "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "error",
        "ai":       "enabled"  if ai["ai_enabled"]  else "disabled",
        "tts":      "ready"    if tts["ready"]       else "unavailable",
        "version":  VERSION,
    }


@app.get("/system/info", tags=["System"])
def system_info(db: Session = Depends(get_db)):
    """Detailed system info — stats, features, configuration"""
    return {
        "system":   {"name": PROJECT_NAME, "version": VERSION},
        "database": get_database_stats(),
        "ai":       check_ai_status(),
        "tts":      get_tts_status(),
        "features": {
            "heritage_management": True,
            "ai_content":          check_ai_status()["ai_enabled"],
            "analytics":           True,
            "file_upload":         True,
            "voice_tts":           get_tts_status()["ready"],
            "geolocation":         True,
            "accessibility":       True,
        },
    }


# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================
@app.post("/admin/load-data", tags=["Admin"])
def admin_load_data(db: Session = Depends(get_db)):
    """Load heritage data from CSV (skips if DB already populated)"""
    return load_heritage_data(db)


@app.get("/admin/validate-data", tags=["Admin"])
def admin_validate(db: Session = Depends(get_db)):
    """Run data quality validation and return completeness report"""
    return validate_data_quality(db)


# ============================================================================
# STARTUP
# ============================================================================
@app.on_event("startup")
async def on_startup():
    logger.info("=" * 70)
    logger.info(f"🚀  {PROJECT_NAME}  v{VERSION}")
    logger.info("=" * 70)

    # DB check
    if check_database_connection():
        logger.info("✅  Database connected")
    else:
        logger.error("❌  Database connection failed")

    # Auto-load CSV
    from database import SessionLocal
    db = SessionLocal()
    try:
        result = load_heritage_data(db)
        if result["status"] == "success":
            logger.info(f"✅  {result['loaded']} heritage sites loaded from CSV")
        elif result["status"] == "skipped":
            logger.info(f"ℹ️   {result['message']}")
        else:
            logger.error(f"❌  Data load error: {result.get('message')}")
    finally:
        db.close()

    # AI status
    ai = check_ai_status()
    if ai["ai_enabled"]:
        logger.info(f"✅  AI Service ready  ({ai.get('model', 'Unknown')})")
    else:
        logger.warning("⚠️   AI Service disabled — set GEMINI_API_KEY in .env")

    # TTS status
    tts = get_tts_status()
    if tts["ready"]:
        logger.info("✅  TTS Service ready  (gTTS)")
    else:
        logger.warning("⚠️   TTS unavailable — run: pip install gTTS")

    logger.info("=" * 70)
    logger.info("📖  Swagger UI  →  http://127.0.0.1:8000/docs")
    logger.info("📊  System info →  http://127.0.0.1:8000/system/info")
    logger.info("=" * 70)


@app.on_event("shutdown")
async def on_shutdown():
    logger.info(f"👋  {PROJECT_NAME} shutting down…")


# ============================================================================
# RUN
# ============================================================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")