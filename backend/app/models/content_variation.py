import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class ContentVariation(Base):
    __tablename__ = "content_variations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    generation_id = Column(
        String(36),
        ForeignKey("generations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String(200), nullable=True)
    content = Column(JSON, nullable=False)  # Variation content payload
    is_favorite = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    # Relationships
    generation = relationship("Generation", back_populates="variations")
