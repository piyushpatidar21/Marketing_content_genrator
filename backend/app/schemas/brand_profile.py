from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BrandProfileCreateRequest(BaseModel):
    brand_name: str = Field(..., min_length=2, max_length=200, description="Brand name")
    description: str | None = None
    industry: str | None = None
    target_audience: str | None = None
    brand_voice: str | None = Field(None, description="e.g. Bold, Authoritative, Playful, Empathetic")
    preferred_tone: str | None = Field(None, description="e.g. Professional, Friendly, Luxury")
    products_services: str | None = None
    brand_values: str | None = None
    default_cta: str | None = None
    forbidden_words: list[str] | None = Field(default_factory=list, description="Words/claims to never use")
    preferred_language: str = Field("English", max_length=50)


class BrandProfileUpdateRequest(BaseModel):
    brand_name: str | None = Field(None, min_length=2, max_length=200)
    description: str | None = None
    industry: str | None = None
    target_audience: str | None = None
    brand_voice: str | None = None
    preferred_tone: str | None = None
    products_services: str | None = None
    brand_values: str | None = None
    default_cta: str | None = None
    forbidden_words: list[str] | None = None
    preferred_language: str | None = None


class BrandProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    brand_name: str
    description: str | None = None
    industry: str | None = None
    target_audience: str | None = None
    brand_voice: str | None = None
    preferred_tone: str | None = None
    products_services: str | None = None
    brand_values: str | None = None
    default_cta: str | None = None
    forbidden_words: list[str] | None = None
    preferred_language: str
    created_at: datetime
    updated_at: datetime
