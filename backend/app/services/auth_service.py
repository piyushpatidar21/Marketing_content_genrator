from sqlalchemy.orm import Session

from app.core.exceptions import (
    ConflictException,
    UnauthorizedException,
)
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import UserRegisterRequest


class AuthService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email.lower()).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    @classmethod
    def register_user(cls, db: Session, req: UserRegisterRequest) -> User:
        existing = cls.get_user_by_email(db, req.email)
        if existing:
            raise ConflictException(
                message="An account with this email already exists",
                error_code="EMAIL_ALREADY_REGISTERED",
            )

        hashed_password = get_password_hash(req.password)
        new_user = User(
            name=req.name.strip(),
            email=req.email.lower().strip(),
            password_hash=hashed_password,
            is_active=True,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @classmethod
    def authenticate_user(cls, db: Session, email: str, password: str) -> dict:
        user = cls.get_user_by_email(db, email)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedException("Account is disabled. Please contact support.")

        token = create_access_token(subject=user.id)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
        }
