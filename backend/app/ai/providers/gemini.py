import json
import re
import time
from typing import Any

import httpx
from pydantic import BaseModel

from app.ai.base import AIProvider, AIResponse
from app.core.exceptions import AIGenerationException
from app.core.logging import logger


class GeminiProvider(AIProvider):
    """Google Gemini AI Provider with robust structured JSON handling."""

    def __init__(self, api_key: str | None = None, model: str | None = None):
        super().__init__(api_key=api_key, model=model or "gemini-1.5-flash")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: type[BaseModel] | None = None,
    ) -> AIResponse:
        if not self.api_key or self.api_key == "YOUR_GEMINI_API_KEY":
            raise AIGenerationException(
                message="Google Gemini API key is not configured. Please set AI_API_KEY in your .env file or use AI_PROVIDER=mock for local testing.",
                details={"provider": "gemini"},
            )

        start_time = time.time()
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"

        # Construct payload
        contents = []
        if system_prompt:
            contents.append(
                {
                    "role": "user",
                    "parts": [{"text": f"System Guidelines:\n{system_prompt}"}],
                }
            )
            contents.append(
                {
                    "role": "model",
                    "parts": [
                        {"text": "Understood. I will strictly follow these guidelines and output only valid JSON."}
                    ],
                }
            )

        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload: dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.95,
                "topK": 40,
                "maxOutputTokens": 4096,
                "responseMimeType": "application/json",
            },
        }

        models_to_try = [self.model]
        if "flash" in self.model:
            for fallback in ["gemini-2.5-flash", "gemini-flash-latest"]:
                if fallback not in models_to_try:
                    models_to_try.append(fallback)

        last_error = None
        for current_model in models_to_try:
            url = f"{self.base_url}/{current_model}:generateContent?key={self.api_key}"

            for attempt in range(3):
                try:
                    async with httpx.AsyncClient(timeout=60.0) as client:
                        response = await client.post(
                            url,
                            json=payload,
                            headers={"Content-Type": "application/json"},
                        )

                    if response.status_code == 200:
                        data = response.json()
                        generation_time_ms = int((time.time() - start_time) * 1000)

                        # Extract content text
                        candidates = data.get("candidates", [])
                        if not candidates:
                            raise AIGenerationException("Gemini returned empty candidate response")

                        parts = candidates[0].get("content", {}).get("parts", [])
                        raw_text = "".join(part.get("text", "") for part in parts).strip()

                        # Parse JSON
                        parsed_content = self._extract_json(raw_text)

                        # Usage metadata
                        usage = data.get("usageMetadata", {})
                        input_tokens = usage.get("promptTokenCount", 0)
                        output_tokens = usage.get("candidatesTokenCount", 0)

                        # Gemini approx cost calculation
                        estimated_cost = (input_tokens * 0.000000075) + (output_tokens * 0.0000003)

                        return AIResponse(
                            content=parsed_content,
                            raw_text=raw_text,
                            model=current_model,
                            input_tokens=input_tokens,
                            output_tokens=output_tokens,
                            generation_time_ms=generation_time_ms,
                            estimated_cost=round(estimated_cost, 6),
                        )

                    error_body = response.text
                    logger.warning(
                        f"Gemini API attempt {attempt + 1}/3 for model '{current_model}' returned {response.status_code}: {error_body[:200]}"
                    )
                    last_error = f"Gemini API returned status {response.status_code}: {error_body[:200]}"

                    # If temporary 503 or 429, wait and retry
                    if response.status_code in (429, 503):
                        import asyncio

                        await asyncio.sleep(1.5 * (attempt + 1))
                        continue
                    else:
                        break  # Non-retryable error on this model, try next model

                except httpx.TimeoutException:
                    logger.warning(f"Gemini request timed out on attempt {attempt + 1}/3 for model '{current_model}'")
                    last_error = "Gemini request timed out"
                    import asyncio

                    await asyncio.sleep(1.0)
                except AIGenerationException:
                    raise
                except Exception as e:
                    logger.warning(f"Unexpected exception calling Gemini on attempt {attempt + 1}/3: {e!s}")
                    last_error = str(e)
                    import asyncio

                    await asyncio.sleep(1.0)

        raise AIGenerationException(
            message=f"Failed to generate content with Gemini after retries. Last error: {last_error}",
            details={"model": self.model, "last_error": last_error},
        )

    def _extract_json(self, raw_text: str) -> dict[str, Any]:
        """Extract and clean valid JSON from raw LLM output."""
        cleaned = raw_text.strip()
        # Strip markdown ```json code blocks if present
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback regex extraction of first JSON object
            match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
            raise AIGenerationException(
                "Unable to parse AI response into structured JSON format.",
                details={"raw_output": raw_text[:500]},
            ) from None
