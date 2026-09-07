import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Core fields
    name = Column(String(200), nullable=False)
    idea = Column(Text, nullable=False)
    product_service = Column(String(200), nullable=False)

    # Audience & Targeting
    target_audience = Column(Text, nullable=False)
    age_group = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    interests = Column(Text, nullable=True)
    pain_points = Column(Text, nullable=True)

    # Campaign Strategy
    goal = Column(String(100), nullable=False, default="engagement")  # brand awareness, lead generation, sales, etc.
    tone = Column(String(100), nullable=False, default="professional")  # professional, energetic, funny, etc.
    language = Column(String(50), nullable=False, default="English")

    # Optional extras
    key_points = Column(Text, nullable=True)
    cta = Column(String(200), nullable=True)
    keywords = Column(Text, nullable=True)
    hashtag_preference = Column(String(100), nullable=True)
    additional_instructions = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="campaigns")
    generations = relationship("Generation", back_populates="campaign", cascade="all, delete-orphan")

    @property
    def generation_count(self) -> int:
        return len(self.generations) if self.generations is not None else 0
