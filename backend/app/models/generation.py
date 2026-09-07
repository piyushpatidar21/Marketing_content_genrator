import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class Generation(Base):
    __tablename__ = "generations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    campaign_id = Column(
        String(36),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    platform = Column(String(50), nullable=False, index=True)  # instagram, youtube, linkedin, etc.
    media_type = Column(String(50), nullable=False, index=True)  # text, image, video, audio

    input_data = Column(JSON, nullable=False)  # Serialized prompt payload and settings
    generated_content = Column(JSON, nullable=False)  # Structured output (hook, caption, hashtags, media prompt, etc.)

    status = Column(String(50), default="completed", nullable=False)  # completed, failed, generating
    model = Column(String(100), nullable=True)

    # Metadata & Metrics
    input_tokens = Column(Integer, default=0, nullable=True)
    output_tokens = Column(Integer, default=0, nullable=True)
    estimated_cost = Column(Float, default=0.0, nullable=True)
    generation_time_ms = Column(Integer, default=0, nullable=True)
    is_favorite = Column(Boolean, default=False, nullable=False, index=True)

    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False, index=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    campaign = relationship("Campaign", back_populates="generations")
    user = relationship("User", back_populates="generations")
    variations = relationship("ContentVariation", back_populates="generation", cascade="all, delete-orphan")

    @property
    def campaign_name(self) -> str | None:
        return self.campaign.name if self.campaign else None
