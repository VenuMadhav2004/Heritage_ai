"""
User Model — Authentication & User Management
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """User model for authentication"""
    
    __tablename__ = "users"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Authentication
    email = Column(String(255), unique=True, index=True, nullable=False)
    firebase_uid = Column(String(255), unique=True, index=True, nullable=True)  # Firebase UID
    display_name = Column(String(255), nullable=True)
    photo_url = Column(Text, nullable=True)
    
    # OAuth Provider
    auth_provider = Column(String(50), default="email")  # "email" or "google"
    
    # Profile
    phone = Column(String(20), nullable=True)
    location = Column(String(255), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Preferences
    preferred_language = Column(String(10), default="en")
    
    # Activity tracking
    last_login = Column(DateTime(timezone=True), nullable=True)
    login_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "display_name": self.display_name,
            "photo_url": self.photo_url,
            "auth_provider": self.auth_provider,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "preferred_language": self.preferred_language,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
