"""
Integrated AI Service - Production Ready
Combines Heritage Content Generation + Chat + Vision Capabilities
Features: Caching, Retry Logic, DB Storage, Conversation History, Image Analysis
"""

import logging
import time
import base64
from typing import Dict, Optional, List
from PIL import Image
import io
from sqlalchemy.orm import Session

from config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    AI_ENABLED,
    AI_PROMPTS,
    AI_MAX_RETRIES,
    AI_TIMEOUT
)

from models.heritage import Heritage
from models.ai_content import get_ai_content, store_ai_content

logger = logging.getLogger(__name__)

# ==========================================================
# GEMINI INITIALIZATION (SAFE VERSION)
# ==========================================================

model = None
vision_model = None
chat_model = None

try:
    from google import genai
    
    def initialize_gemini():
        global model, vision_model, chat_model
        
        if not AI_ENABLED:
            logger.warning("⚠️ AI disabled (No API key)")
            return
        
        try:
            # Initialize API client
            client = genai.Client(api_key=GEMINI_API_KEY)
            
            # Content generation model
            model = client
            
            # Chat and Vision models (for extended functionality)
            chat_model = client
            vision_model = client
            
            logger.info("✅ Gemini initialized successfully (Content + Chat + Vision)")
        except Exception as e:
            logger.error(f"❌ Gemini initialization failed: {str(e)}")
            model = vision_model = chat_model = None
    
    initialize_gemini()

except ImportError as e:
    logger.error(f"❌ Google GenAI library not found: {str(e)}")


# ==========================================================
# PROMPT BUILDER
# ==========================================================

def build_prompt(heritage_site: Heritage, content_type: str) -> str:
    """
    Build prompt for heritage content generation
    """
    if content_type not in AI_PROMPTS:
        raise ValueError(f"Invalid content type: {content_type}")

    template = AI_PROMPTS[content_type]

    return template.format(
        site_name=heritage_site.name,
        heritage_type=heritage_site.category,
        district=heritage_site.district,
        period=heritage_site.dynasty or heritage_site.period or "historical",
        tamil_name=heritage_site.tamil_name or heritage_site.name
    )


def build_heritage_context(sites: List[Heritage]) -> str:
    """
    Build context string from heritage sites for AI conversations
    
    Args:
        sites: List of Heritage model instances
        
    Returns:
        Formatted context string
    """
    if not sites:
        return ""
    
    context = "Heritage Sites Context:\n\n"
    for site in sites:
        context += f"• {site.name} ({site.district})\n"
        context += f"  Category: {site.category}\n"
        context += f"  Dynasty: {site.dynasty or 'Unknown'}\n"
        context += f"  Period: {site.period or 'Ancient'}\n"
        if site.description:
            context += f"  Info: {site.description[:200]}...\n"
        context += "\n"
    
    return context


# ==========================================================
# HERITAGE CONTENT GENERATION (With Caching & Retry)
# ==========================================================

def generate_ai_content(
    db: Session,
    heritage_site: Heritage,
    content_type: str,
    force_regenerate: bool = False
) -> Dict:
    """
    Generate AI content for heritage sites with caching and retry logic
    
    Args:
        db: Database session
        heritage_site: Heritage site model
        content_type: Type of content (description, history, architecture, cultural_significance)
        force_regenerate: Force regeneration even if cached
        
    Returns:
        Dictionary with success status and generated content
    """
    
    if not AI_ENABLED or model is None:
        return {
            "success": False,
            "error": "AI service not configured",
            "cached": False
        }

    # 1️⃣ Check cache first
    if not force_regenerate:
        cached = get_ai_content(db, heritage_site.id, content_type)
        if cached:
            logger.info(f"✅ Cached {content_type} returned for {heritage_site.name}")
            return {
                "success": True,
                "content": cached,
                "cached": True,
                "heritage_id": heritage_site.id,
                "content_type": content_type
            }

    try:
        prompt = build_prompt(heritage_site, content_type)
        start_time = time.time()
        content = None

        # Retry mechanism
        for attempt in range(AI_MAX_RETRIES):
            try:
                response = model.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt,
                )

                content = response.text.strip()
                break

            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == AI_MAX_RETRIES - 1:
                    raise
                time.sleep(1)

        if not content:
            raise Exception("Empty AI response")

        generation_time_ms = int((time.time() - start_time) * 1000)

        # 2️⃣ Store in cache
        store_ai_content(
            db=db,
            heritage_id=heritage_site.id,
            content_type=content_type,
            content=content,
            model_used=GEMINI_MODEL,
            prompt_used=prompt,
            generation_time_ms=generation_time_ms
        )

        # 3️⃣ Update flags
        if content_type == "description":
            heritage_site.ai_description_generated = True
        elif content_type == "history":
            heritage_site.ai_history_generated = True
        elif content_type == "architecture":
            heritage_site.ai_architecture_generated = True

        db.commit()

        logger.info(f"✅ Generated {content_type} in {generation_time_ms}ms")

        return {
            "success": True,
            "content": content,
            "cached": False,
            "heritage_id": heritage_site.id,
            "content_type": content_type,
            "generation_time_ms": generation_time_ms,
            "model_used": GEMINI_MODEL
        }

    except Exception as e:
        db.rollback()
        logger.error(f"❌ AI generation failed: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "cached": False
        }


def generate_all_ai_content(
    db: Session,
    heritage_site: Heritage,
    force_regenerate: bool = False
) -> Dict:
    """
    Generate all AI content types for a heritage site
    """
    content_types = ["description", "history", "architecture", "cultural_significance"]
    
    results = {}
    success_count = 0

    for ctype in content_types:
        result = generate_ai_content(
            db=db,
            heritage_site=heritage_site,
            content_type=ctype,
            force_regenerate=force_regenerate
        )

        results[ctype] = result

        if result.get("success"):
            success_count += 1

    return {
        "heritage_id": heritage_site.id,
        "heritage_name": heritage_site.name,
        "total": len(content_types),
        "generated": success_count,
        "results": results
    }


# ==========================================================
# CHAT FUNCTIONALITY (With Conversation History)
# ==========================================================

def generate_chat_response(
    message: str,
    conversation_history: Optional[List[Dict]] = None,
    system_context: Optional[str] = None,
    heritage_sites: Optional[List[Heritage]] = None
) -> str:
    """
    Generate AI chat response with conversation history
    
    Args:
        message: User's message
        conversation_history: List of {"role": "user/assistant", "content": "..."}
        system_context: Additional context about heritage sites
        heritage_sites: List of Heritage models for context building
        
    Returns:
        AI response text
    """
    
    if not AI_ENABLED or chat_model is None:
        return "AI service is currently unavailable. Please check API key configuration."
    
    try:
        # Build base context
        context = """You are WOW AI, an expert on Tamil Nadu heritage sites. You have knowledge of 80 heritage sites across 22 districts including temples, forts, palaces, and UNESCO World Heritage Sites.

Your expertise includes:
- Chola, Pallava, Pandya, Nayak, and Vijayanagara dynasties
- Dravidian architecture and sculpture
- Historical narratives and cultural significance
- Travel recommendations and site comparisons

Respond in a friendly, knowledgeable tone with accurate information."""

        # Add heritage site context if provided
        if heritage_sites:
            context += "\n\n" + build_heritage_context(heritage_sites)
        
        # Add custom system context
        if system_context:
            context += f"\n\nCurrent Context:\n{system_context}"
        
        # Build conversation
        full_prompt = context + "\n\n"
        
        if conversation_history:
            for msg in conversation_history[-10:]:  # Last 10 messages for context window
                role = "User" if msg["role"] == "user" else "Assistant"
                full_prompt += f"{role}: {msg['content']}\n"
        
        full_prompt += f"User: {message}\nAssistant:"
        
        # Generate response with retry logic
        for attempt in range(AI_MAX_RETRIES):
            try:
                response = chat_model.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=full_prompt,
                )
                return response.text.strip()
            except Exception as e:
                logger.warning(f"Chat attempt {attempt + 1} failed: {str(e)}")
                if attempt == AI_MAX_RETRIES - 1:
                    raise
                time.sleep(1)
        
    except Exception as e:
        logger.error(f"Chat generation failed: {str(e)}")
        return f"Sorry, I encountered an error: {str(e)}"


# ==========================================================
# VISION FUNCTIONALITY (Image Analysis)
# ==========================================================

def generate_vision_response(
    message: str,
    image_data: bytes,
    mime_type: str = "image/jpeg"
) -> str:
    """
    Generate AI response with image analysis for heritage sites
    
    Args:
        message: User's question about the image
        image_data: Raw image bytes
        mime_type: Image MIME type
        
    Returns:
        AI response analyzing the image
    """
    
    if not AI_ENABLED or vision_model is None:
        return "Vision AI service is unavailable."
    
    try:
        # Load and validate image
        img = Image.open(io.BytesIO(image_data))
        
        # Add heritage context
        context = """You are analyzing heritage site images from Tamil Nadu, India. 
        
When identifying temples or monuments, consider:
- Architectural style (Dravidian, Chola, Pallava, Nayak)
- Gopuram (tower) characteristics
- Sculpture and carving patterns
- Location indicators
- Historical period markers

Provide detailed, accurate analysis of the heritage site shown."""
        
        full_prompt = f"{context}\n\nUser Question: {message}"
        
        # Generate response with retry logic
        for attempt in range(AI_MAX_RETRIES):
            try:
                response = vision_model.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=[full_prompt, img],
                )
                return response.text.strip()
            except Exception as e:
                logger.warning(f"Vision attempt {attempt + 1} failed: {str(e)}")
                if attempt == AI_MAX_RETRIES - 1:
                    raise
                time.sleep(1)
        
    except Exception as e:
        logger.error(f"Vision generation failed: {str(e)}")
        return f"Image analysis failed: {str(e)}"


def generate_vision_response_with_context(
    message: str,
    image_data: bytes,
    heritage_site: Optional[Heritage] = None,
    mime_type: str = "image/jpeg"
) -> str:
    """
    Generate vision response with heritage site context
    
    Args:
        message: User's question
        image_data: Raw image bytes
        heritage_site: Heritage site model for additional context
        mime_type: Image MIME type
        
    Returns:
        AI response analyzing the image with heritage context
    """
    
    if not AI_ENABLED or vision_model is None:
        return "Vision AI service is unavailable."
    
    try:
        # Load image
        img = Image.open(io.BytesIO(image_data))
        
        # Build context with heritage site info if provided
        context = """You are analyzing heritage site images from Tamil Nadu, India. 
        
When identifying temples or monuments, consider:
- Architectural style (Dravidian, Chola, Pallava, Nayak)
- Gopuram (tower) characteristics
- Sculpture and carving patterns
- Location indicators
- Historical period markers

Provide detailed, accurate analysis of the heritage site shown."""
        
        if heritage_site:
            context += f"\n\nThis image is from: {heritage_site.name}"
            context += f"\nLocation: {heritage_site.district}"
            context += f"\nCategory: {heritage_site.category}"
            context += f"\nDynasty/Period: {heritage_site.dynasty or heritage_site.period or 'Unknown'}"
        
        full_prompt = f"{context}\n\nUser Question: {message}"
        
        # Generate response with retry logic
        for attempt in range(AI_MAX_RETRIES):
            try:
                response = vision_model.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=[full_prompt, img],
                )
                return response.text.strip()
            except Exception as e:
                logger.warning(f"Vision attempt {attempt + 1} failed: {str(e)}")
                if attempt == AI_MAX_RETRIES - 1:
                    raise
                time.sleep(1)
        
    except Exception as e:
        logger.error(f"Vision generation with context failed: {str(e)}")
        return f"Image analysis failed: {str(e)}"


# ==========================================================
# MULTI-MODAL ANALYSIS (Chat + Vision Combined)
# ==========================================================

def generate_multimodal_response(
    message: str,
    image_data: Optional[bytes] = None,
    conversation_history: Optional[List[Dict]] = None,
    heritage_sites: Optional[List[Heritage]] = None,
    mime_type: str = "image/jpeg"
) -> str:
    """
    Generate response that can handle both text chat and images
    
    Args:
        message: User's message
        image_data: Optional image data
        conversation_history: Optional conversation history
        heritage_sites: Optional list of heritage sites for context
        mime_type: Image MIME type if provided
        
    Returns:
        AI response
    """
    
    if image_data:
        return generate_vision_response(message, image_data, mime_type)
    else:
        return generate_chat_response(
            message=message,
            conversation_history=conversation_history,
            heritage_sites=heritage_sites
        )


# ==========================================================
# STATUS & CONFIGURATION CHECK
# ==========================================================

def check_ai_status() -> Dict:
    """
    Check AI service availability and capabilities
    """
    return {
        "ai_enabled": AI_ENABLED,
        "model": GEMINI_MODEL,   # ← fixed key name
        "api_key_configured": bool(GEMINI_API_KEY),
        "text_model_ready": chat_model is not None,
        "vision_model_ready": vision_model is not None,
        "content_generation_ready": model is not None,
        "features": {
            "content_generation": model is not None,
            "chat": chat_model is not None,
            "vision": vision_model is not None,
            "multimodal": (chat_model is not None and vision_model is not None),
        },
        "available_content_types": list(AI_PROMPTS.keys()) if AI_PROMPTS else [],
        "max_retries": AI_MAX_RETRIES,
        "timeout": AI_TIMEOUT
    }
# ==========================================================
# BATCH OPERATIONS
# ==========================================================

def batch_generate_content_and_chat(
    db: Session,
    heritage_sites: List[Heritage],
    content_types: List[str] = None,
    user_query: Optional[str] = None
) -> Dict:
    """
    Batch generate content for multiple sites and optionally answer queries
    
    Args:
        db: Database session
        heritage_sites: List of heritage sites
        content_types: Types of content to generate
        user_query: Optional user query to answer based on generated content
        
    Returns:
        Dictionary with batch results and query response
    """
    
    if not content_types:
        content_types = ["description", "history", "architecture"]
    
    batch_results = {}
    
    # Generate content for all sites
    for site in heritage_sites:
        batch_results[site.id] = generate_all_ai_content(db, site)
    
    # If user query provided, generate contextualized chat response
    query_response = None
    if user_query:
        query_response = generate_chat_response(
            message=user_query,
            heritage_sites=heritage_sites
        )
    
    return {
        "total_sites": len(heritage_sites),
        "batch_results": batch_results,
        "query_response": query_response,
        "status": "completed"
    }


# ==========================================================
# INITIALIZATION
# ==========================================================

if __name__ == "__main__":
    status = check_ai_status()
    logger.info(f"AI Service Status: {status}")