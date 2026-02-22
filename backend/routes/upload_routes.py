"""
Upload Routes — Tamil Nadu Heritage Management System
Image uploads ONLY.
Audio is handled dynamically by TTS service — no static audio uploads.

How images work:
  → You manually drop JPGs into static/images/
  → CSV image_url stores just the filename  e.g. brihadeeswarar_temple.jpg
  → get_image_url(filename) builds the full URL automatically
"""
import os
import re
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Path, Depends
from sqlalchemy.orm import Session

from config import IMAGES_DIR, get_image_url
from database import get_db
from models.heritage import Heritage

router = APIRouter(
    prefix="/upload",
    tags=["Image Upload"],
)

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}


# ─── helper ──────────────────────────────────────────────────────────────────
def _safe_filename(name: str) -> str:
    """Brihadeeswarar Temple  →  brihadeeswarar_temple.jpg"""
    n = name.lower().strip()
    n = re.sub(r"[^a-z0-9\s]", "", n)
    n = re.sub(r"\s+", "_", n)
    return f"{n}.jpg"


def _get_or_404(db: Session, heritage_id: int) -> Heritage:
    h = db.query(Heritage).filter(Heritage.id == heritage_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Heritage site not found")
    return h


# ============================================================================
# 1. UPLOAD IMAGE — by site ID  (API route, optional)
#    Main method: just copy file to static/images/ manually!
# ============================================================================
@router.post("/image/{heritage_id}")
async def upload_image(
    heritage_id: int  = Path(..., description="Heritage site ID"),
    file: UploadFile  = File(..., description="JPG / PNG / WebP"),
    db: Session       = Depends(get_db),
):
    """
    Upload an image for a heritage site via API.

    Saves to `static/images/<site_name>.jpg` and updates image_url in DB.

    **Alternative (simpler):** Just copy the file manually into static/images/
    with the correct filename — no API call needed.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"Allowed types: {', '.join(ALLOWED_IMAGE_EXT)}",
        )

    heritage  = _get_or_404(db, heritage_id)
    filename  = _safe_filename(heritage.name)
    save_path = IMAGES_DIR / filename

    with open(save_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    # Update DB
    heritage.image_url = filename
    db.commit()

    return {
        "status":        "success",
        "heritage_id":   heritage_id,
        "heritage_name": heritage.name,
        "filename":      filename,
        "full_url":      get_image_url(filename),
        "message":       f"Image saved and linked to '{heritage.name}'",
    }


# ============================================================================
# 2. LIST — all images in static/images/
# ============================================================================
@router.get("/images/list")
def list_images():
    """
    List all image files currently in static/images/.

    Useful to verify your manually uploaded images are in place.
    """
    images = []
    for f in sorted(IMAGES_DIR.iterdir()):
        if f.suffix.lower() in ALLOWED_IMAGE_EXT:
            images.append({
                "filename": f.name,
                "full_url": get_image_url(f.name),
                "size_kb":  round(f.stat().st_size / 1024, 2),
            })
    return {
        "total":       len(images),
        "images_dir":  str(IMAGES_DIR),
        "images":      images,
    }


# ============================================================================
# 3. MISSING — sites that still need an image
# ============================================================================
@router.get("/images/missing")
def missing_images(db: Session = Depends(get_db)):
    """
    Find heritage sites that don't have a local image yet.

    Use this to know exactly which filenames to add to static/images/.
    """
    sites   = db.query(Heritage).all()
    missing = []
    found   = []

    for s in sites:
        fname = _safe_filename(s.name)
        path  = IMAGES_DIR / fname

        if path.exists():
            found.append({
                "id":       s.id,
                "name":     s.name,
                "filename": fname,
                "url":      get_image_url(fname),
            })
        else:
            missing.append({
                "id":              s.id,
                "name":            s.name,
                "expected_file":   fname,
                "drop_image_here": f"static/images/{fname}",
            })

    return {
        "total_sites":    len(sites),
        "images_found":   len(found),
        "images_missing": len(missing),
        "missing":        missing,
        "found":          found,
    }


# ============================================================================
# 4. DELETE — remove an image file
# ============================================================================
@router.delete("/image/{filename}")
def delete_image(filename: str = Path(..., description="Filename to delete")):
    """Delete an image from static/images/"""
    path = IMAGES_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"'{filename}' not found")
    os.remove(path)
    return {"status": "deleted", "filename": filename}