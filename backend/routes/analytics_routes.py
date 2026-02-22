"""
Analytics Routes — Tamil Nadu Heritage Management System
All statistical and data-insight API endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from services.analytics_service import (
    get_overview_stats,
    get_district_statistics,
    get_category_statistics,
    get_dynasty_statistics,
    get_period_statistics,
    get_unesco_analysis,
    get_district_breakdown,
    get_top_districts,
    get_geographic_coverage,
    get_data_completeness,
    get_dashboard_data,
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# ============================================================================
# 1. OVERVIEW
# ============================================================================
@router.get("/overview")
def analytics_overview(db: Session = Depends(get_db)):
    """
    Overall KPI summary.

    Returns: total sites, UNESCO count, districts, categories, dynasties,
    media coverage %, AI generation progress.
    """
    return get_overview_stats(db)


# ============================================================================
# 2. DISTRICTS
# ============================================================================
@router.get("/districts")
def analytics_districts(db: Session = Depends(get_db)):
    """
    Heritage site count per district, sorted descending.

    Returns: district name, total sites, UNESCO sites, % of total.
    """
    return {"districts": get_district_statistics(db)}


# ============================================================================
# 3. CATEGORIES  (Temple / Fort / Palace …)
# ============================================================================
@router.get("/categories")
def analytics_categories(db: Session = Depends(get_db)):
    """
    Site count per category (Temple, Fort, Palace, Monument …).

    Returns: category, count, % — great for pie charts.
    """
    return {"categories": get_category_statistics(db)}


# ============================================================================
# 4. DYNASTIES  (Chola / Pallava / Nayak …)
# ============================================================================
@router.get("/dynasties")
def analytics_dynasties(db: Session = Depends(get_db)):
    """
    Site count per dynasty (Chola, Pallava, Pandya, Nayak …).

    Returns: dynasty, count, % — unique to major project schema.
    """
    return {"dynasties": get_dynasty_statistics(db)}


# ============================================================================
# 5. PERIODS
# ============================================================================
@router.get("/periods")
def analytics_periods(db: Session = Depends(get_db)):
    """
    Site count per historical period.

    Returns: period, count.
    """
    return {"periods": get_period_statistics(db)}


# ============================================================================
# 6. UNESCO
# ============================================================================
@router.get("/unesco")
def analytics_unesco(db: Session = Depends(get_db)):
    """
    Full UNESCO World Heritage Sites analysis.

    Returns: all UNESCO sites list, breakdown by district / category / dynasty.
    """
    return get_unesco_analysis(db)


# ============================================================================
# 7. DISTRICT DEEP-DIVE
# ============================================================================
@router.get("/district/{district_name}")
def analytics_district_detail(
    district_name: str,
    db: Session = Depends(get_db),
):
    """
    Detailed category + dynasty breakdown for **one** district.

    - **district_name** — e.g. `Thanjavur`, `Madurai`
    """
    return get_district_breakdown(db, district_name)


# ============================================================================
# 8. TOP DISTRICTS
# ============================================================================
@router.get("/top-districts")
def analytics_top_districts(
    limit: int = Query(10, ge=1, le=30, description="How many districts to return"),
    db: Session = Depends(get_db),
):
    """
    Top N districts ranked by heritage site count.

    - **limit** — default 10, max 30.
    """
    return {"top_districts": get_top_districts(db, limit)}


# ============================================================================
# 9. GEOGRAPHIC COVERAGE
# ============================================================================
@router.get("/geographic-coverage")
def analytics_geo_coverage(db: Session = Depends(get_db)):
    """
    Coordinate coverage stats + geographic bounding box.

    Use the bounding box to initialise Leaflet / Mapbox map bounds.
    """
    return get_geographic_coverage(db)


# ============================================================================
# 10. DATA COMPLETENESS
# ============================================================================
@router.get("/data-completeness")
def analytics_data_completeness(db: Session = Depends(get_db)):
    """
    Field-by-field data quality report.

    Returns an overall score + filled/missing counts per field.
    Useful for identifying gaps before AI generation.
    """
    return get_data_completeness(db)


# ============================================================================
# 11. FULL DASHBOARD  ← single call to load admin dashboard
# ============================================================================
@router.get("/dashboard")
def analytics_dashboard(db: Session = Depends(get_db)):
    """
    **All analytics in one call** — designed for admin dashboard.

    Includes: overview, top 5 districts, categories, dynasties,
    UNESCO analysis, geographic coverage, data completeness.
    """
    return get_dashboard_data(db)