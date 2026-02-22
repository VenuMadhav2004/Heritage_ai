"""
AI Generated Content Model - Major Project Level
Stores AI-generated content to avoid repeated API calls
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import Boolean
from database import Base

class AIGeneratedContent(Base):
    """
    AI Generated Content Cache
    
    Stores AI-generated descriptions, history, and architectural analysis
    to avoid repeated API calls and improve performance.
    """
    __tablename__ = "ai_generated_content"
    
    # ========================================================================
    # PRIMARY KEY
    # ========================================================================
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # ========================================================================
    # FOREIGN KEY
    # ========================================================================
    heritage_id = Column(Integer, ForeignKey("heritage_sites.id"), nullable=False, index=True)
    
    # ========================================================================
    # CONTENT TYPE
    # ========================================================================
    content_type = Column(
        String(50), 
        nullable=False,
        index=True
    )  # 'description', 'history', 'architecture', 'cultural_significance'
    
    # ========================================================================
    # GENERATED CONTENT
    # ========================================================================
    content = Column(Text, nullable=False)
    
    # ========================================================================
    # AI METADATA
    # ========================================================================
    model_used = Column(String(50), nullable=True)  # 'gemini-pro', etc.
    prompt_used = Column(Text, nullable=True)  # Store prompt for reference
    generation_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # ========================================================================
    # QUALITY METRICS
    # ========================================================================
    token_count = Column(Integer, nullable=True)  # Approximate token count
    generation_time_ms = Column(Integer, nullable=True)  # Time taken to generate
    
    # ========================================================================
    # VERSIONING
    # ========================================================================
    version = Column(Integer, default=1)  # Allow content regeneration
    is_active = Column(Boolean, default=True)  # Flag for current version
    
    # ========================================================================
    # INDEXES
    # ========================================================================
    __table_args__ = (
        Index('idx_heritage_type', 'heritage_id', 'content_type'),
        Index('idx_active_content', 'heritage_id', 'content_type', 'is_active'),
    )
    
    # ========================================================================
    # METHODS
    # ========================================================================
    def __repr__(self) -> str:
        return f"<AIContent(id={self.id}, heritage_id={self.heritage_id}, type='{self.content_type}')>"
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "heritage_id": self.heritage_id,
            "content_type": self.content_type,
            "content": self.content,
            "model_used": self.model_used,
            "generated_at": self.generation_timestamp.isoformat() if self.generation_timestamp else None,
            "version": self.version,
        }

# ============================================================================
# HELPER FUNCTION
# ============================================================================
def get_ai_content(db, heritage_id: int, content_type: str) -> str:
    """
    Get AI-generated content for a heritage site
    
    Args:
        db: Database session
        heritage_id: Heritage site ID
        content_type: Type of content ('description', 'history', etc.)
        
    Returns:
        str: Generated content or None if not found
    """
    content = db.query(AIGeneratedContent).filter(
        AIGeneratedContent.heritage_id == heritage_id,
        AIGeneratedContent.content_type == content_type,
        AIGeneratedContent.is_active == True
    ).first()
    
    return content.content if content else None

def store_ai_content(
    db,
    heritage_id: int,
    content_type: str,
    content: str,
    model_used: str = "gemini-pro",
    prompt_used: str = None,
    generation_time_ms: int = None
) -> AIGeneratedContent:
    """
    Store AI-generated content
    
    Args:
        db: Database session
        heritage_id: Heritage site ID
        content_type: Type of content
        content: Generated content
        model_used: AI model name
        prompt_used: Prompt template used
        generation_time_ms: Generation time in milliseconds
        
    Returns:
        AIGeneratedContent: Created content record
    """
    # Deactivate previous versions
    db.query(AIGeneratedContent).filter(
        AIGeneratedContent.heritage_id == heritage_id,
        AIGeneratedContent.content_type == content_type
    ).update({"is_active": False})
    
    # Create new content
    ai_content = AIGeneratedContent(
        heritage_id=heritage_id,
        content_type=content_type,
        content=content,
        model_used=model_used,
        prompt_used=prompt_used,
        generation_time_ms=generation_time_ms,
        token_count=len(content.split()),  # Approximate
        version=1,
        is_active=True
    )
    
    db.add(ai_content)
    db.commit()
    db.refresh(ai_content)
    
    return ai_content