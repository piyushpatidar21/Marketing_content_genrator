def build_image_prompt_guidance(platform: str) -> str:
    aspect_ratios = {
        "instagram": "1:1 square or 4:5 vertical portrait for feed, 9:16 vertical for Stories/Reels",
        "facebook": "1.91:1 landscape (1200x630) or 1:1 square",
        "youtube": "16:9 landscape (1280x720) high-contrast thumbnail",
        "linkedin": "1.91:1 landscape or 1:1 square",
        "twitter": "16:9 landscape (1200x675)",
        "blog": "16:9 landscape hero banner (1200x675)",
        "email": "600px wide header banner",
    }

    ar = aspect_ratios.get(platform.lower(), "1:1 square or 16:9 landscape")

    return f"""
=== MEDIA PROMPT REQUIREMENTS: IMAGE ===
You must generate a production-ready, highly detailed image generation prompt suitable for Midjourney v6 / DALL-E 3 / Flux.1.
Include the following aspects in your visual prompt:
1. Subject & Focal Point: Clear description of main person, product, or central element.
2. Environment & Background: Specific location, indoor/outdoor backdrop, depth of field blur (bokeh).
3. Composition & Framing: Camera shot (close-up, eye-level, wide angle, macro), rule of thirds.
4. Lighting & Mood: Cinematic golden hour, soft studio softbox, neon cyberpunk, or clean commercial daylight.
5. Color Palette & Styling: Dominant hues, complementary tones, high-end editorial textures.
6. Product / Brand Placement: How the product is showcased naturally without looking artificial.
7. Recommended Aspect Ratio for {platform.title()}: {ar}
8. Rendering Quality Flags: Photorealistic, 8k resolution, award-winning commercial photography, shot on 85mm f/1.4 lens.
"""
