"""
Heritage Model - Major Project Level
Normalized database schema for heritage sites
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, Index
from sqlalchemy.sql import func
from database import Base

class Heritage(Base):
    """
    Main Heritage Site Model
    
    Represents Tamil Nadu heritage sites with comprehensive information
    including location, classification, and visitor details.
    """
    __tablename__ = "heritage_sites"
    
    # ========================================================================
    # PRIMARY KEY
    # ========================================================================
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # ========================================================================
    # BASIC INFORMATION
    # ========================================================================
    name = Column(String(255), nullable=False, index=True, unique=True)
    tamil_name = Column(String(255), nullable=True)
    
    # ========================================================================
    # LOCATION DATA
    # ========================================================================
    district = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=True)  # Specific location/address
    
    # Geographic Coordinates (for mapping)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # ========================================================================
    # CLASSIFICATION
    # ========================================================================
    category = Column(String(100), nullable=False, index=True)  # Temple, Fort, etc.
    dynasty = Column(String(100), nullable=True, index=True)  # Chola, Pallava, etc.
    period = Column(String(100), nullable=True)  # Historical period
    year_built = Column(String(100), nullable=True)  # Year or century
    
    # ========================================================================
    # CONTENT (User-provided, not AI-generated)
    # ========================================================================
    description = Column(Text, nullable=True)  # Basic description
    
    # ========================================================================
    # DETAILED INFORMATION (For AI enhancement)
    # ========================================================================
    history = Column(Text, nullable=True)  # Historical background
    architecture = Column(Text, nullable=True)  # Architectural details
    cultural_significance = Column(Text, nullable=True)  # Cultural importance
    
    # ========================================================================
    # UNESCO STATUS
    # ========================================================================
    unesco_site = Column(Boolean, default=False, index=True)
    unesco_criteria = Column(String(255), nullable=True)  # UNESCO criteria if applicable
    
    # ========================================================================
    # MEDIA
    # ========================================================================
    image_url = Column(String(500), nullable=True)
    audio_path = Column(String(500), nullable=True)  # TTS audio path
    
    # ========================================================================
    # VISITOR INFORMATION
    # ========================================================================
    entry_fee = Column(String(100), nullable=True)
    visiting_hours = Column(String(200), nullable=True)
    best_time_to_visit = Column(String(100), nullable=True)
    
    # ========================================================================
    # ACCESSIBILITY
    # ========================================================================
    wheelchair_accessible = Column(Boolean, default=False)
    parking_available = Column(Boolean, default=False)
    
    # ========================================================================
    # METADATA
    # ========================================================================
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # AI Content generation flags
    ai_description_generated = Column(Boolean, default=False)
    ai_history_generated = Column(Boolean, default=False)
    ai_architecture_generated = Column(Boolean, default=False)
    
    # ========================================================================
    # STATISTICS (for analytics)
    # ========================================================================
    view_count = Column(Integer, default=0)
    
    # ========================================================================
    # INDEXES FOR PERFORMANCE
    # ========================================================================
    __table_args__ = (
        Index('idx_district_category', 'district', 'category'),
        Index('idx_dynasty_unesco', 'dynasty', 'unesco_site'),
        Index('idx_location', 'latitude', 'longitude'),
    )
    
    # ========================================================================
    # METHODS
    # ========================================================================
    def __repr__(self) -> str:
        return f"<Heritage(id={self.id}, name='{self.name}', district='{self.district}', category='{self.category}')>"
    
    def to_dict(self) -> dict:
        """Convert model to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "tamil_name": self.tamil_name,
            "district": self.district,
            "location": self.location,
            "category": self.category,
            "dynasty": self.dynasty,
            "period": self.period,
            "year_built": self.year_built,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "description": self.description,
            "history": self.history,
            "architecture": self.architecture,
            "cultural_significance": self.cultural_significance,
            "unesco_site": self.unesco_site,
            "unesco_criteria": self.unesco_criteria,
            "image_url": self.image_url,
            "audio_path": self.audio_path,
            "entry_fee": self.entry_fee,
            "visiting_hours": self.visiting_hours,
            "wheelchair_accessible": self.wheelchair_accessible,
            "parking_available": self.parking_available,
            "view_count": self.view_count,
        }
    
    def increment_view_count(self, db):
        """Increment view counter"""
        self.view_count += 1
        db.commit()