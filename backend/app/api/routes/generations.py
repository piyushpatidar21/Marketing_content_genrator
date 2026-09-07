from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.generation import (
    AudioGenerationRequest,
    DashboardStatsResponse,
    GenerationCreateRequest,
    GenerationRegenerateRequest,
    GenerationResponse,
    GenerationUpdateRequest,
    ImageGenerationRequest,
    MultiGenerationResponse,
    TextGenerationRequest,
    VideoGenerationRequest,
)
from app.services.generation_service import GenerationService

router = APIRouter(tags=["Generations"])


# ---------------------------------------------------------------------------
# Dedicated Media-Specific APIs (Text, Image, Video, Audio)
# ---------------------------------------------------------------------------


@router.post(
    "/generations/text",
    response_model=ApiResponse[MultiGenerationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate Text & Marketing Copy",
    tags=["Generations: Text"],
)
async def generate_text_content(
    req: TextGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Dedicated API to generate platform-native marketing copy:
    - Attention hooks, captions, full body text, CTAs, and hashtags
    - Platform-specific formats (Twitter/X threads, Email newsletters, SEO blog articles, SMS)
    """
    generations = await GenerationService.generate_media(
        db=db,
        user_id=current_user.id,
        media_type="text",
        platforms=req.platforms,
        campaign_id=req.campaign_id,
        concept_or_topic=req.topic_or_idea,
        tone=req.tone,
        custom_instructions=req.custom_instructions,
    )
    return ApiResponse(
        success=True,
        message=f"Generated {len(generations)} tailored text variation(s)",
        data=MultiGenerationResponse(
            total_generated=len(generations),
            generations=[GenerationResponse.model_validate(g) for g in generations],
        ),
    )


@router.get(
    "/generations/text",
    response_model=ApiResponse[list[GenerationResponse]],
    summary="List Text Generations",
    tags=["Generations: Text"],
)
def list_text_generations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    campaign_id: str | None = Query(None),
    platform: str | None = Query(None),
    favorite_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total, items = GenerationService.list_generations(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        campaign_id=campaign_id,
        platform=platform,
        media_type="text",
        favorite_only=favorite_only,
    )
    return ApiResponse(
        success=True,
        message="Text generations retrieved",
        data=[GenerationResponse.model_validate(g) for g in items],
    )


@router.post(
    "/generations/image",
    response_model=ApiResponse[MultiGenerationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate Image & Visual Prompts",
    tags=["Generations: Image"],
)
async def generate_image_content(
    req: ImageGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Dedicated API to generate production-ready visual prompts for Midjourney, DALL-E 3, and Flux:
    - Subject, backdrop, camera framing, lighting, aspect ratio, and negative prompts
    """
    generations = await GenerationService.generate_media(
        db=db,
        user_id=current_user.id,
        media_type="image",
        platforms=req.platforms,
        campaign_id=req.campaign_id,
        concept_or_topic=req.prompt_topic,
        specific_options={
            "visual_style": req.style,
            "aspect_ratio": req.aspect_ratio,
        },
        custom_instructions=req.custom_instructions,
    )
    return ApiResponse(
        success=True,
        message=f"Generated {len(generations)} image prompt variation(s)",
        data=MultiGenerationResponse(
            total_generated=len(generations),
            generations=[GenerationResponse.model_validate(g) for g in generations],
        ),
    )


@router.get(
    "/generations/image",
    response_model=ApiResponse[list[GenerationResponse]],
    summary="List Image Generations",
    tags=["Generations: Image"],
)
def list_image_generations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    campaign_id: str | None = Query(None),
    platform: str | None = Query(None),
    favorite_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total, items = GenerationService.list_generations(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        campaign_id=campaign_id,
        platform=platform,
        media_type="image",
        favorite_only=favorite_only,
    )
    return ApiResponse(
        success=True,
        message="Image generations retrieved",
        data=[GenerationResponse.model_validate(g) for g in items],
    )


@router.post(
    "/generations/video",
    response_model=ApiResponse[MultiGenerationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate Video Production Scripts",
    tags=["Generations: Video"],
)
async def generate_video_content(
    req: VideoGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Dedicated API to generate scene-by-scene video production scripts:
    - Timestamps, visual actions, camera movements, spoken voiceovers, text overlays, and audio cues
    """
    generations = await GenerationService.generate_media(
        db=db,
        user_id=current_user.id,
        media_type="video",
        platforms=req.platforms,
        campaign_id=req.campaign_id,
        concept_or_topic=req.video_concept,
        specific_options={
            "target_duration": req.target_duration,
            "video_style": req.video_style,
        },
        custom_instructions=req.custom_instructions,
    )
    return ApiResponse(
        success=True,
        message=f"Generated {len(generations)} video script variation(s)",
        data=MultiGenerationResponse(
            total_generated=len(generations),
            generations=[GenerationResponse.model_validate(g) for g in generations],
        ),
    )


@router.get(
    "/generations/video",
    response_model=ApiResponse[list[GenerationResponse]],
    summary="List Video Generations",
    tags=["Generations: Video"],
)
def list_video_generations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    campaign_id: str | None = Query(None),
    platform: str | None = Query(None),
    favorite_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total, items = GenerationService.list_generations(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        campaign_id=campaign_id,
        platform=platform,
        media_type="video",
        favorite_only=favorite_only,
    )
    return ApiResponse(
        success=True,
        message="Video generations retrieved",
        data=[GenerationResponse.model_validate(g) for g in items],
    )


@router.post(
    "/generations/audio",
    response_model=ApiResponse[MultiGenerationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate Audio & Voiceover Briefs",
    tags=["Generations: Audio"],
)
async def generate_audio_content(
    req: AudioGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Dedicated API to generate voiceover scripts and audio production briefs:
    - Spoken transcript, vocal tone/archetype, speech pacing (WPM), pauses, BGM direction, and sound effects
    """
    generations = await GenerationService.generate_media(
        db=db,
        user_id=current_user.id,
        media_type="audio",
        platforms=req.platforms,
        campaign_id=req.campaign_id,
        concept_or_topic=req.audio_concept,
        specific_options={
            "voice_profile": req.voice_profile,
            "pacing": req.pacing,
        },
        custom_instructions=req.custom_instructions,
    )
    return ApiResponse(
        success=True,
        message=f"Generated {len(generations)} audio script variation(s)",
        data=MultiGenerationResponse(
            total_generated=len(generations),
            generations=[GenerationResponse.model_validate(g) for g in generations],
        ),
    )


@router.get(
    "/generations/audio",
    response_model=ApiResponse[list[GenerationResponse]],
    summary="List Audio Generations",
    tags=["Generations: Audio"],
)
def list_audio_generations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    campaign_id: str | None = Query(None),
    platform: str | None = Query(None),
    favorite_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total, items = GenerationService.list_generations(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        campaign_id=campaign_id,
        platform=platform,
        media_type="audio",
        favorite_only=favorite_only,
    )
    return ApiResponse(
        success=True,
        message="Audio generations retrieved",
        data=[GenerationResponse.model_validate(g) for g in items],
    )


# ---------------------------------------------------------------------------
# Multi-Platform / Multi-Media Unified Endpoint (Backwards-Compatible)
# ---------------------------------------------------------------------------


@router.post(
    "/generations",
    response_model=ApiResponse[MultiGenerationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Unified Multi-Platform AI Generation",
)
async def generate_marketing_content(
    req: GenerationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    generations = await GenerationService.generate_content(db, user_id=current_user.id, req=req)
    return ApiResponse(
        success=True,
        message=f"Generated {len(generations)} tailored marketing variation(s)",
        data=MultiGenerationResponse(
            total_generated=len(generations),
            generations=[GenerationResponse.model_validate(g) for g in generations],
        ),
    )


@router.get("/generations", response_model=ApiResponse[list[GenerationResponse]])
def list_generations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    campaign_id: str | None = Query(None),
    platform: str | None = Query(None),
    media_type: str | None = Query(None),
    favorite_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total, items = GenerationService.list_generations(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        campaign_id=campaign_id,
        platform=platform,
        media_type=media_type,
        favorite_only=favorite_only,
    )
    return ApiResponse(
        success=True,
        message="Generations retrieved",
        data=[GenerationResponse.model_validate(g) for g in items],
    )


@router.get("/generations/{generation_id}", response_model=ApiResponse[GenerationResponse])
def get_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = GenerationService.get_generation_by_id(db, generation_id=generation_id, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Generation details fetched",
        data=GenerationResponse.model_validate(g),
    )


@router.put("/generations/{generation_id}", response_model=ApiResponse[GenerationResponse])
def update_generation(
    generation_id: str,
    req: GenerationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = GenerationService.update_generation(db, generation_id=generation_id, user_id=current_user.id, req=req)
    return ApiResponse(
        success=True,
        message="Generation updated successfully",
        data=GenerationResponse.model_validate(g),
    )


@router.post(
    "/generations/{generation_id}/regenerate",
    response_model=ApiResponse[GenerationResponse],
)
async def regenerate_content(
    generation_id: str,
    req: GenerationRegenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = await GenerationService.regenerate_content(db, user_id=current_user.id, generation_id=generation_id, req=req)
    return ApiResponse(
        success=True,
        message="Content regenerated successfully",
        data=GenerationResponse.model_validate(g),
    )


@router.post(
    "/generations/{generation_id}/favorite",
    response_model=ApiResponse[GenerationResponse],
)
def favorite_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = GenerationService.toggle_favorite(db, generation_id=generation_id, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Favorite status updated",
        data=GenerationResponse.model_validate(g),
    )


@router.delete(
    "/generations/{generation_id}/favorite",
    response_model=ApiResponse[GenerationResponse],
)
def unfavorite_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = GenerationService.toggle_favorite(db, generation_id=generation_id, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Favorite status updated",
        data=GenerationResponse.model_validate(g),
    )


@router.delete("/generations/{generation_id}", response_model=ApiResponse[dict])
def delete_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    GenerationService.delete_generation(db, generation_id=generation_id, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Generation deleted successfully",
        data={"id": generation_id},
    )


@router.get("/dashboard/stats", response_model=ApiResponse[DashboardStatsResponse])
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stats = GenerationService.get_dashboard_stats(db, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Dashboard stats retrieved",
        data=stats,
    )
