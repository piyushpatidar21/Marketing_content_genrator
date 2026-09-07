from fastapi import APIRouter

from app.prompts.platform_rules import MEDIA_TYPES, PLATFORM_RULES
from app.schemas.common import ApiResponse
from app.schemas.platform import MediaTypeDetail, PlatformRuleDetail

router = APIRouter(tags=["Platforms & Media"])


@router.get("/platforms", response_model=ApiResponse[list[PlatformRuleDetail]])
def get_supported_platforms():
    platforms = [PlatformRuleDetail(**p) for p in PLATFORM_RULES.values()]
    return ApiResponse(
        success=True,
        message="Supported platforms retrieved",
        data=platforms,
    )


@router.get("/media-types", response_model=ApiResponse[list[MediaTypeDetail]])
def get_supported_media_types():
    media_types = [MediaTypeDetail(**m) for m in MEDIA_TYPES.values()]
    return ApiResponse(
        success=True,
        message="Supported media types retrieved",
        data=media_types,
    )
