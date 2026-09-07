from typing import Any

from app.prompts.content_prompt import (
    build_content_generation_prompt,
    build_system_prompt,
)


class PromptService:
    @staticmethod
    def get_system_prompt() -> str:
        return build_system_prompt()

    @staticmethod
    def create_generation_prompt(
        campaign_data: dict[str, Any],
        platform: str,
        media_type: str,
        brand_profile: dict[str, Any] | None = None,
        modification_instruction: str | None = None,
        custom_instructions: str | None = None,
    ) -> str:
        return build_content_generation_prompt(
            campaign_data=campaign_data,
            platform=platform,
            media_type=media_type,
            brand_profile=brand_profile,
            modification_instruction=modification_instruction,
            custom_instructions=custom_instructions,
        )
