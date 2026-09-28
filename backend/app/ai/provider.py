from app.ai.base import AIProvider
from app.ai.providers.elevenlabs import ElevenLabsAudioProvider
from app.ai.providers.gemini import GeminiProvider
from app.ai.providers.mock import MockProvider
from app.ai.providers.openai import OpenAIProvider
from app.ai.providers.openai_image import OpenAIImageProvider
from app.ai.providers.video import VideoAIProvider
from app.core.config import settings


def get_text_ai_provider(
    provider_name: str | None = None,
    api_key: str | None = None,
    model: str | None = None,
) -> AIProvider:
    """
    Returns the configured Text/Copywriting AI provider (Gemini or OpenAI).
    Falls back gracefully to MockProvider if no API key is set.
    """
    p_name = (provider_name or settings.TEXT_AI_PROVIDER or settings.AI_PROVIDER).lower()
    key = api_key or settings.TEXT_AI_API_KEY or settings.AI_API_KEY
    m = model or settings.TEXT_AI_MODEL or settings.AI_MODEL

    if p_name == "mock":
        return MockProvider(api_key=key, model=m)
    elif p_name == "gemini":
        if not key or key.startswith("your_") or key.strip() == "":
            return MockProvider(api_key="mock", model="gemini-2.5-flash-mock")
        return GeminiProvider(api_key=key, model=m)
    elif p_name == "openai":
        if not key or key.startswith("your_") or key.strip() == "":
            return MockProvider(api_key="mock", model="gpt-4o-mock")
        return OpenAIProvider(api_key=key, model=m or "gpt-4o-mini")
    else:
        return MockProvider(api_key=key, model="mock-text")


def get_image_ai_provider(
    api_key: str | None = None,
    model: str | None = None,
) -> AIProvider:
    """
    Returns the dedicated Image Generation AI provider (OpenAI gpt-image-1 / DALL-E 3).
    """
    p_name = (settings.IMAGE_AI_PROVIDER or "openai").lower()
    key = api_key or settings.IMAGE_AI_API_KEY
    m = model or settings.IMAGE_AI_MODEL or "gpt-image-1"

    if p_name == "mock":
        return MockProvider(api_key=key, model=m)

    return OpenAIImageProvider(api_key=key, model=m)


def get_audio_ai_provider(
    api_key: str | None = None,
    model: str | None = None,
    voice_id: str | None = None,
) -> AIProvider:
    """
    Returns the dedicated Audio/Voiceover AI provider (ElevenLabs).
    """
    p_name = (settings.AUDIO_AI_PROVIDER or "elevenlabs").lower()
    key = api_key or settings.AUDIO_AI_API_KEY
    m = model or settings.AUDIO_AI_MODEL or "eleven_multilingual_v2"
    v_id = voice_id or settings.ELEVENLABS_VOICE_ID

    if p_name == "mock":
        return MockProvider(api_key=key, model=m)

    return ElevenLabsAudioProvider(api_key=key, model=m, voice_id=v_id)


def get_video_ai_provider(
    provider_type: str | None = None,
    api_key: str | None = None,
    model: str | None = None,
) -> AIProvider:
    """
    Returns the dedicated Video Generation AI provider (Runway Gen-3 or Google Veo).
    """
    p_type = (provider_type or settings.VIDEO_AI_PROVIDER or "runway").lower()
    key = api_key or settings.VIDEO_AI_API_KEY
    m = model or settings.VIDEO_AI_MODEL

    if p_type == "mock":
        return MockProvider(api_key=key, model=m or "mock-video")

    return VideoAIProvider(provider_type=p_type, api_key=key, model=m)


def get_ai_provider(
    media_type: str = "text",
    provider_name: str | None = None,
    api_key: str | None = None,
    model: str | None = None,
) -> AIProvider:
    """
    Multi-provider AI Factory:
    Dynamically routes generation requests to the best-in-class AI provider for each content type:
    - Text  -> Gemini / OpenAI
    - Image -> OpenAI (gpt-image-1 / DALL-E 3)
    - Audio -> ElevenLabs
    - Video -> Runway / Google Veo
    """
    m_type = media_type.lower()

    if m_type == "image":
        return get_image_ai_provider(api_key=api_key, model=model)
    elif m_type == "audio":
        return get_audio_ai_provider(api_key=api_key, model=model)
    elif m_type == "video":
        return get_video_ai_provider(provider_type=provider_name, api_key=api_key, model=model)
    else:
        return get_text_ai_provider(provider_name=provider_name, api_key=api_key, model=model)
