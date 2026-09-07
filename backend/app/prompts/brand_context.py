from typing import Any


def build_brand_context(brand_profile: dict[str, Any] | None) -> str:
    """Build brand context prompt block from brand profile dict."""
    if not brand_profile:
        return "BRAND PROFILE: No saved brand profile provided. Rely on campaign specifics.\n"

    brand_name = brand_profile.get("brand_name", "")
    description = brand_profile.get("description", "")
    industry = brand_profile.get("industry", "")
    target_audience = brand_profile.get("target_audience", "")
    brand_voice = brand_profile.get("brand_voice", "")
    preferred_tone = brand_profile.get("preferred_tone", "")
    products_services = brand_profile.get("products_services", "")
    brand_values = brand_profile.get("brand_values", "")
    default_cta = brand_profile.get("default_cta", "")
    forbidden_words = brand_profile.get("forbidden_words", [])

    lines = [
        "=== BRAND IDENTITY CONTEXT ===",
        f"Brand Name: {brand_name}",
    ]
    if description:
        lines.append(f"Brand Description: {description}")
    if industry:
        lines.append(f"Industry: {industry}")
    if target_audience:
        lines.append(f"Core Brand Audience: {target_audience}")
    if brand_voice:
        lines.append(f"Brand Voice: {brand_voice}")
    if preferred_tone:
        lines.append(f"Preferred Tone: {preferred_tone}")
    if products_services:
        lines.append(f"Flagship Products/Services: {products_services}")
    if brand_values:
        lines.append(f"Brand Values: {brand_values}")
    if default_cta:
        lines.append(f"Default Brand CTA: {default_cta}")
    if forbidden_words and len(forbidden_words) > 0:
        words_str = ", ".join(f'"{w}"' for w in forbidden_words)
        lines.append(f"STRICTLY FORBIDDEN WORDS / CLAIMS (DO NOT USE): {words_str}")

    lines.append("=== END BRAND IDENTITY CONTEXT ===\n")
    return "\n".join(lines)
