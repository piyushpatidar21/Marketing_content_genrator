import asyncio
import time

from pydantic import BaseModel

from app.ai.base import AIProvider, AIResponse


class MockProvider(AIProvider):
    """Mock AI Provider for development, automated testing, and offline demos."""

    def __init__(self, api_key: str | None = None, model: str | None = None):
        super().__init__(api_key=api_key or "mock-key", model=model or "mock-marketing-v1")

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str | None = None,
        response_schema: type[BaseModel] | None = None,
    ) -> AIResponse:
        start_time = time.time()
        # Simulate slight realistic AI latency (150ms)
        await asyncio.sleep(0.15)

        # Detect platform from prompt
        platform = "instagram"
        for p in [
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
            if f"PLATFORM RULES: {p.upper()}" in prompt or f"tailored for {p}" in prompt.lower():
                platform = p
                break

        # Detect media type from prompt
        media_type = "text"
        for m in ["image", "video", "audio", "text"]:
            if f"MEDIA PROMPT REQUIREMENTS: {m.upper()}" in prompt:
                media_type = m
                break

        # Extract campaign name / product from prompt
        product_name = "Premium Solution"
        if "Product / Service:" in prompt:
            try:
                line = next((s for s in prompt.splitlines() if "Product / Service:" in s), "")
                if line:
                    product_name = line.split(":", 1)[1].strip()
            except Exception:
                pass

        idea_snippet = "Transform your routine"
        if "Core Campaign Idea:" in prompt:
            try:
                line = next((s for s in prompt.splitlines() if "Core Campaign Idea:" in s), "")
                if line:
                    idea_snippet = line.split(":", 1)[1].strip()
            except Exception:
                pass

        # Build realistic platform-specific response
        title = f"Introducing {product_name}: {idea_snippet}"
        hook = f"Ready to level up your results with {product_name}? 🚀"
        caption = f"Stop settling for average. {idea_snippet}. Engineered for high performance, crafted for those who demand excellence."
        cta = "Claim your exclusive access today — Link in bio!"
        hashtags = [
            "#marketing",
            f"#{product_name.lower().replace(' ', '')}",
            "#innovation",
            "#growth",
            "#lifestyle",
        ]
        emojis = ["🔥", "🚀", "✨", "💡", "🎯"]

        twitter_thread = None
        email_details = None
        blog_details = None
        sms_message = None
        media_prompt = None
        image_prompt_details = None
        video_script = None
        audio_script = None

        if platform == "linkedin":
            hook = f"Why most strategies fail to scale (and how {product_name} changes the game):"
            caption = f"{hook}\n\n1. Outdated assumptions drain momentum.\n2. True efficiency begins when you align execution with clarity.\n\nHere is how {product_name} helps leaders drive measurable impact.\n\nWhat are your thoughts on this approach?"
            cta = "Connect or visit our website to explore the case study."
            hashtags = ["#Leadership", "#Innovation", "#GrowthStrategy", "#Business"]
            emojis = ["📈", "💼"]

        elif platform == "twitter":
            hook = f"99% of people struggle with this. Here is how {product_name} solves it in 3 steps 🧵👇"
            caption = hook
            twitter_thread = [
                f"1/ {hook}",
                f"2/ Step 1: Clarify the core obstacle. Most waste weeks guessing what {product_name} solves in minutes.",
                "3/ Step 2: Implement proven systems that eliminate manual friction.",
                f"4/ Step 3: Scale results seamlessly. {cta}",
            ]
            hashtags = ["#BuildInPublic", "#Productivity"]

        elif platform == "tiktok":
            hook = f"Wait... did you know about this {product_name} hack? 🤯"
            caption = f"{hook} {idea_snippet}. Stop doing this the hard way! #{product_name.lower().replace(' ', '')} #marketing #fyp #trend"
            cta = "Link in bio to test it out before it sells out!"
            hashtags = [
                "#fyp",
                "#viral",
                "#foryou",
                f"#{product_name.lower().replace(' ', '')}",
            ]
            emojis = ["🤯", "🔥", "⚡"]
            video_script = {
                "concept": f"Fast-paced viral pattern interrupt for {product_name}",
                "duration": "15s",
                "scenes": [
                    {
                        "scene_number": 1,
                        "timestamp": "0:00 - 0:03",
                        "visual": "Direct to camera candid reaction, holding product or showing screen",
                        "camera": "Handheld selfie style close-up",
                        "voiceover": "Stop scrolling if you care about your marketing.",
                        "text_overlay": "DON'T MISS THIS 🚨",
                    },
                    {
                        "scene_number": 2,
                        "timestamp": "0:03 - 0:10",
                        "visual": f"Rapid screen recording showing {product_name} in action",
                        "camera": "Quick zoom jump cuts",
                        "voiceover": f"This tool literally {idea_snippet} in seconds.",
                        "text_overlay": "RESULTS IN SECONDS ⚡",
                    },
                    {
                        "scene_number": 3,
                        "timestamp": "0:10 - 0:15",
                        "visual": "Final CTA pointer towards bio link",
                        "camera": "Punch in on CTA badge",
                        "voiceover": "Grab the link in my bio before the deal expires.",
                        "text_overlay": "LINK IN BIO 👆",
                    },
                ],
                "audio_direction": "Trending upbeat energetic lo-fi synth",
                "end_cta": "Tap link in bio!",
            }

        elif platform == "sms":
            hook = f"Exclusive Alert: {product_name} is here!"
            sms_message = f"Hi there! {idea_snippet}. Use code VIP20 for 20% off {product_name}. Order now: bit.ly/vip-deal. Reply STOP to opt out."
            caption = sms_message
            cta = "Order now at bit.ly/vip-deal"
            hashtags = []
            emojis = []

        elif platform == "email":
            hook = f"Inside: The secret behind {product_name}"
            email_details = {
                "subject_line": f"Unlock your potential with {product_name}",
                "preview_text": f"{idea_snippet} — special release inside!",
                "greeting": "Hi [First Name],",
                "body_html_or_text": f"We know how frustrating it is when progress stalls.\n\nThat's exactly why we developed {product_name}. {idea_snippet}.\n\nHere is what you get:\n• Instant clarity & streamlined workflows\n• Built-in optimization for peak output\n• Dedicated priority support\n\nReady to get started?",
                "sign_off": "Best regards,\nThe Team",
                "cta_button_text": "Explore Special Offer",
            }
            caption = email_details["body_html_or_text"]
            cta = email_details["cta_button_text"]
            hashtags = []

        elif platform == "blog":
            blog_details = {
                "seo_title": f"The Ultimate Guide to {product_name}: How to {idea_snippet}",
                "meta_description": f"Discover how {product_name} can revolutionize your workflow. In-depth analysis, actionable tips, and key strategies.",
                "introduction": f"In today's fast-moving environment, staying ahead requires modern tools and proven frameworks. Enter {product_name}.",
                "sections": [
                    {
                        "heading": "1. The Core Challenge Facing Creators",
                        "content": "Traditional approaches consume excessive time and yield inconsistent outcomes.",
                    },
                    {
                        "heading": f"2. Why {product_name} is a Game Changer",
                        "content": f"{idea_snippet}. By focusing on measurable impact, it accelerates execution tenfold.",
                    },
                    {
                        "heading": "3. Step-by-Step Implementation",
                        "content": "Begin with clear milestones, leverage built-in automation, and iterate quickly.",
                    },
                ],
                "conclusion": f"Embracing {product_name} provides the competitive edge needed to win.",
                "cta": f"Start your journey with {product_name} today.",
            }
            caption = blog_details["introduction"]
            cta = blog_details["cta"]
            hashtags = []

        elif platform == "youtube":
            title = f"How {product_name} Changed Everything ({idea_snippet})"
            hook = f"If you want to master {product_name} in 2026, watch this full breakdown."
            caption = f"In this video, we break down {product_name} and show how {idea_snippet}. Don't forget to Like and Subscribe!"
            video_script = {
                "concept": f"High-energy transformation showcase of {product_name}",
                "duration": "45s",
                "scenes": [
                    {
                        "scene_number": 1,
                        "timestamp": "0:00 - 0:05",
                        "visual": f"Dynamic close-up opening with {product_name} in sleek lighting",
                        "camera": "Rapid zoom-in",
                        "voiceover": f"What if you could {idea_snippet} in half the time?",
                        "text_overlay": f"THE {product_name.upper()} BREAKTHROUGH",
                    },
                    {
                        "scene_number": 2,
                        "timestamp": "0:05 - 0:20",
                        "visual": "Split screen comparison showing the old struggle vs new effortless process",
                        "camera": "Smooth horizontal tracking shot",
                        "voiceover": f"Most people struggle with unnecessary complexity. {product_name} fixes this directly.",
                        "text_overlay": "FASTER • SMARTER • BETTER",
                    },
                    {
                        "scene_number": 3,
                        "timestamp": "0:20 - 0:45",
                        "visual": "Customer celebrating success with modern product showcase",
                        "camera": "360 degree orbital rotation with shallow depth of field",
                        "voiceover": "Join thousands who already made the switch. Tap the link below to get started now.",
                        "text_overlay": "TAP LINK BELOW",
                    },
                ],
                "audio_direction": "Driving energetic future-bass beat, subtle swoosh sound effects at transitions",
                "end_cta": "Click link in description & Subscribe",
            }
            cta = "Subscribe and check the link in description!"
            hashtags = [f"#{product_name.replace(' ', '')}", "#Tutorial", "#Trending"]

        # Media prompts
        if media_type == "image" or platform in ["instagram", "facebook", "blog"]:
            media_prompt = f"Commercial studio photography of {product_name}, clean aesthetic background with soft warm lighting, 85mm portrait lens, 8k resolution, photorealistic, premium editorial styling --ar 1:1"
            image_prompt_details = {
                "subject": f"Modern presentation of {product_name}",
                "environment": "Minimalist luxury studio setting with architectural shadows",
                "composition": "Centered product framing, rule of thirds, shallow depth of field",
                "lighting": "Cinematic softbox key light with warm golden rim accent",
                "color_palette": "Deep slate navy, warm champagne gold, and crisp clean white",
                "aspect_ratio": "1:1",
                "negative_prompt": "blurry, low quality, oversaturated, distorted text, ugly artifacts",
            }

        if media_type == "audio":
            audio_script = {
                "voiceover_text": f"Are you ready for a breakthrough? {idea_snippet}. Introducing {product_name}. Built for those who demand more.",
                "voice_profile": "Warm, confident 25-35 year old voice with authoritative enthusiasm",
                "pacing": "140 words per minute with purposeful 0.5s pauses after rhetorical questions",
                "bgm_direction": "Subtle, modern acoustic guitar and ambient electronic pads building toward the CTA",
                "sound_effects": [
                    "Subtle acoustic chime at 0:02",
                    "Whoosh transition at 0:15",
                ],
            }

        variations = [
            f"Why {product_name} is turning heads in 2026",
            f"The 1 thing missing from your strategy: {product_name}",
            f"How {idea_snippet} without the headache",
        ]

        content = {
            "title": title,
            "hook": hook,
            "caption": caption,
            "body": caption,
            "cta": cta,
            "hashtags": hashtags,
            "emojis": emojis,
            "twitter_thread": twitter_thread,
            "email_details": email_details,
            "blog_details": blog_details,
            "sms_message": sms_message,
            "media_prompt": media_prompt,
            "image_prompt_details": image_prompt_details,
            "video_script": video_script,
            "audio_script": audio_script,
            "variations": variations,
        }

        generation_time_ms = int((time.time() - start_time) * 1000)

        return AIResponse(
            content=content,
            raw_text=str(content),
            model=self.model,
            input_tokens=320,
            output_tokens=480,
            generation_time_ms=generation_time_ms,
            estimated_cost=0.0001,
        )
