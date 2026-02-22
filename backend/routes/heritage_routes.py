"""
Heritage API Routes - Major Project Level
RESTful API endpoints for heritage site management
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List
import math

from database import get_db
from models.heritage import Heritage
from schemas.heritage_schema import (
    HeritageResponse,
    HeritageListResponse,
    HeritageCompact,
    HeritageCreate,
    HeritageUpdate,
    HeritageSearchFilters
)
from services.gemini_service import generate_ai_content, generate_all_ai_content

router = APIRouter(
    prefix="/heritage",
    tags=["Heritage Sites"]
)

# ============================================================================
# GET ALL SITES (with Pagination)
# ============================================================================
@router.get("/", response_model=HeritageListResponse)
def get_all_heritage_sites(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    compact: bool = Query(False, description="Return compact response"),
    db: Session = Depends(get_db)
):
    """
    Get all heritage sites with pagination
    
    - **page**: Page number (starts at 1)
    - **page_size**: Number of items per page (max 100)
    - **compact**: Return compact response (for maps/lists)
    """
    # Get total count
    total = db.query(Heritage).count()
    total_pages = math.ceil(total / page_size)
    
    # Get paginated results
    skip = (page - 1) * page_size
    query = db.query(Heritage).offset(skip).limit(page_size)
    
    items = query.all()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }



# ============================================================================
# ADVANCED SEARCH
# ============================================================================
@router.post("/search", response_model=HeritageListResponse)
def search_heritage_sites(
    filters: HeritageSearchFilters,
    db: Session = Depends(get_db)
):
    """
    Advanced search with multiple filters
    
    Supports:
    - Text search (name, description)
    - District filter
    - Category filter
    - Dynasty filter
    - UNESCO filter
    - Coordinate availability
    - Pagination
    - Sorting
    """
    # Start with base query
    query = db.query(Heritage)
    
    # Text search
    if filters.query:
        search_term = f"%{filters.query}%"
        query = query.filter(
            or_(
                Heritage.name.ilike(search_term),
                Heritage.tamil_name.ilike(search_term),
                Heritage.description.ilike(search_term),
                Heritage.location.ilike(search_term)
            )
        )
    
    # District filter
    if filters.district:
        query = query.filter(Heritage.district.ilike(f"%{filters.district}%"))
    
    # Category filter
    if filters.category:
        query = query.filter(Heritage.category.ilike(f"%{filters.category}%"))
    
    # Dynasty filter
    if filters.dynasty:
        query = query.filter(Heritage.dynasty.ilike(f"%{filters.dynasty}%"))
    
    # UNESCO filter
    if filters.unesco_site is not None:
        query = query.filter(Heritage.unesco_site == filters.unesco_site)
    
    # Coordinate availability
    if filters.has_coordinates:
        query = query.filter(
            and_(
                Heritage.latitude.isnot(None),
                Heritage.longitude.isnot(None)
            )
        )
    
    # Get total count
    total = query.count()
    
    # Sorting
    if filters.sort_by:
        sort_column = getattr(Heritage, filters.sort_by, Heritage.name)
        if filters.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    
    # Pagination
    skip = (filters.page - 1) * filters.page_size
    items = query.offset(skip).limit(filters.page_size).all()
    
    total_pages = math.ceil(total / filters.page_size)
    
    return {
        "total": total,
        "page": filters.page,
        "page_size": filters.page_size,
        "total_pages": total_pages,
        "items": items
    }


# ============================================================================
# GET BY DISTRICT
# ============================================================================
@router.get("/district/{district_name}", response_model=HeritageListResponse)
def get_by_district(
    district_name: str = Path(..., description="District name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all heritage sites in a specific district"""
    query = db.query(Heritage).filter(
        Heritage.district.ilike(f"%{district_name}%")
    )
    
    total = query.count()
    skip = (page - 1) * page_size
    items = query.offset(skip).limit(page_size).all()
    total_pages = math.ceil(total / page_size)
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }


# ============================================================================
# GET BY CATEGORY
# ============================================================================
@router.get("/category/{category_name}", response_model=HeritageListResponse)
def get_by_category(
    category_name: str = Path(..., description="Heritage category"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all heritage sites of a specific category"""
    query = db.query(Heritage).filter(
        Heritage.category.ilike(f"%{category_name}%")
    )
    
    total = query.count()
    skip = (page - 1) * page_size
    items = query.offset(skip).limit(page_size).all()
    total_pages = math.ceil(total / page_size)
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }


# ============================================================================
# GET BY DYNASTY
# ============================================================================
@router.get("/dynasty/{dynasty_name}", response_model=HeritageListResponse)
def get_by_dynasty(
    dynasty_name: str = Path(..., description="Dynasty name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all heritage sites from a specific dynasty"""
    query = db.query(Heritage).filter(
        Heritage.dynasty.ilike(f"%{dynasty_name}%")
    )
    
    total = query.count()
    skip = (page - 1) * page_size
    items = query.offset(skip).limit(page_size).all()
    total_pages = math.ceil(total / page_size)
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }


# ============================================================================
# GET UNESCO SITES
# ============================================================================
@router.get("/unesco/sites", response_model=HeritageListResponse)
def get_unesco_sites(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all UNESCO World Heritage Sites"""
    query = db.query(Heritage).filter(Heritage.unesco_site == True)
    
    total = query.count()
    skip = (page - 1) * page_size
    items = query.offset(skip).limit(page_size).all()
    total_pages = math.ceil(total / page_size)
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items
    }


# ============================================================================
# GET SITES FOR MAP (Compact)
# ============================================================================
@router.get("/map/markers", response_model=List[HeritageCompact])
def get_map_markers(
    district: Optional[str] = Query(None, description="Filter by district"),
    category: Optional[str] = Query(None, description="Filter by category"),
    unesco_only: bool = Query(False, description="UNESCO sites only"),
    db: Session = Depends(get_db)
):
    """
    Get compact heritage site data for map markers
    
    Returns only essential fields needed for map display
    """
    query = db.query(Heritage).filter(
        Heritage.latitude.isnot(None),
        Heritage.longitude.isnot(None)
    )
    
    if district:
        query = query.filter(Heritage.district.ilike(f"%{district}%"))
    
    if category:
        query = query.filter(Heritage.category.ilike(f"%{category}%"))
    
    if unesco_only:
        query = query.filter(Heritage.unesco_site == True)
    
    return query.all()

# ============================================================================
# GET SITE BY ID
# ============================================================================
@router.get("/{heritage_id}", response_model=HeritageResponse)
def get_heritage_by_id(
    heritage_id: int = Path(..., ge=1, description="Heritage site ID"),
    increment_view: bool = Query(True, description="Increment view count"),
    db: Session = Depends(get_db)
):
    """
    Get a single heritage site by ID
    
    - **heritage_id**: Unique identifier
    - **increment_view**: Automatically increment view counter
    """
    heritage = db.query(Heritage).filter(Heritage.id == heritage_id).first()
    
    if not heritage:
        raise HTTPException(
            status_code=404,
            detail=f"Heritage site with ID {heritage_id} not found"
        )
    
    # Increment view count
    if increment_view:
        heritage.increment_view_count(db)
        db.commit() 
    return heritage




# ============================================================================
# GENERATE AI CONTENT
# ============================================================================
@router.post("/{heritage_id}/generate-ai/{content_type}")
def generate_ai_content_endpoint(
    heritage_id: int = Path(..., ge=1),
    content_type: str = Path(..., description="description, history, architecture, or cultural_significance"),
    force_regenerate: bool = Query(False, description="Force regenerate"),
    db: Session = Depends(get_db)
):
    """
    Generate AI content for a heritage site
    
    - **heritage_id**: Site ID
    - **content_type**: Type of content to generate
    - **force_regenerate**: Force new generation even if cached
    """
    # Validate content type
    valid_types = ["description", "history", "architecture", "cultural_significance"]
    if content_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content_type. Must be one of: {', '.join(valid_types)}"
        )
    
    # Get heritage site
    heritage = db.query(Heritage).filter(Heritage.id == heritage_id).first()
    if not heritage:
        raise HTTPException(status_code=404, detail="Heritage site not found")
    
    # Generate content
    result = generate_ai_content(db, heritage, content_type, force_regenerate)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "AI generation failed")
        )
    
    return result


# ============================================================================
# GENERATE ALL AI CONTENT
# ============================================================================
