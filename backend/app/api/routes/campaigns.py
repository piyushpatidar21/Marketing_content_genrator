from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.campaign import (
    CampaignCreateRequest,
    CampaignListResponse,
    CampaignResponse,
    CampaignUpdateRequest,
)
from app.schemas.common import ApiResponse
from app.services.campaign_service import CampaignService

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post(
    "",
    response_model=ApiResponse[CampaignResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_campaign(
    req: CampaignCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaign = CampaignService.create_campaign(db, user_id=current_user.id, req=req)
    return ApiResponse(
        success=True,
        message="Campaign created successfully",
        data=CampaignResponse.model_validate(campaign),
    )


@router.get("", response_model=ApiResponse[CampaignListResponse])
def list_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total, items = CampaignService.list_campaigns(db, user_id=current_user.id, skip=skip, limit=limit, search=search)
    return ApiResponse(
        success=True,
        message="Campaigns retrieved",
        data=CampaignListResponse(
            total=total,
            items=[CampaignResponse(**item) for item in items],
        ),
    )


@router.get("/{campaign_id}", response_model=ApiResponse[CampaignResponse])
def get_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaign = CampaignService.get_campaign_by_id(db, campaign_id=campaign_id, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Campaign details retrieved",
        data=CampaignResponse.model_validate(campaign),
    )


@router.put("/{campaign_id}", response_model=ApiResponse[CampaignResponse])
def update_campaign(
    campaign_id: str,
    req: CampaignUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaign = CampaignService.update_campaign(db, campaign_id=campaign_id, user_id=current_user.id, req=req)
    return ApiResponse(
        success=True,
        message="Campaign updated successfully",
        data=CampaignResponse.model_validate(campaign),
    )


@router.delete("/{campaign_id}", response_model=ApiResponse[dict])
def delete_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    CampaignService.delete_campaign(db, campaign_id=campaign_id, user_id=current_user.id)
    return ApiResponse(
        success=True,
        message="Campaign deleted successfully",
        data={"id": campaign_id},
    )
