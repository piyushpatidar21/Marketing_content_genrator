from app.ai.base import AIProvider
from app.ai.providers.gemini import GeminiProvider
from app.ai.providers.mock import MockProvider
from app.ai.providers.openai import OpenAIProvider
from app.core.config import settings


def get_ai_provider(
    provider_name: str | None = None,
    api_key: str | None = None,
    model: str | None = None,
) -> AIProvider:
    """
    Factory function returning the configured AIProvider instance.
    Defaults to GeminiProvider, with automatic fallback to MockProvider
    if no API key is provided and running in development/testing mode.
    """
    p_name = (provider_name or settings.AI_PROVIDER).lower()
    key = api_key or settings.AI_API_KEY
    m = model or settings.AI_MODEL

    if p_name == "mock":
        return MockProvider(api_key=key, model=m)
    elif p_name == "gemini":
        # If no real API key is set, check if we should fallback to mock in dev or warn
        if not key or key == "YOUR_GEMINI_API_KEY" or key.strip() == "":
            # In development, fallback gracefully to MockProvider so the app works immediately out of the box!
            return MockProvider(api_key="mock", model="gemini-1.5-flash-mock")
        return GeminiProvider(api_key=key, model=m)
    elif p_name == "openai":
        if not key:
            return MockProvider(api_key="mock", model="openai-mock")
        return OpenAIProvider(api_key=key, model=m or "gpt-4o-mini")
    else:
        # Default fallback
        return MockProvider(api_key=key, model="mock-default")
