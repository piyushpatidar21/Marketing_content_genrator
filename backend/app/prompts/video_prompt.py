def build_video_prompt_guidance(platform: str) -> str:
    ratios = {
        "youtube": "16:9 widescreen horizontal (or 9:16 for YouTube Shorts)",
        "instagram": "9:16 vertical full screen for Reels/Stories",
        "facebook": "9:16 vertical or 4:5 portrait",
        "linkedin": "1:1 square or 16:9 landscape",
        "twitter": "16:9 or 1:1",
    }
    ratio = ratios.get(platform.lower(), "9:16 vertical / 16:9 horizontal")

    return f"""
=== MEDIA PROMPT REQUIREMENTS: VIDEO ===
You must generate a structured, scene-by-scene video production script and prompt.
Include:
1. Concept & Hook: The high-level creative idea and immediate 3-second retention opener.
2. Target Duration & Aspect Ratio: e.g., 30-60 seconds, {ratio}.
3. Scene Breakdown (3 to 5 distinct scenes):
   - Scene number & time stamp (e.g. 0:00 - 0:05)
   - Visual Action & Subject Movement
   - Camera Angle & Motion (pan, tilt, drone shot, zoom in)
   - Lighting & Ambience
   - On-screen Text Overlay / Lower thirds
   - Voiceover line or spoken dialogue
4. Sound Design & BGM: Music genre, BPM tempo, sound effects (SFX) cues.
5. End Screen CTA: Final frame graphics, clickable cue, subscribe/buy button callout.
"""
