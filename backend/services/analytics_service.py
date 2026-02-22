"""
Analytics Service — Tamil Nadu Heritage Management System
Provides all statistical insights and data analysis
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, cast, Integer
from models.heritage import Heritage
from typing import Dict, List, Any


# ============================================================================
# 1. OVERVIEW STATS
# ============================================================================
def get_overview_stats(db: Session) -> Dict[str, Any]:
    """Total counts, UNESCO stats, media coverage, completeness %"""
    total = db.query(Heritage).count()
    if total == 0:
        return {"total_sites": 0}

    unesco_count     = db.query(Heritage).filter(Heritage.unesco_site == True).count()
    districts_count  = db.query(func.count(distinct(Heritage.district))).scalar()
    categories_count = db.query(func.count(distinct(Heritage.category))).scalar()
    dynasties_count  = db.query(func.count(distinct(Heritage.dynasty))).scalar()

    with_coords  = db.query(Heritage).filter(
        Heritage.latitude.isnot(None), Heritage.longitude.isnot(None)).count()
    with_images  = db.query(Heritage).filter(Heritage.image_url.isnot(None)).count()
    with_audio   = db.query(Heritage).filter(Heritage.audio_path.isnot(None)).count()
    with_history = db.query(Heritage).filter(Heritage.history.isnot(None)).count()
    with_arch    = db.query(Heritage).filter(Heritage.architecture.isnot(None)).count()

    ai_desc = db.query(Heritage).filter(Heritage.ai_description_generated == True).count()
    ai_hist = db.query(Heritage).filter(Heritage.ai_history_generated == True).count()
    ai_arch = db.query(Heritage).filter(Heritage.ai_architecture_generated == True).count()

    def pct(n): return round(n / total * 100, 2)

    return {
        "total_sites":      total,
        "unesco_sites":     unesco_count,
        "non_unesco_sites": total - unesco_count,
        "total_districts":  districts_count,
        "total_categories": categories_count,
        "total_dynasties":  dynasties_count,
        "media": {
            "with_images": with_images,
            "with_audio":  with_audio,
            "image_pct":   pct(with_images),
            "audio_pct":   pct(with_audio),
        },
        "content": {
            "with_coordinates":  with_coords,
            "with_history":      with_history,
            "with_architecture": with_arch,
            "coords_pct":        pct(with_coords),
            "history_pct":       pct(with_history),
        },
        "ai_generation": {
            "description_done":  ai_desc,
            "history_done":      ai_hist,
            "architecture_done": ai_arch,
            "total_generated":   ai_desc + ai_hist + ai_arch,
        },
    }


# ============================================================================
# 2. DISTRICT STATISTICS
# ============================================================================
def get_district_statistics(db: Session) -> List[Dict[str, Any]]:
    """Site count per district with UNESCO breakdown"""
    rows = (
        db.query(
            Heritage.district,
            func.count(Heritage.id).label("total"),
            func.sum(cast(Heritage.unesco_site, Integer)).label("unesco"),
        )
        .group_by(Heritage.district)
        .order_by(func.count(Heritage.id).desc())
        .all()
    )
    total_all = sum(r.total for r in rows)
    return [
        {
            "district":    r.district,
            "total_sites": r.total,
            "unesco_sites": int(r.unesco or 0),
            "percentage":  round(r.total / total_all * 100, 2) if total_all else 0,
        }
        for r in rows
    ]


# ============================================================================
# 3. CATEGORY STATISTICS
# ============================================================================
def get_category_statistics(db: Session) -> List[Dict[str, Any]]:
    """Site count per category (Temple, Fort, Palace …) with %"""
    rows = (
        db.query(Heritage.category, func.count(Heritage.id).label("count"))
        .group_by(Heritage.category)
        .order_by(func.count(Heritage.id).desc())
        .all()
    )
    total = sum(r.count for r in rows)
    return [
        {
            "category":   r.category,
            "count":      r.count,
            "percentage": round(r.count / total * 100, 2) if total else 0,
        }
        for r in rows
    ]


# ============================================================================
# 4. DYNASTY STATISTICS
# ============================================================================
def get_dynasty_statistics(db: Session) -> List[Dict[str, Any]]:
    """Site count per dynasty (Chola, Pallava, Nayak …)"""
    rows = (
        db.query(Heritage.dynasty, func.count(Heritage.id).label("count"))
        .filter(Heritage.dynasty.isnot(None))
        .group_by(Heritage.dynasty)
        .order_by(func.count(Heritage.id).desc())
        .all()
    )
    total = sum(r.count for r in rows)
    return [
        {
            "dynasty":    r.dynasty,
            "count":      r.count,
            "percentage": round(r.count / total * 100, 2) if total else 0,
        }
        for r in rows
    ]


# ============================================================================
# 5. PERIOD STATISTICS
# ============================================================================
def get_period_statistics(db: Session) -> List[Dict[str, Any]]:
    """Site count per historical period"""
    rows = (
        db.query(Heritage.period, func.count(Heritage.id).label("count"))
        .filter(Heritage.period.isnot(None))
        .group_by(Heritage.period)
        .order_by(func.count(Heritage.id).desc())
        .all()
    )
    return [{"period": r.period, "count": r.count} for r in rows]


# ============================================================================
# 6. UNESCO ANALYSIS
# ============================================================================
def get_unesco_analysis(db: Session) -> Dict[str, Any]:
    """Full analysis of UNESCO World Heritage Sites"""
    sites = db.query(Heritage).filter(Heritage.unesco_site == True).all()

    if not sites:
        return {"total_unesco_sites": 0, "sites": []}

    district_count: Dict[str, int] = {}
    category_count: Dict[str, int] = {}
    dynasty_count:  Dict[str, int] = {}

    site_list = []
    for s in sites:
        site_list.append({
            "id":              s.id,
            "name":            s.name,
            "tamil_name":      s.tamil_name,
            "district":        s.district,
            "category":        s.category,
            "dynasty":         s.dynasty,
            "period":          s.period,
            "year_built":      s.year_built,
            "unesco_criteria": s.unesco_criteria,
            "image_url":       s.image_url,
        })
        district_count[s.district] = district_count.get(s.district, 0) + 1
        category_count[s.category] = category_count.get(s.category, 0) + 1
        if s.dynasty:
            dynasty_count[s.dynasty] = dynasty_count.get(s.dynasty, 0) + 1

    def sorted_list(d):
        return [{"name": k, "count": v}
                for k, v in sorted(d.items(), key=lambda x: -x[1])]

    return {
        "total_unesco_sites": len(sites),
        "sites":          site_list,
        "by_district":    sorted_list(district_count),
        "by_category":    sorted_list(category_count),
        "by_dynasty":     sorted_list(dynasty_count),
    }


# ============================================================================
# 7. DISTRICT DEEP-DIVE
# ============================================================================
def get_district_breakdown(db: Session, district: str) -> Dict[str, Any]:
    """Category + dynasty breakdown for one specific district"""
    base  = db.query(Heritage).filter(Heritage.district.ilike(f"%{district}%"))
    total = base.count()

    if total == 0:
        return {"district": district, "total_sites": 0, "categories": [], "dynasties": []}

    cat_rows = (
        base.with_entities(Heritage.category, func.count(Heritage.id).label("c"))
        .group_by(Heritage.category).order_by(func.count(Heritage.id).desc()).all()
    )
    dyn_rows = (
        base.with_entities(Heritage.dynasty, func.count(Heritage.id).label("c"))
        .filter(Heritage.dynasty.isnot(None))
        .group_by(Heritage.dynasty).order_by(func.count(Heritage.id).desc()).all()
    )

    return {
        "district":    district,
        "total_sites": total,
        "categories":  [{"category": r.category, "count": r.c} for r in cat_rows],
        "dynasties":   [{"dynasty":  r.dynasty,  "count": r.c} for r in dyn_rows],
    }


# ============================================================================
# 8. TOP DISTRICTS
# ============================================================================
def get_top_districts(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """Top N districts ranked by site count"""
    rows = (
        db.query(Heritage.district, func.count(Heritage.id).label("count"))
        .group_by(Heritage.district)
        .order_by(func.count(Heritage.id).desc())
        .limit(limit)
        .all()
    )
    return [
        {"rank": i + 1, "district": r.district, "site_count": r.count}
        for i, r in enumerate(rows)
    ]


# ============================================================================
# 9. GEOGRAPHIC COVERAGE
# ============================================================================
def get_geographic_coverage(db: Session) -> Dict[str, Any]:
    """Coordinate coverage + bounding box for map initialisation"""
    total  = db.query(Heritage).count()
    with_c = db.query(Heritage).filter(
        Heritage.latitude.isnot(None), Heritage.longitude.isnot(None)
    ).count()

    bbox = None
    if with_c > 0:
        r = db.query(
            func.min(Heritage.latitude).label("min_lat"),
            func.max(Heritage.latitude).label("max_lat"),
            func.min(Heritage.longitude).label("min_lng"),
            func.max(Heritage.longitude).label("max_lng"),
        ).filter(Heritage.latitude.isnot(None)).first()
        bbox = {
            "min_lat":    r.min_lat,
            "max_lat":    r.max_lat,
            "min_lng":    r.min_lng,
            "max_lng":    r.max_lng,
            "center_lat": round((r.min_lat + r.max_lat) / 2, 6),
            "center_lng": round((r.min_lng + r.max_lng) / 2, 6),
        }

    return {
        "total_sites":               total,
        "sites_with_coordinates":    with_c,
        "sites_without_coordinates": total - with_c,
        "coverage_percentage":       round(with_c / total * 100, 2) if total else 0,
        "bounding_box":              bbox,
    }


# ============================================================================
# 10. DATA COMPLETENESS
# ============================================================================
def get_data_completeness(db: Session) -> Dict[str, Any]:
    """Field-by-field completeness analysis"""
    total = db.query(Heritage).count()
    if total == 0:
        return {"total_sites": 0, "overall_score": 0, "fields": {}}

    tracked_fields = [
        "tamil_name", "location", "latitude", "longitude",
        "dynasty", "period", "year_built",
        "description", "history", "architecture", "cultural_significance",
        "image_url", "audio_path", "entry_fee", "visiting_hours",
        "best_time_to_visit", "unesco_criteria",
    ]

    fields_result = {}
    running_pct   = 0.0

    for field in tracked_fields:
        col = getattr(Heritage, field)
        n   = db.query(Heritage).filter(col.isnot(None)).count()
        pct = round(n / total * 100, 2)
        running_pct += pct
        fields_result[field] = {"filled": n, "missing": total - n, "percentage": pct}

    return {
        "total_sites":   total,
        "total_fields":  len(tracked_fields),
        "overall_score": round(running_pct / len(tracked_fields), 2),
        "fields":        fields_result,
    }


# ============================================================================
# 11. FULL DASHBOARD
# ============================================================================
def get_dashboard_data(db: Session) -> Dict[str, Any]:
    """All analytics bundled into one payload for the admin dashboard"""
    return {
        "overview":      get_overview_stats(db),
        "top_districts": get_top_districts(db, limit=5),
        "categories":    get_category_statistics(db),
        "dynasties":     get_dynasty_statistics(db),
        "unesco":        get_unesco_analysis(db),
        "geo_coverage":  get_geographic_coverage(db),
        "completeness":  get_data_completeness(db),
    }