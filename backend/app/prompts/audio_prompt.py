def build_audio_prompt_guidance(platform: str) -> str:
    return """
=== MEDIA PROMPT REQUIREMENTS: AUDIO & VOICEOVER ===
You must generate a comprehensive audio / voiceover script and production brief.
Include:
1. Voiceover Script: Complete, naturally paced spoken script with pronunciation notes.
2. Voice Style & Tone: Accent, age profile, gender archetype (e.g., warm & confident, energetic & youthful, authoritative & calm).
3. Emotion & Pacing: Word-per-minute pace (e.g. 130-150 wpm), emphasis markers, pause durations [pause 0.5s].
4. Background Music (BGM) Direction: Instrument choices, acoustic vs electronic, build-up crescendo, volume dip under voice.
5. Sound Effects (SFX): Timed sound cues (whoosh, chime, notification ping, bass drop).
"""
