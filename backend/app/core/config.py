from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "AI Marketing Content Generator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./marketing_planner.db"

    # JWT Auth
    JWT_SECRET: str = "insecure_dev_jwt_secret_key_change_in_production_123456789"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # AI Settings (General & Fallback)
    AI_PROVIDER: str = "gemini"  # gemini, openai, claude, mock
    AI_API_KEY: str | None = None
    AI_MODEL: str = "gemini-2.5-flash"
    AI_TIMEOUT_SECONDS: int = 60

    # 1. Text AI Settings (Gemini / OpenAI)
    TEXT_AI_PROVIDER: str = "gemini"
    TEXT_AI_API_KEY: str | None = None
    TEXT_AI_MODEL: str = "gemini-2.5-flash"

    # 2. Image AI Settings (OpenAI gpt-image-1 / DALL-E 3)
    IMAGE_AI_PROVIDER: str = "openai"
    IMAGE_AI_API_KEY: str | None = None
    IMAGE_AI_MODEL: str = "gpt-image-1"

    # 3. Audio AI Settings (ElevenLabs)
    AUDIO_AI_PROVIDER: str = "elevenlabs"
    AUDIO_AI_API_KEY: str | None = None
    AUDIO_AI_MODEL: str = "eleven_multilingual_v2"
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"

    # 4. Video AI Settings (Runway / Veo)
    VIDEO_AI_PROVIDER: str = "runway"  # runway or veo
    VIDEO_AI_API_KEY: str | None = None
    VIDEO_AI_MODEL: str = "gen3a_turbo"


    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()
