import base64
import json
import time
from typing import Any

import httpx
from pydantic import BaseModel

from app.ai.base import AIProvider, AIResponse
from app.core.logging import logger


class ElevenLabsAudioProvider(AIProvider):
    """
    Dedicated ElevenLabs Audio & Voiceover Provider.
    Generates natural, human-grade voice narration and spoken commercials
    via ElevenLabs Text-to-Speech API.
    """

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        voice_id: str | None = None,
    ):
        super().__init__(api_key=api_key, model=model or "eleven_multilingual_v2")
        self.voice_id = voice_id or "21m00Tcm4TlvDq8ikWAM"  # Default: Rachel
        self.base_url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: type[BaseModel] | None = None,
    ) -> AIResponse:
        start_time = time.time()
        platform = self._extract_platform(prompt)
        voiceover_text, voice_profile, pacing = self._extract_voiceover_details(prompt)

        audio_data_uri = None
        cost = 0.0

        # Attempt live ElevenLabs TTS call if API key is present
        if self.api_key and self.api_key.strip() and not self.api_key.startswith("your_"):
            try:
                headers = {
                    "xi-api-key": self.api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg",
                }
                payload = {
                    "text": voiceover_text,
                    "model_id": self.model or "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                        "style": 0.15,
                        "use_speaker_boost": True,
                    },
                }

                async with httpx.AsyncClient(timeout=60.0) as client:
                    resp = await client.post(self.base_url, headers=headers, json=payload)

                if resp.status_code == 200:
                    audio_bytes = resp.content
                    b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
                    audio_data_uri = f"data:audio/mp3;base64,{b64_audio}"
                    # Approx 300 characters ~ $0.003
                    cost = round(len(voiceover_text) * 0.00003, 5)
                else:
                    logger.warning(f"ElevenLabs API returned status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.exception(f"ElevenLabs TTS generation failed: {e!s}")

        gen_time = int((time.time() - start_time) * 1000)

        content = {
            "title": f"{platform.title()} Voiceover Narration",
            "hook": voiceover_text.split(".")[0] if "." in voiceover_text else voiceover_text[:60],
            "caption": f"Engineered audio commercial for {platform.title()}.",
            "audio_url": audio_data_uri,
            "audio_base64": audio_data_uri,
            "audio_script": {
                "voiceover_text": voiceover_text,
                "voice_profile": voice_profile,
                "pacing": pacing,
                "voice_id": self.voice_id,
                "model": self.model,
                "bgm_direction": "Subtle acoustic electronic groove with smooth swell under closing CTA",
                "sound_effects": [
                    "0:02 - Clean chime punctuation",
                    "0:08 - Subtle riser sweep into value proposition",
                    "0:15 - Low end bass warmth on closing call to action",
                ],
            },
            "ai_provider_used": (
                f"ElevenLabs ({self.model})"
                if audio_data_uri
                else f"ElevenLabs ({self.model}) [Script Ready - add API Key for native TTS audio]"
            ),
            "cta": "Listen and take action today",
            "hashtags": [f"#{platform}", "#audioad", "#voiceover", "#marketing"],
            "variations": [
                f"Energetic Radio Cut: {voiceover_text} (Paced at 160 WPM for maximum urgency)",
                f"Conversational Podcast Tone: {voiceover_text} (Relaxed 130 WPM with thoughtful pauses)",
            ],
        }

        return AIResponse(
            content=content,
            raw_text=json.dumps(content),
            model=f"elevenlabs-{self.model}",
            generation_time_ms=gen_time,
            estimated_cost=cost,
        )

    def _extract_platform(self, prompt: str) -> str:
        for p in ["podcast", "youtube", "tiktok", "instagram", "radio", "spotify"]:
            if f"PLATFORM RULES: {p.upper()}" in prompt or f"for {p}" in prompt.lower():
                return p
        return "podcast"

    def _extract_voiceover_details(self, prompt: str) -> tuple[str, str, str]:
        product = "our premium solution"
        if "Product / Service:" in prompt:
            line = next((s for s in prompt.splitlines() if "Product / Service:" in s), "")
            if line:
                product = line.split(":", 1)[1].strip()

        idea = "take your results to the next level"
        if "Core Campaign Idea:" in prompt:
            line = next((s for s in prompt.splitlines() if "Core Campaign Idea:" in s), "")
            if line:
                idea = line.split(":", 1)[1].strip()

        voiceover = (
            f"Are you tired of settling for average? "
            f"Introducing {product}. Engineered from the ground up to {idea}. "
            f"No fluff, zero compromise—just pure performance when it matters most. "
            f"Visit our website today and claim your exclusive starter offer."
        )

        voice_profile = "Warm, confident 28-38 year old narrator with clear authoritative diction"
        pacing = "Moderate 140 WPM with natural 0.4s breathing pauses"

        return voiceover, voice_profile, pacing
