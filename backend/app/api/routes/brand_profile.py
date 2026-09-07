from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.brand_profile import (
    BrandProfileCreateRequest,
    BrandProfileResponse,
)
from app.schemas.common import ApiResponse
from app.services.brand_service import BrandService

router = APIRouter(prefix="/brand-profile", tags=["Brand Profile"])


@router.get("", response_model=ApiResponse[Optional[BrandProfileResponse]])
def get_brand_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = BrandService.get_brand_profile(db, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Brand profile fetched",
        data=BrandProfileResponse.model_validate(profile) if profile else None,
    )


@router.post("", response_model=ApiResponse[BrandProfileResponse])
@router.put("", response_model=ApiResponse[BrandProfileResponse])
def save_brand_profile(
    req: BrandProfileCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = BrandService.upsert_brand_profile(db, user_id=current_user.id, req=req)
    return ApiResponse(
        success=True,
        message="Brand profile saved successfully",
        data=BrandProfileResponse.model_validate(profile),
    )
