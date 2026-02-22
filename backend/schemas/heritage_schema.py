"""
Heritage Schemas - Major Project Level
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

# ============================================================================
# BASE SCHEMA
# ============================================================================
class HeritageBase(BaseModel):
    """Base heritage schema with common fields"""
    
    # Basic Info
    name: str = Field(..., min_length=3, max_length=255, description="Heritage site name")
    tamil_name: Optional[str] = Field(None, max_length=255, description="Name in Tamil")
    
    # Location
    district: str = Field(..., min_length=3, max_length=100, description="District name")
    location: Optional[str] = Field(None, max_length=255, description="Specific location")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude (-90 to 90)")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude (-180 to 180)")
    
    # Classification
    category: str = Field(..., description="Heritage category (Temple, Fort, etc.)")
    dynasty: Optional[str] = Field(None, max_length=100, description="Dynasty or period")
    period: Optional[str] = Field(None, max_length=100, description="Historical period")
    year_built: Optional[str] = Field(None, max_length=100, description="Year or century built")
    
    # Content
    description: Optional[str] = Field(None, description="Brief description")
    history: Optional[str] = Field(None, description="Historical background")
    architecture: Optional[str] = Field(None, description="Architectural details")
    cultural_significance: Optional[str] = Field(None, description="Cultural importance")
    
    # UNESCO
    unesco_site: bool = Field(default=False, description="Is UNESCO World Heritage Site")
    unesco_criteria: Optional[str] = Field(None, description="UNESCO criteria if applicable")
    
    # Media
    image_url: Optional[str] = Field(None, max_length=500, description="Image URL")
    audio_path: Optional[str] = Field(None, max_length=500, description="Audio file path")
    
    # Visitor Info
    entry_fee: Optional[str] = Field(None, max_length=100, description="Entry fee details")
    visiting_hours: Optional[str] = Field(None, max_length=200, description="Visiting hours")
    best_time_to_visit: Optional[str] = Field(None, description="Best season/time")
    
    # Accessibility
    wheelchair_accessible: bool = Field(default=False, description="Wheelchair accessible")
    parking_available: bool = Field(default=False, description="Parking available")
    
    @validator('category')
    def validate_category(cls, v):
        """Validate heritage category"""
        from config import HERITAGE_CATEGORIES
        if v not in HERITAGE_CATEGORIES:
            # Allow it but could warn in production
            pass
        return v


# ============================================================================
# CREATE SCHEMA
# ============================================================================
class HeritageCreate(HeritageBase):
    """Schema for creating new heritage site"""
    pass


# ============================================================================
# UPDATE SCHEMA
# ============================================================================
class HeritageUpdate(BaseModel):
    """Schema for updating heritage site (all fields optional)"""
    name: Optional[str] = None
    tamil_name: Optional[str] = None
    district: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    dynasty: Optional[str] = None
    period: Optional[str] = None
    year_built: Optional[str] = None
    description: Optional[str] = None
    history: Optional[str] = None
    architecture: Optional[str] = None
    cultural_significance: Optional[str] = None
    unesco_site: Optional[bool] = None
    unesco_criteria: Optional[str] = None
    image_url: Optional[str] = None
    audio_path: Optional[str] = None
    entry_fee: Optional[str] = None
    visiting_hours: Optional[str] = None
    wheelchair_accessible: Optional[bool] = None
    parking_available: Optional[bool] = None


# ============================================================================
# RESPONSE SCHEMA
# ============================================================================
class HeritageResponse(HeritageBase):
    """Schema for API response"""
    id: int
    view_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # AI generation flags
    ai_description_generated: bool = False
    ai_history_generated: bool = False
    ai_architecture_generated: bool = False
    
    class Config:
        
        from_attributes = True


# ============================================================================
# LIST RESPONSE SCHEMA
# ============================================================================
class HeritageListResponse(BaseModel):
    """Paginated list response"""
    total: int = Field(..., description="Total number of items")
    page: int = Field(1, ge=1, description="Current page number")
    page_size: int = Field(..., ge=1, description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
    items: List[HeritageResponse]
    
    class Config:
        from_attributes = True


# ============================================================================
# COMPACT RESPONSE (For Lists/Maps)
# ============================================================================
class HeritageCompact(BaseModel):
    """Compact schema for list views and maps"""
    id: int
    name: str
    tamil_name: Optional[str]
    district: str
    category: str
    dynasty: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    unesco_site: bool
    image_url: Optional[str]
    
    class Config:
        
        from_attributes = True


# ============================================================================
# SEARCH FILTERS SCHEMA
# ============================================================================
class HeritageSearchFilters(BaseModel):
    """Search and filter parameters"""
    query: Optional[str] = Field(None, description="Text search query")
    district: Optional[str] = Field(None, description="Filter by district")
    category: Optional[str] = Field(None, description="Filter by category")
    dynasty: Optional[str] = Field(None, description="Filter by dynasty")
    unesco_site: Optional[bool] = Field(None, description="Filter UNESCO sites")
    has_coordinates: Optional[bool] = Field(None, description="Has lat/long")
    
    # Pagination
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")
    
    # Sorting
    sort_by: Optional[str] = Field("name", description="Sort field")
    sort_order: Optional[str] = Field("asc", description="asc or desc")


# ============================================================================
# AI CONTENT SCHEMA
# ============================================================================
class AIContentRequest(BaseModel):
    """Request schema for AI content generation"""
    heritage_id: int = Field(..., description="Heritage site ID")
    content_type: str = Field(
        ..., 
        description="Content type: description, history, architecture, cultural_significance"
    )
    regenerate: bool = Field(
        default=False, 
        description="Force regenerate even if exists"
    )


class AIContentResponse(BaseModel):
    """Response schema for AI-generated content"""
    heritage_id: int
    content_type: str
    content: str
    model_used: str
    generated_at: datetime
    cached: bool = Field(description="Was content retrieved from cache")
    
    class Config:
        from_attributes = True 