from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import ConflictException
from app.db.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.user import UserResponse, UserUpdateRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=ApiResponse[UserResponse])
def get_user_profile(current_user: User = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        message="Profile fetched",
        data=UserResponse.model_validate(current_user),
    )


@router.put("/me", response_model=ApiResponse[UserResponse])
def update_user_profile(
    req: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.name:
        current_user.name = req.name.strip()
    if req.email:
        new_email = req.email.lower().strip()
        if new_email != current_user.email:
            existing = AuthService.get_user_by_email(db, new_email)
            if existing and existing.id != current_user.id:
                raise ConflictException("Email is already registered to another account")
            current_user.email = new_email
    db.commit()
    db.refresh(current_user)
    return ApiResponse(
        success=True,
        message="Profile updated",
        data=UserResponse.model_validate(current_user),
    )
