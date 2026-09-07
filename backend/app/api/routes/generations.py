from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.generation import (
    DashboardStatsResponse,
    GenerationCreateRequest,
    GenerationRegenerateRequest,
    GenerationResponse,
    GenerationUpdateRequest,
    MultiGenerationResponse,
)
from app.services.generation_service import GenerationService

router = APIRouter(tags=["Generations"])


@router.post(
    "/generations",
    response_model=ApiResponse[MultiGenerationResponse],
    status_code=status.HTTP_201_CREATED,
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
