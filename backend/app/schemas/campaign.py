from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CampaignCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, description="Campaign name")
    idea: str = Field(..., min_length=5, description="Core campaign idea or message")
    product_service: str = Field(..., min_length=2, max_length=200, description="Product or service name")

    # Audience
    target_audience: str = Field(..., min_length=3, description="Target demographic and profile")
    age_group: str | None = Field(None, max_length=100)
    location: str | None = Field(None, max_length=100)
    interests: str | None = None
    pain_points: str | None = None

    # Strategy
    goal: str = Field(
        "brand awareness",
        description="Goal e.g. brand awareness, lead generation, sales, etc.",
    )
    tone: str = Field(
        "energetic",
        description="Tone e.g. professional, friendly, funny, energetic, luxury, etc.",
    )
    language: str = Field("English", description="Target language")

    # Extras
    key_points: str | None = None
    cta: str | None = None
    keywords: str | None = None
    hashtag_preference: str | None = None
    additional_instructions: str | None = None


class CampaignUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    idea: str | None = Field(None, min_length=5)
    product_service: str | None = Field(None, min_length=2, max_length=200)
    target_audience: str | None = None
    age_group: str | None = None
    location: str | None = None
    interests: str | None = None
    pain_points: str | None = None
    goal: str | None = None
    tone: str | None = None
    language: str | None = None
    key_points: str | None = None
    cta: str | None = None
    keywords: str | None = None
    hashtag_preference: str | None = None
    additional_instructions: str | None = None


class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    idea: str
    product_service: str
    target_audience: str
    age_group: str | None = None
    location: str | None = None
    interests: str | None = None
    pain_points: str | None = None
    goal: str
    tone: str
    language: str
    key_points: str | None = None
    cta: str | None = None
    keywords: str | None = None
    hashtag_preference: str | None = None
    additional_instructions: str | None = None
    created_at: datetime
    updated_at: datetime
    generation_count: int | None = 0


class CampaignListResponse(BaseModel):
    total: int
    items: list[CampaignResponse]
