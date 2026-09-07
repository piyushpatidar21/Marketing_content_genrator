from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest
from app.schemas.common import ApiResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=ApiResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    user = AuthService.register_user(db, req)
    return ApiResponse(
        success=True,
        message="User registered successfully",
        data=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=ApiResponse[TokenResponse])
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    auth_data = AuthService.authenticate_user(db, email=req.email, password=req.password)
    return ApiResponse(
        success=True,
        message="Login successful",
        data=TokenResponse(**auth_data),
    )


@router.get("/me", response_model=ApiResponse[UserResponse])
def get_me(current_user: User = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        message="User profile retrieved",
        data=UserResponse.model_validate(current_user),
    )
