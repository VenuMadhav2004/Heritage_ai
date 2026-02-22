"""
Data Loader Service - Major Project Level
Loads heritage data from CSV with validation and error handling
"""
import csv
import os
import logging
from sqlalchemy.orm import Session
from typing import Dict, List, Any

from models.heritage import Heritage
from config import CSV_FILE_PATH, HERITAGE_CATEGORIES, DYNASTIES

logger = logging.getLogger(__name__)

# ============================================================================
# TYPE CONVERTERS
# ============================================================================
def convert_to_boolean(value: str) -> bool:
    """Convert string to boolean"""
    if isinstance(value, bool):
        return value
    if not value or value.strip() == "":
        return False
    return str(value).strip().upper() in ["TRUE", "YES", "1", "T", "Y"]


def convert_to_float(value: str) -> float:
    """Safely convert string to float"""
    try:
        if value and str(value).strip():
            return float(value)
        return None
    except (ValueError, TypeError):
        return None


def clean_string(value: str) -> str:
    """Clean and normalize string"""
    if not value or value.strip() == "":
        return None
    return value.strip()


# ============================================================================
# CSV FIELD MAPPING
# ============================================================================
CSV_FIELD_MAPPING = {
    # CSV column name -> Model field name
    "name": "name",
    "tamil_name": "tamil_name",
    "district": "district",
    "location": "location",
    "latitude": "latitude",
    "longitude": "longitude",
    "heritage_type": "category",  # Map heritage_type to category
    "category": "category",
    "dynasty": "dynasty",
    "period": "period",
    "year_built": "year_built",
    "description": "description",
    "history": "history",
    "historical_significance": "cultural_significance",  # Map to cultural_significance
    "architecture": "architecture",
    "cultural_significance": "cultural_significance",
    "unesco_site": "unesco_site",
    "unesco_criteria": "unesco_criteria",
    "image_url": "image_url",          # just filename
    # audio_path excluded — TTS generates dynamically
    "entry_fee": "entry_fee",
    "visiting_hours": "visiting_hours",
    "best_time_to_visit": "best_time_to_visit",
    "wheelchair_accessible": "wheelchair_accessible",
    "parking_available": "parking_available",
}


# ============================================================================
# MAIN LOADER FUNCTION
# ============================================================================
def load_heritage_data(db: Session) -> Dict[str, Any]:
    """
    Load heritage data from CSV file with enhanced validation
    
    Args:
        db: SQLAlchemy database session
        
    Returns:
        dict: Load statistics and results
    """
    
    # Check if data already exists
    existing_count = db.query(Heritage).count()
    if existing_count > 0:
        logger.info(f"Database already contains {existing_count} records. Skipping load.")
        return {
            "status": "skipped",
            "message": f"Database already contains {existing_count} records. Use reload if needed.",
            "loaded": 0,
            "skipped": existing_count,
            "errors": 0
        }
    
    # Check if CSV file exists
    if not os.path.exists(CSV_FILE_PATH):
        logger.error(f"CSV file not found at {CSV_FILE_PATH}")
        return {
            "status": "error",
            "message": f"CSV file not found at {CSV_FILE_PATH}",
            "loaded": 0,
            "errors": 1
        }
    
    loaded_count = 0
    error_count = 0
    errors = []
    warnings = []
    
    try:
        with open(CSV_FILE_PATH, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            # Validate CSV headers
            csv_headers = set(csv_reader.fieldnames)
            required_fields = {'name', 'district', 'heritage_type', 'category'}
            
            if not required_fields.intersection(csv_headers):
                return {
                    "status": "error",
                    "message": "CSV missing required fields (name, district, heritage_type/category)",
                    "loaded": 0,
                    "errors": 1
                }
            
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    # Map CSV fields to model fields
                    heritage_data = {}
                    
                    for csv_field, model_field in CSV_FIELD_MAPPING.items():
                        if csv_field in row:
                            value = row[csv_field]
                            
                            # Type conversions
                            if model_field in ['latitude', 'longitude']:
                                heritage_data[model_field] = convert_to_float(value)
                            elif model_field in ['unesco_site', 'wheelchair_accessible', 'parking_available']:
                                heritage_data[model_field] = convert_to_boolean(value)
                            else:
                                heritage_data[model_field] = clean_string(value)
                    
                    # Validate required fields
                    if not heritage_data.get('name'):
                        errors.append(f"Row {row_num}: Missing required field 'name'")
                        error_count += 1
                        continue
                    
                    if not heritage_data.get('district'):
                        errors.append(f"Row {row_num}: Missing required field 'district'")
                        error_count += 1
                        continue
                    
                    if not heritage_data.get('category'):
                        errors.append(f"Row {row_num}: Missing required field 'category'")
                        error_count += 1
                        continue
                    
                    # Create Heritage object
                    heritage = Heritage(**heritage_data)
                    
                    db.add(heritage)
                    loaded_count += 1
                    
                    # Log validation warnings
                    if heritage_data.get('category') not in HERITAGE_CATEGORIES:
                        warnings.append(
                            f"Row {row_num}: Uncommon category '{heritage_data.get('category')}'"
                        )
                    
                except Exception as e:
                    error_count += 1
                    errors.append(f"Row {row_num}: {str(e)}")
                    logger.error(f"Error processing row {row_num}: {str(e)}")
                    continue
            
            # Commit all records
            db.commit()
            logger.info(f"✅ Successfully loaded {loaded_count} heritage sites")
            
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to load CSV: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to load CSV: {str(e)}",
            "loaded": 0,
            "errors": 1
        }
    
    return {
        "status": "success",
        "message": f"Successfully loaded {loaded_count} heritage sites",
        "loaded": loaded_count,
        "errors": error_count,
        "warnings": len(warnings),
        "error_details": errors[:10] if errors else [],
        "warning_details": warnings[:10] if warnings else []
    }


# ============================================================================
# RELOAD FUNCTION
# ============================================================================
def reload_data(db: Session) -> Dict[str, Any]:
    """
    Delete all existing data and reload from CSV
    
    Args:
        db: SQLAlchemy database session
        
    Returns:
        dict: Reload statistics
    """
    try:
        # Delete all existing records
        deleted = db.query(Heritage).delete()
        db.commit()
        logger.info(f"🗑️  Deleted {deleted} existing records")
        
        # Load fresh data
        result = load_heritage_data(db)
        result["deleted"] = deleted
        
        return result
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to reload data: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to reload data: {str(e)}",
            "loaded": 0,
            "deleted": 0,
            "errors": 1
        }


# ============================================================================
# DATA VALIDATION
# ============================================================================
def validate_data_quality(db: Session) -> Dict[str, Any]:
    """
    Validate data quality and completeness
    
    Returns:
        dict: Data quality report
    """
    total_sites = db.query(Heritage).count()
    
    if total_sites == 0:
        return {"status": "empty", "total_sites": 0}
    
    quality_report = {
        "total_sites": total_sites,
        "completeness": {},
        "validation": {}
    }
    
    # Check field completeness
    fields_to_check = [
        'tamil_name', 'location', 'latitude', 'longitude',
        'dynasty', 'description', 'history', 'architecture',
        'image_url', 'audio_path'
    ]
    
    for field in fields_to_check:
        count = db.query(Heritage).filter(
            getattr(Heritage, field).isnot(None)
        ).count()
        quality_report["completeness"][field] = {
            "filled": count,
            "percentage": round((count / total_sites * 100), 2)
        }
    
    # Validation checks
    quality_report["validation"]["sites_with_coordinates"] = db.query(Heritage).filter(
        Heritage.latitude.isnot(None),
        Heritage.longitude.isnot(None)
    ).count()
    
    quality_report["validation"]["unesco_sites"] = db.query(Heritage).filter(
        Heritage.unesco_site == True
    ).count()
    
    return quality_report