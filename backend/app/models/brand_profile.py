import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class BrandProfile(Base):
    __tablename__ = "brand_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    brand_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    target_audience = Column(Text, nullable=True)
    brand_voice = Column(String(100), nullable=True)  # e.g., Authoritative, Friendly, Playful
    preferred_tone = Column(String(100), nullable=True)
    products_services = Column(Text, nullable=True)
    brand_values = Column(Text, nullable=True)
    default_cta = Column(String(200), nullable=True)
    forbidden_words = Column(JSON, nullable=True)  # list of strings
    preferred_language = Column(String(50), default="English", nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="brand_profile")
