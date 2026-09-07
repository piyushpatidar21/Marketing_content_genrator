from app.prompts.brand_context import build_brand_context
from app.prompts.content_prompt import build_content_generation_prompt
from app.prompts.platform_rules import get_platform_rules


def test_platform_rules_integrity():
    for platform_key in [
        "instagram",
        "tiktok",
        "facebook",
        "youtube",
        "linkedin",
        "twitter",
        "whatsapp",
        "sms",
        "email",
        "blog",
    ]:
        rules = get_platform_rules(platform_key)
        assert rules["id"] == platform_key
        assert "content_style" in rules
        assert "best_practices" in rules
        assert isinstance(rules["best_practices"], list)
        assert len(rules["best_practices"]) > 0


def test_tiktok_rules():
    rules = get_platform_rules("tiktok")
    assert rules["name"] == "TikTok"
    assert rules["includes_hashtags"] is True
    assert "video" in rules["supported_media"]


def test_sms_rules_no_hashtags():
    rules = get_platform_rules("sms")
    assert rules["includes_hashtags"] is False
    assert rules["char_limit"] == 160


def test_brand_context_forbidden_words():
    brand_profile = {
        "brand_name": "SolarTech",
        "forbidden_words": ["cheap", "free solar scam", "zero maintenance"],
    }
    context = build_brand_context(brand_profile)
    assert "SolarTech" in context
    assert "cheap" in context
    assert "STRICTLY FORBIDDEN WORDS" in context


def test_content_generation_prompt_composition():
    campaign_data = {
        "name": "Spring Launch",
        "idea": "Introduce AI marketing tool",
        "product_service": "MarketGenius",
        "target_audience": "Marketers & agency owners",
        "goal": "lead generation",
        "tone": "professional",
        "language": "English",
        "cta": "Start free trial",
    }
    prompt = build_content_generation_prompt(
        campaign_data=campaign_data,
        platform="linkedin",
        media_type="image",
        brand_profile={"brand_name": "MarketGenius Inc"},
        modification_instruction="Emphasize ROI metrics",
    )
    assert "MarketGenius Inc" in prompt
    assert "PLATFORM RULES: LINKEDIN" in prompt
    assert "MEDIA PROMPT REQUIREMENTS: IMAGE" in prompt
    assert "Emphasize ROI metrics" in prompt
    assert "REQUIRED JSON OUTPUT FORMAT" in prompt
