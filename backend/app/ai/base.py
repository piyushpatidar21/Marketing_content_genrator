from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class AIResponse:
    def __init__(
        self,
        content: dict[str, Any],
        raw_text: str,
        model: str,
        input_tokens: int = 0,
        output_tokens: int = 0,
        generation_time_ms: int = 0,
        estimated_cost: float = 0.0,
    ):
        self.content = content
        self.raw_text = raw_text
        self.model = model
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens
        self.generation_time_ms = generation_time_ms
        self.estimated_cost = estimated_cost


class AIProvider(ABC):
    """Abstract Base Class for AI Model Providers."""

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key
        self.model = model

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: type[BaseModel] | None = None,
    ) -> AIResponse:
        """
        Generate structured JSON output from the AI model.
        Must return an AIResponse containing parsed dictionary content and metrics.
        """
