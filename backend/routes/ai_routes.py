"""
AI Routes — Real Gemini Chat with Image Upload & Voice (Production Ready)
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import uuid

from database import get_db
from services.gemini_service import (
    generate_chat_response,
    generate_vision_response,
    check_ai_status,
    build_heritage_context,
)
from models.heritage import Heritage
from config import BASE_DIR, GEMINI_MODEL

router = APIRouter(prefix="/ai", tags=["AI Chat"])

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
SUPPORTED_TTS_LANGS = ["en", "ta"]


# ============================================================================
# SCHEMAS
# ============================================================================

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = Field(default_factory=list)
    context_site_ids: List[int] = Field(default_factory=list)


class TTSRequest(BaseModel):
    text: str
    language: str = "en"


# ============================================================================
# 1️⃣ TEXT CHAT
# ============================================================================

@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Real-time AI chat with conversation history + DB context"""
    try:
        system_context = None

        if request.context_site_ids:
            sites = (
                db.query(Heritage)
                .filter(Heritage.id.in_(request.context_site_ids))
                .all()
            )
            if sites:
                system_context = build_heritage_context(sites)

        history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversation_history
        ]

        response_text = generate_chat_response(
            message=request.message,
            conversation_history=history,
            system_context=system_context
        )

        return {
            "success": True,
            "response": response_text,
            "model": GEMINI_MODEL
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# 2️⃣ IMAGE + CHAT
# ============================================================================

@router.post("/chat/vision")
async def chat_vision(
    message: str = Form(...),
    image: UploadFile = File(...)
):
    """AI chat with image upload"""

    try:
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        image_data = await image.read()

        if len(image_data) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Image too large (Max 5MB)"
            )

        response_text = generate_vision_response(
            message,
            image_data,
            image.content_type
        )

        return {
            "success": True,
            "response": response_text,
            "model": GEMINI_MODEL
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# 3️⃣ TEXT TO SPEECH (TTS)
# ============================================================================

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert AI response to speech"""
    try:
        if request.language not in SUPPORTED_TTS_LANGS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language. Allowed: {SUPPORTED_TTS_LANGS}"
            )

        from gtts import gTTS

        audio_id = str(uuid.uuid4())[:8]
        filename = f"ai_{audio_id}_{request.language}.mp3"
        audio_dir = os.path.join(BASE_DIR, "static", "audio")
        os.makedirs(audio_dir, exist_ok=True)

        audio_path = os.path.join(audio_dir, filename)

        tts = gTTS(text=request.text, lang=request.language, slow=False)
        tts.save(audio_path)

        return {
            "success": True,
            "audio_url": f"/static/audio/{filename}",
            "language": request.language
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tts/play/{filename}")
async def play_audio(filename: str):
    """Stream audio file"""
    audio_path = os.path.join(BASE_DIR, "static", "audio", filename)

    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(audio_path, media_type="audio/mpeg")


# ============================================================================
# 4️⃣ PROMPT SUGGESTIONS
# ============================================================================

@router.get("/prompts")
def get_prompts():
    return {
        "suggestions": [
            {"id": 1, "icon": "🏛️", "text": "Tell me about Brihadeeswarar Temple"},
            {"id": 2, "icon": "⚔️", "text": "Explain the Chola dynasty's legacy"},
            {"id": 3, "icon": "🌍", "text": "List UNESCO sites in Tamil Nadu"},
            {"id": 4, "icon": "📖", "text": "Write a story about Mahabalipuram"},
            {"id": 5, "icon": "🗺️", "text": "Suggest a 5-day heritage tour"},
            {"id": 6, "icon": "🎨", "text": "Describe Dravidian architecture"},
        ]
    }


# ============================================================================
# 5️⃣ AI STATUS
# ============================================================================

@router.get("/status")
def status():
    return check_ai_status()