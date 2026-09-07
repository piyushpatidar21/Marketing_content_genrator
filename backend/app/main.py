import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import app.db.base  # Register models

# Import API routes
from app.api.routes.auth import router as auth_router
from app.api.routes.brand_profile import router as brand_router
from app.api.routes.campaigns import router as campaigns_router
from app.api.routes.generations import router as generations_router
from app.api.routes.health import router as health_router
from app.api.routes.platforms import router as platforms_router
from app.api.routes.users import router as users_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import logger
from app.db.seed import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist and seed demo user if not present
    try:
        seed_demo_data()
    except Exception as e:
        logger.warning(f"Could not auto-seed database: {e}")
    logger.info(f"Started {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production AI Marketing Content Generator SaaS API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def logging_and_timing_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()

    # Process request
    response = await call_next(request)

    duration_ms = int((time.time() - start_time) * 1000)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-MS"] = str(duration_ms)

    # Structured log
    if not request.url.path.endswith("/health"):
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)",
            extra={
                "request_id": request_id,
                "endpoint": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )
    return response


# Global Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "error_code": exc.error_code,
            "details": exc.details,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []))
        errors.append(
            {
                "field": field,
                "message": err.get("msg"),
                "type": err.get("type"),
            }
        )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "success": False,
            "message": "Input validation failed. Please check your form fields.",
            "error_code": "VALIDATION_ERROR",
            "details": errors,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error: {exc!s}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected internal server error occurred. Please try again later.",
            "error_code": "INTERNAL_SERVER_ERROR",
        },
    )


# Register API routers
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(users_router, prefix=api_prefix)
app.include_router(campaigns_router, prefix=api_prefix)
app.include_router(generations_router, prefix=api_prefix)
app.include_router(brand_router, prefix=api_prefix)
app.include_router(platforms_router, prefix=api_prefix)
app.include_router(health_router, prefix=api_prefix)

# Also expose health check at root /health
app.include_router(health_router)
