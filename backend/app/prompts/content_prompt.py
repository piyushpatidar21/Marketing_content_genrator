from typing import Any

from app.prompts.audio_prompt import build_audio_prompt_guidance
from app.prompts.brand_context import build_brand_context
from app.prompts.image_prompt import build_image_prompt_guidance
from app.prompts.platform_rules import get_platform_rules
from app.prompts.video_prompt import build_video_prompt_guidance


def build_system_prompt() -> str:
    return """You are a World-Class AI Marketing Director, Copywriting Strategist, and Creative Campaign Architect.
Your goal is to generate platform-native, high-converting, tailored marketing content for specific digital channels.

SAFETY & COMPLIANCE RULES:
1. NEVER invent unstated factual, medical, financial, or legal claims about products.
2. Avoid exaggerated spammy clickbait; use authentic curiosity and value.
3. Adhere strictly to any brand restrictions and forbidden words list provided.
4. Adapt strictly to the requested tone, language, and platform constraints.
5. Produce strictly valid JSON matching the exact schema requested. Do not include markdown code block ticks (```json) or outside conversational chatter.
"""


def build_content_generation_prompt(
    campaign_data: dict[str, Any],
    platform: str,
    media_type: str,
    brand_profile: dict[str, Any] | None = None,
    modification_instruction: str | None = None,
    custom_instructions: str | None = None,
) -> str:
    platform_info = get_platform_rules(platform)
    brand_context_str = build_brand_context(brand_profile)

    # Dynamic media guidance based on user selection
    media_guidance_parts = []
    if any(m in media_type for m in ["image", "all-in-one", "all", "complete"]):
        media_guidance_parts.append(build_image_prompt_guidance(platform))
    if any(m in media_type for m in ["video", "all-in-one", "all", "complete"]):
        media_guidance_parts.append(build_video_prompt_guidance(platform))
    if any(m in media_type for m in ["audio", "all-in-one", "all", "complete"]):
        media_guidance_parts.append(build_audio_prompt_guidance(platform))

    media_guidance = "\n".join(media_guidance_parts)

    # Campaign context block
    campaign_context = f"""
=== CAMPAIGN CONTEXT ===
- Campaign Name: {campaign_data.get("name", "N/A")}
- Product / Service: {campaign_data.get("product_service", "N/A")}
- Core Campaign Idea: {campaign_data.get("idea", "N/A")}
- Target Audience: {campaign_data.get("target_audience", "N/A")}
- Age Demographic: {campaign_data.get("age_group") or "General"}
- Geographic Location: {campaign_data.get("location") or "Global"}
- Audience Interests: {campaign_data.get("interests") or "N/A"}
- Audience Pain Points: {campaign_data.get("pain_points") or "N/A"}
- Marketing Goal: {campaign_data.get("goal", "brand awareness")}
- Desired Tone: {campaign_data.get("tone", "energetic")}
- Target Output Language: {campaign_data.get("language", "English")}
- Key Selling Points: {campaign_data.get("key_points") or "N/A"}
- Specific Call To Action: {campaign_data.get("cta") or "N/A"}
- Focus Keywords: {campaign_data.get("keywords") or "N/A"}
- Hashtag Preferences: {campaign_data.get("hashtag_preference") or "N/A"}
- Additional Campaign Instructions: {campaign_data.get("additional_instructions") or "N/A"}
"""

    # Platform rules block
    platform_rules_block = (
        f"""
=== PLATFORM RULES: {platform_info["name"].upper()} ===
- Platform Description: {platform_info["description"]}
- Character Limit: {platform_info.get("char_limit", "Standard")}
- Include Hashtags: {platform_info["includes_hashtags"]} (Target count: {platform_info["recommended_hashtags_count"]})
- Include Emojis: {platform_info["includes_emojis"]}
- Native Content Style: {platform_info["content_style"]}
- Best Practices:
  * """
        + "\n  * ".join(platform_info["best_practices"])
        + f"""
- Required Deliverable: {platform_info["output_requirements"]}
"""
    )

    # Dynamic modifications / extra instructions
    extra_instructions = ""
    if custom_instructions:
        extra_instructions += f"\n=== USER RUN INSTRUCTIONS ===\n{custom_instructions}\n"
    if modification_instruction:
        extra_instructions += f'\n=== REGENERATION MODIFICATION REQUEST ===\nIMPORTANT: Modify and refine the previous output according to: "{modification_instruction}"\n'

    # Schema definition
    output_schema_spec = f"""
=== REQUIRED JSON OUTPUT FORMAT ===
You must respond ONLY with a valid, parseable JSON object with these exact keys:
{{
  "title": "Compelling title/headline (or null if not applicable)",
  "hook": "Attention grabbing first line/hook tailored for {platform_info["name"]}",
  "caption": "Primary post caption / message text",
  "body": "Full body text (for long-form posts, blog articles, emails, etc. or null)",
  "cta": "Compelling call to action",
  "hashtags": ["list", "of", "hashtags", "without", "double", "hash"],
  "emojis": ["relevant", "emojis"],
  "twitter_thread": ["Tweet 1 text", "Tweet 2 text", "Tweet 3 text"] (or null if not twitter or not thread),
  "email_details": {{
      "subject_line": "Subject line under 50 chars",
      "preview_text": "Preview snippet",
      "greeting": "Greeting opening",
      "body_html_or_text": "Full email message body",
      "sign_off": "Sign-off signature",
      "cta_button_text": "Button CTA"
  }} (or null if not email),
  "blog_details": {{
      "seo_title": "Search optimized H1 title",
      "meta_description": "Meta description 150-160 chars",
      "introduction": "Introductory paragraphs",
      "sections": [
          {{"heading": "H2 Heading", "content": "Section deep dive content"}},
          {{"heading": "H2 Heading 2", "content": "Section deep dive content"}}
      ],
      "conclusion": "Final wrap up and takeaways",
      "cta": "Final article CTA"
  }} (or null if not blog),
  "sms_message": "Single concise SMS text under 160 characters with CTA link placeholder" (or null if not SMS),
  "media_prompt": "Detailed visual/production prompt for image/video/audio generator",
  "image_prompt_details": {{
      "subject": "Main visual subject",
      "environment": "Backdrop & setting",
      "composition": "Framing & angle",
      "lighting": "Lighting style",
      "color_palette": "Key color tones",
      "aspect_ratio": "Target aspect ratio",
      "negative_prompt": "Artifacts/elements to avoid"
  }} (or null if media_type is not image),
  "video_script": {{
      "concept": "Core video hook & story arc",
      "duration": "e.g. 30s",
      "scenes": [
          {{
              "scene_number": 1,
              "timestamp": "0:00 - 0:05",
              "visual": "Opening action",
              "camera": "Close-up slow push",
              "voiceover": "Spoken hook",
              "text_overlay": "Bold headline"
          }}
      ],
      "audio_direction": "Music style and sound effects cues",
      "end_cta": "Final call to action visual"
  }} (or null if media_type is not video),
  "audio_script": {{
      "voiceover_text": "Complete spoken transcript",
      "voice_profile": "e.g. Warm, energetic 20s female",
      "pacing": "Moderate 140 WPM",
      "bgm_direction": "Upbeat acoustic corporate groove",
      "sound_effects": ["Chime at 0:03", "Whoosh transition at 0:10"]
  }} (or null if media_type is not audio),
  "variations": [
      "Alternative Hook #1 / Angle",
      "Alternative Hook #2 / Angle",
      "Alternative Hook #3 / Angle"
  ]
}}
"""

    return f"""{brand_context_str}
{campaign_context}
{platform_rules_block}
{media_guidance}
{extra_instructions}
{output_schema_spec}
"""
