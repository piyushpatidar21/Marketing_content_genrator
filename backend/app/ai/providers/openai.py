import json
import re
import time
from typing import Any

import httpx
from pydantic import BaseModel

from app.ai.base import AIProvider, AIResponse
from app.core.exceptions import AIGenerationException
from app.core.logging import logger


class OpenAIProvider(AIProvider):
    """OpenAI Provider implementation (GPT-4o / GPT-4o-mini)."""

    def __init__(self, api_key: str | None = None, model: str | None = None):
        super().__init__(api_key=api_key, model=model or "gpt-4o-mini")
        self.base_url = "https://api.openai.com/v1/chat/completions"

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: type[BaseModel] | None = None,
    ) -> AIResponse:
        if not self.api_key:
            raise AIGenerationException("OpenAI API key not configured")

        start_time = time.time()
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.base_url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                )

            if response.status_code != 200:
                raise AIGenerationException(f"OpenAI error {response.status_code}: {response.text}")

            data = response.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed_content = self._extract_json(raw_text)

            usage = data.get("usage", {})
            input_tokens = usage.get("prompt_tokens", 0)
            output_tokens = usage.get("completion_tokens", 0)

            # GPT-4o-mini approx cost ($0.15/1M in, $0.60/1M out)
            cost = (input_tokens * 0.00000015) + (output_tokens * 0.0000006)
            generation_time_ms = int((time.time() - start_time) * 1000)

            return AIResponse(
                content=parsed_content,
                raw_text=raw_text,
                model=self.model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                generation_time_ms=generation_time_ms,
                estimated_cost=round(cost, 6),
            )
        except AIGenerationException:
            raise
        except Exception as e:
            logger.exception(f"OpenAI generation failure: {e!s}")
            raise AIGenerationException(f"OpenAI generation error: {e!s}") from e

    def _extract_json(self, raw_text: str) -> dict[str, Any]:
        """Extract and clean valid JSON from raw LLM output."""
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
            raise AIGenerationException(
                "Unable to parse OpenAI response into structured JSON format.",
                details={"raw_output": raw_text[:500]},
            ) from None
