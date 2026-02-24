"""
Auth Routes — Firebase Authentication
Supports: Email/Password & Google OAuth
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import logging

from database import get_db
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

# Firebase Admin SDK (optional - for server-side verification)
# Uncomment if you want server-side token verification
# import firebase_admin
# from firebase_admin import auth as firebase_auth


# ============================================================================
# SCHEMAS
# ============================================================================
class UserRegister(BaseModel):
    """User registration via Firebase"""
    firebase_uid: str
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    auth_provider: str = "email"  # "email" or "google"


class UserLogin(BaseModel):
    """User login response"""
    user_id: int
    email: str
    display_name: Optional[str]
    photo_url: Optional[str]
    auth_provider: str
    is_new_user: bool


class UserProfile(BaseModel):
    """User profile update"""
    display_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    preferred_language: Optional[str] = None


# ============================================================================
# 1. REGISTER / LOGIN (Firebase)
# ============================================================================
@router.post("/firebase/login", response_model=UserLogin)
async def firebase_login(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register or login user via Firebase
    
    Called after user authenticates with Firebase on frontend.
    Creates user in database if new, or updates last login if existing.
    """
    try:
        # Check if user exists
        user = db.query(User).filter(User.firebase_uid == user_data.firebase_uid).first()
        
        is_new_user = False
        
        if not user:
            # New user - create account
            user = User(
                firebase_uid=user_data.firebase_uid,
                email=user_data.email,
                display_name=user_data.display_name,
                photo_url=user_data.photo_url,
                auth_provider=user_data.auth_provider,
                is_verified=True if user_data.auth_provider == "google" else False,
                last_login=datetime.now(),
                login_count=1,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            is_new_user = True
            
            logger.info(f"✅ New user registered: {user.email} via {user.auth_provider}")
        else:
            # Existing user - update login info
            user.last_login = datetime.now()
            user.login_count += 1
            
            # Update profile if Google OAuth provides new data
            if user_data.display_name:
                user.display_name = user_data.display_name
            if user_data.photo_url:
                user.photo_url = user_data.photo_url
            
            db.commit()
            db.refresh(user)
            
            logger.info(f"✅ User logged in: {user.email}")
        
        return UserLogin(
            user_id=user.id,
            email=user.email,
            display_name=user.display_name,
            photo_url=user.photo_url,
            auth_provider=user.auth_provider,
            is_new_user=is_new_user,
        )
        
    except Exception as e:
        logger.error(f"❌ Firebase login failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# 2. GET USER PROFILE
# ============================================================================
@router.get("/me")
async def get_current_user(
    firebase_uid: str = Header(..., alias="X-Firebase-UID"),
    db: Session = Depends(get_db)
):
    """
    Get current user profile
    
    Frontend sends Firebase UID in header after authentication.
    """
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.to_dict()


# ============================================================================
# 3. UPDATE PROFILE
# ============================================================================
@router.put("/profile")
async def update_profile(
    profile: UserProfile,
    firebase_uid: str = Header(..., alias="X-Firebase-UID"),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if profile.display_name is not None:
        user.display_name = profile.display_name
    if profile.phone is not None:
        user.phone = profile.phone
    if profile.location is not None:
        user.location = profile.location
    if profile.preferred_language is not None:
        user.preferred_language = profile.preferred_language
    
    db.commit()
    db.refresh(user)
    
    return user.to_dict()


# ============================================================================
# 4. DELETE ACCOUNT
# ============================================================================
@router.delete("/account")
async def delete_account(
    firebase_uid: str = Header(..., alias="X-Firebase-UID"),
    db: Session = Depends(get_db)
):
    """Delete user account"""
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return {"success": True, "message": "Account deleted successfully"}


# ============================================================================
# 5. USER STATS
# ============================================================================
@router.get("/stats")
async def get_user_stats(db: Session = Depends(get_db)):
    """Get user registration statistics"""
    total_users = db.query(User).count()
    email_users = db.query(User).filter(User.auth_provider == "email").count()
    google_users = db.query(User).filter(User.auth_provider == "google").count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    return {
        "total_users": total_users,
        "email_users": email_users,
        "google_users": google_users,
        "active_users": active_users,
    }
