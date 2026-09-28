from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class StructuredContentResponse(BaseModel):
    title: str | None = Field(None, description="Title or headline for the content")
    hook: str | None = Field(None, description="Attention-grabbing opening hook")
    caption: str | None = Field(None, description="Platform-optimized caption or core message")
    body: str | None = Field(None, description="Full body text (for blogs, emails, long posts, etc.)")
    cta: str | None = Field(None, description="Clear, compelling Call to Action")
    hashtags: list[str] = Field(default_factory=list, description="Targeted relevant hashtags")
    emojis: list[str] = Field(default_factory=list, description="Recommended emojis")

    # Platform-specific formats
    twitter_thread: list[str] | None = Field(None, description="Numbered tweets for X/Twitter")
    email_details: dict[str, Any] | None = Field(None, description="Subject, preview text, body, CTA for emails")
    blog_details: dict[str, Any] | None = Field(
        None, description="SEO title, meta description, outline, body for blogs"
    )
    sms_message: str | None = Field(None, description="Concise SMS copy under 160 chars")

    # Media Prompts & Downstream Directions
    media_prompt: str | None = Field(
        None,
        description="Optimized image/visual prompt with lighting, composition, style",
    )
    image_prompt_details: dict[str, Any] | None = Field(None, description="Structured image prompt breakdown")
    video_script: dict[str, Any] | None = Field(None, description="Scene-by-scene video script breakdown")
    audio_script: dict[str, Any] | None = Field(None, description="Voiceover script, tone, speed, BGM suggestions")

    # Generated Asset Artifacts (from OpenAI Image, ElevenLabs, Runway/Veo)
    image_url: str | None = Field(None, description="Direct URL of the generated image (OpenAI / DALL-E)")
    audio_url: str | None = Field(None, description="Direct URL or audio data URI for generated ElevenLabs speech")
    audio_base64: str | None = Field(None, description="Base64 encoded MP3 audio data")
    video_url: str | None = Field(None, description="Direct URL of the generated video (Runway / Veo)")
    video_task_id: str | None = Field(None, description="Asynchronous video generation task ID")
    ai_provider_used: str | None = Field(None, description="Identifier of the specific AI provider that generated this asset")

    # Alternative variations
    variations: list[str] = Field(default_factory=list, description="Alternative hooks, angles, or phrasing")



class GenerationCreateRequest(BaseModel):
    campaign_id: str = Field(..., description="ID of the campaign to generate for")
    platforms: list[str] = Field(
        ...,
        min_length=1,
        description="Target platforms (e.g. instagram, linkedin, etc.)",
    )
    media_types: list[str] = Field(..., min_length=1, description="Target media types (text, image, video, audio)")
    custom_instructions: str | None = Field(None, description="Optional extra directives for this generation run")


class GenerationRegenerateRequest(BaseModel):
    modification_instruction: str | None = Field(
        None,
        description="E.g. 'make it shorter', 'more professional', 'focus more on pricing'",
    )


class GenerationUpdateRequest(BaseModel):
    generated_content: dict[str, Any] | None = Field(None, description="Updated structured generated content payload")
    is_favorite: bool | None = Field(None, description="Updated favorite status")


class ContentVariationCreateRequest(BaseModel):
    title: str | None = None
    content: dict[str, Any]


class ContentVariationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    generation_id: str
    title: str | None = None
    content: dict[str, Any]
    is_favorite: bool
    created_at: datetime


class GenerationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    campaign_id: str
    user_id: str
    platform: str
    media_type: str
    input_data: dict[str, Any]
    generated_content: dict[str, Any]
    status: str
    model: str | None = None
    input_tokens: int | None = 0
    output_tokens: int | None = 0
    estimated_cost: float | None = 0.0
    generation_time_ms: int | None = 0
    is_favorite: bool
    created_at: datetime
    updated_at: datetime
    campaign_name: str | None = None
    variations: list[ContentVariationResponse] | None = []


class MultiGenerationResponse(BaseModel):
    total_generated: int
    generations: list[GenerationResponse]


class DashboardStatsResponse(BaseModel):
    total_campaigns: int
    total_generations: int
    total_favorites: int
    most_used_platform: str | None = "None"
    platform_breakdown: dict[str, int]
    recent_campaigns: list[Any]
    recent_generations: list[Any]


# Dedicated Media-Specific Request Schemas


class TextGenerationRequest(BaseModel):
    campaign_id: str | None = Field(None, description="Optional campaign ID. If omitted, a default campaign is used.")
    topic_or_idea: str | None = Field(None, description="Topic, idea, or product description if not using campaign")
    platforms: list[str] = Field(
        default=["instagram"],
        min_length=1,
        description="Target platforms (e.g. instagram, twitter, linkedin, email, blog, sms, etc.)",
    )
    tone: str | None = Field(None, description="Tone override (e.g. witty, professional, urgent, energetic)")
    custom_instructions: str | None = Field(None, description="Optional extra directives for the copywriter")


class ImageGenerationRequest(BaseModel):
    campaign_id: str | None = Field(None, description="Optional campaign ID. If omitted, a default campaign is used.")
    prompt_topic: str | None = Field(None, description="Description of the image subject, product, or visual concept")
    platforms: list[str] = Field(
        default=["instagram"],
        min_length=1,
        description="Target platforms (e.g. instagram, facebook, youtube, blog, linkedin)",
    )
    style: str | None = Field(
        None,
        description="Visual style (e.g. Photorealistic, 3D Render, Minimalist, Cinematic, Cyberpunk, Editorial)",
    )
    aspect_ratio: str | None = Field(
        None,
        description="Desired aspect ratio (e.g. 1:1, 16:9, 9:16, 4:5)",
    )
    custom_instructions: str | None = Field(None, description="Optional extra directives for image prompt generation")


class VideoGenerationRequest(BaseModel):
    campaign_id: str | None = Field(None, description="Optional campaign ID. If omitted, a default campaign is used.")
    video_concept: str | None = Field(None, description="Core concept or story arc for the video")
    platforms: list[str] = Field(
        default=["youtube"],
        min_length=1,
        description="Target platforms (e.g. youtube, instagram, tiktok, linkedin, facebook)",
    )
    target_duration: str | None = Field(
        None,
        description="Target video duration (e.g. 15s, 30s, 60s, 90s)",
    )
    video_style: str | None = Field(
        None,
        description="Video production style (e.g. UGC Creator Review, Cinematic Commercial, Explainer, Teaser)",
    )
    custom_instructions: str | None = Field(None, description="Optional extra directives for video script generation")


class AudioGenerationRequest(BaseModel):
    campaign_id: str | None = Field(None, description="Optional campaign ID. If omitted, a default campaign is used.")
    audio_concept: str | None = Field(None, description="Voiceover topic, story, or message to convey")
    platforms: list[str] = Field(
        default=["podcast"],
        min_length=1,
        description="Target platforms (e.g. podcast, youtube, radio, voiceover)",
    )
    voice_profile: str | None = Field(
        None,
        description="Voice archetype (e.g. Warm and friendly female, Authoritative deep male, Energetic youthful)",
    )
    pacing: str | None = Field(
        None,
        description="Target speech pacing (e.g. Moderate 140 WPM, Rapid 160 WPM, Calm 120 WPM)",
    )
    custom_instructions: str | None = Field(None, description="Optional extra directives for audio script generation")

