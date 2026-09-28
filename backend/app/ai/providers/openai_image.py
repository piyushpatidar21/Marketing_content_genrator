import json
import re
import time
from typing import Any
from urllib.parse import quote_plus

import httpx
from pydantic import BaseModel

from app.ai.base import AIProvider, AIResponse
from app.core.exceptions import AIGenerationException
from app.core.logging import logger


class OpenAIImageProvider(AIProvider):
    """
    Dedicated OpenAI Image Generation Provider (gpt-image-1 / DALL-E 3).
    Calls OpenAI's /v1/images/generations endpoint to produce photorealistic marketing assets.
    """

    def __init__(self, api_key: str | None = None, model: str | None = None):
        super().__init__(api_key=api_key, model=model or "gpt-image-1")
        self.endpoint_url = "https://api.openai.com/v1/images/generations"

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: type[BaseModel] | None = None,
    ) -> AIResponse:
        start_time = time.time()

        # Extract platform and visual subject from prompt
        platform = self._extract_platform(prompt)
        visual_prompt = self._extract_visual_prompt(prompt, platform)

        # Map model name: OpenAI images endpoint natively expects dall-e-3 or dall-e-2
        api_model = "dall-e-3"
        if self.model and ("dall-e-2" in self.model.lower()):
            api_model = "dall-e-2"

        # Check if we have a live API key
        if self.api_key and self.api_key.strip() and not self.api_key.startswith("your_"):
            try:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": api_model,
                    "prompt": visual_prompt[:1000],
                    "n": 1,
                    "size": "1024x1024",
                    "quality": "standard",
                    "response_format": "url",
                }

                async with httpx.AsyncClient(timeout=90.0) as client:
                    resp = await client.post(self.endpoint_url, headers=headers, json=payload)

                if resp.status_code == 200:
                    data = resp.json()
                    item = data["data"][0]
                    image_url = item.get("url")
                    revised = item.get("revised_prompt", visual_prompt)

                    gen_time = int((time.time() - start_time) * 1000)
                    content = {
                        "title": f"{platform.title()} Visual Asset",
                        "hook": f"AI visual generated for {platform.title()} via OpenAI {self.model}",
                        "caption": f"Engineered visual asset for {platform.title()} marketing campaign.",
                        "media_prompt": revised,
                        "image_url": image_url,
                        "image_prompt_details": {
                            "subject": visual_prompt[:150],
                            "revised_prompt": revised,
                            "aspect_ratio": "1:1",
                            "model": self.model,
                            "quality": "standard",
                        },
                        "ai_provider_used": f"OpenAI ({self.model})",
                        "cta": "Explore product details",
                        "hashtags": [f"#{platform}", "#visualmarketing", "#creativeai"],
                        "variations": [
                            f"Alternative Lighting: {visual_prompt} with dramatic rim backlight",
                            f"Alternative Composition: {visual_prompt} shot on 85mm macro lens",
                        ],
                    }

                    return AIResponse(
                        content=content,
                        raw_text=json.dumps(content),
                        model=f"openai-{self.model}",
                        generation_time_ms=gen_time,
                        estimated_cost=0.040,  # Standard DALL-E 3 1024x1024 cost
                    )
                else:
                    logger.warning(f"OpenAI Image API returned status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.exception(f"OpenAI Image generation encountered error: {e!s}")

        # Fallback / Offline Mock Mode: returns realistic prompt with instant preview URL
        gen_time = int((time.time() - start_time) * 1000)
        preview_url = f"https://image.pollinations.ai/prompt/{quote_plus(visual_prompt[:250])}?width=1024&height=1024&nologo=true"

        content = {
            "title": f"{platform.title()} Visual Asset (Prompt Ready)",
            "hook": f"Production-grade image prompt crafted for OpenAI {self.model}",
            "caption": f"Professional commercial photography engineered for {platform.title()}.",
            "media_prompt": visual_prompt,
            "image_url": preview_url,
            "image_prompt_details": {
                "subject": visual_prompt[:120],
                "environment": "High-end commercial photography studio",
                "lighting": "Cinematic softbox key light with warm golden rim accent",
                "aspect_ratio": "1:1",
                "model": self.model,
                "negative_prompt": "blurry, low quality, oversaturated, distorted, watermark",
            },
            "ai_provider_used": f"OpenAI ({self.model}) [Simulated Preview - add API Key for native generation]",
            "cta": "Claim exclusive offer",
            "hashtags": [f"#{platform}", "#design", "#visualcontent"],
            "variations": [
                f"Minimalist Aesthetic: {visual_prompt} on clean matte white background",
                f"Cinematic Moody: {visual_prompt} with dramatic golden hour lighting",
            ],
        }

        return AIResponse(
            content=content,
            raw_text=json.dumps(content),
            model=f"openai-{self.model}-simulated",
            generation_time_ms=gen_time,
            estimated_cost=0.0,
        )

    def _extract_platform(self, prompt: str) -> str:
        for p in ["instagram", "facebook", "youtube", "linkedin", "twitter", "blog", "email", "sms"]:
            if f"PLATFORM RULES: {p.upper()}" in prompt or f"for {p}" in prompt.lower():
                return p
        return "instagram"

    def _extract_visual_prompt(self, prompt: str, platform: str) -> str:
        product = "Premium Brand Product"
        if "Product / Service:" in prompt:
            line = next((s for s in prompt.splitlines() if "Product / Service:" in s), "")
            if line:
                product = line.split(":", 1)[1].strip()

        idea = "high-performance innovation"
        if "Core Campaign Idea:" in prompt:
            line = next((s for s in prompt.splitlines() if "Core Campaign Idea:" in s), "")
            if line:
                idea = line.split(":", 1)[1].strip()

        return (
            f"Award-winning commercial product photography of {product}, highlighting {idea}. "
            f"Engineered for {platform.title()} ad campaign. Clean minimalist luxury composition, "
            f"cinematic studio softbox lighting, warm golden rim accents, crisp focus on 85mm f/1.4 lens, 8k resolution."
        )
