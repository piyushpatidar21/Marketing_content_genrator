from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User
from app.services.auth_service import AuthService

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Validate bearer token and retrieve authenticated user."""
    if not credentials:
        raise UnauthorizedException("Authentication token required")

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token")

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token claims")

    user = AuthService.get_user_by_id(db, user_id=user_id)
    if not user:
        raise UnauthorizedException("User account not found")

    if not user.is_active:
        raise UnauthorizedException("User account is inactive")

    return user
