"""
Database Module - Major Project Level
Handles database connection, session management, and base models
"""
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
import logging
from sqlalchemy import text 

from config import DATABASE_URL

# ============================================================================
# LOGGING SETUP
# ============================================================================
logger = logging.getLogger(__name__)

# ============================================================================
# DATABASE ENGINE
# ============================================================================
# For SQLite (Development)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # SQLite optimization
        echo=False,  # Set to True for SQL query logging
    )
else:
    # For PostgreSQL (Production)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=10,  # Connection pool size
        max_overflow=20,  # Max connections beyond pool_size
        echo=False,
    )

# ============================================================================
# SESSION FACTORY
# ============================================================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ============================================================================
# BASE CLASS FOR MODELS
# ============================================================================
Base = declarative_base()

# ============================================================================
# DATABASE DEPENDENCY
# ============================================================================
def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that provides database session to routes.
    
    Yields:
        Session: SQLAlchemy database session
        
    Usage in routes:
        @app.get("/")
        def endpoint(db: Session = Depends(get_db)):
            pass
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================
def init_database() -> None:
    """
    Initialize database by creating all tables.
    Called on application startup.
    """
    try:
        from models.user import User
        from models.heritage import Heritage
        from models.ai_content import AIGeneratedContent
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {str(e)}")
        raise

# ============================================================================
# DATABASE UTILITIES
# ============================================================================
def check_database_connection() -> bool:
    """
    Check if database connection is working.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {str(e)}")
        return False

def get_database_stats() -> dict:
    """
    Get database statistics.
    
    Returns:
        dict: Database statistics
    """
    try:
        from models.heritage import Heritage
        from models.ai_content import AIGeneratedContent
        
        db = SessionLocal()
        
        stats = {
            "heritage_sites_count": db.query(Heritage).count(),
            "ai_content_count": db.query(AIGeneratedContent).count(),
            "database_connected": True,
        }
        
        db.close()
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get database stats: {str(e)}")
        return {
            "database_connected": False,
            "error": str(e)
        }

# ============================================================================
# SQLite OPTIMIZATIONS
# ============================================================================
if DATABASE_URL.startswith("sqlite"):
    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=10000")
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.close()
        
    logger.info("✅ SQLite optimizations enabled")