from typing import Any

from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: str = "GENERIC_ERROR",
        details: Any | None = None,
    ):
        super().__init__(status_code=status_code, detail=message)
        self.message = message
        self.error_code = error_code
        self.details = details


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Invalid credentials or unauthorized access"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message,
            error_code="UNAUTHORIZED",
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "You do not have permission to access this resource"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message,
            error_code="FORBIDDEN_ACCESS",
        )


class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource", message: str | None = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=message or f"{resource} not found",
            error_code="NOT_FOUND",
        )


class BadRequestException(AppException):
    def __init__(self, message: str, error_code: str = "BAD_REQUEST"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=message,
            error_code=error_code,
        )


class ConflictException(AppException):
    def __init__(self, message: str, error_code: str = "RESOURCE_CONFLICT"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            message=message,
            error_code=error_code,
        )


class AIGenerationException(AppException):
    def __init__(
        self,
        message: str = "Unable to generate marketing content",
        details: Any | None = None,
    ):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            message=message,
            error_code="AI_GENERATION_ERROR",
            details=details,
        )
