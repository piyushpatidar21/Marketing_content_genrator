def test_generation_pipeline_and_variations(client, auth_headers):
    # 1. Create a campaign
    camp_resp = client.post(
        "/api/v1/campaigns",
        headers=auth_headers,
        json={
            "name": "Choco Crunch Launch",
            "idea": "Launch artisan dark chocolate protein bar",
            "product_service": "ChocoCrunch Bar",
            "target_audience": "Busy professionals & fitness enthusiasts",
            "goal": "sales",
            "tone": "energetic",
            "cta": "Order your sample pack",
        },
    )
    campaign_id = camp_resp.json()["data"]["id"]

    # 2. Trigger multi-platform generation (Instagram + LinkedIn, Image + Text)
    gen_resp = client.post(
        "/api/v1/generations",
        headers=auth_headers,
        json={
            "campaign_id": campaign_id,
            "platforms": ["instagram", "linkedin"],
            "media_types": ["image", "text"],
        },
    )
    assert gen_resp.status_code == 201
    data = gen_resp.json()["data"]
    # 2 platforms = 2 comprehensive all-in-one deliverables
    assert data["total_generated"] == 2
    generations = data["generations"]
    assert len(generations) == 2

    first_gen = generations[0]
    gen_id = first_gen["id"]
    assert "hook" in first_gen["generated_content"]
    assert "caption" in first_gen["generated_content"]
    assert "cta" in first_gen["generated_content"]

    # 3. Retrieve single generation with variations
    get_gen = client.get(f"/api/v1/generations/{gen_id}", headers=auth_headers)
    assert get_gen.status_code == 200
    gen_details = get_gen.json()["data"]
    assert gen_details["id"] == gen_id
    assert len(gen_details["variations"]) > 0

    # 4. Favorite and Unfavorite
    fav_resp = client.post(f"/api/v1/generations/{gen_id}/favorite", headers=auth_headers)
    assert fav_resp.status_code == 200
    assert fav_resp.json()["data"]["is_favorite"] is True
    assert fav_resp.json()["data"]["campaign_name"] == "Choco Crunch Launch"

    # 5. Update generation content (In-place edit persistence)
    update_resp = client.put(
        f"/api/v1/generations/{gen_id}",
        headers=auth_headers,
        json={
            "generated_content": {
                "hook": "Custom Hand-Crafted Hook!",
                "caption": "Custom edited caption for social media",
                "cta": "Buy now",
            }
        },
    )
    assert update_resp.status_code == 200
    updated_data = update_resp.json()["data"]
    assert updated_data["generated_content"]["hook"] == "Custom Hand-Crafted Hook!"
    assert updated_data["campaign_name"] == "Choco Crunch Launch"

    # Verify persisted on re-fetch
    refetch = client.get(f"/api/v1/generations/{gen_id}", headers=auth_headers)
    assert refetch.status_code == 200
    assert refetch.json()["data"]["generated_content"]["hook"] == "Custom Hand-Crafted Hook!"

    # 6. Regenerate with modification instructions
    regen_resp = client.post(
        f"/api/v1/generations/{gen_id}/regenerate",
        headers=auth_headers,
        json={"modification_instruction": "Make it shorter and more punchy"},
    )
    assert regen_resp.status_code == 200
    assert regen_resp.json()["data"]["status"] == "completed"

    # 7. Dashboard Stats
    stats_resp = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()["data"]
    assert stats["total_campaigns"] >= 1
    assert stats["total_generations"] >= 2
    assert stats["total_favorites"] >= 1


def test_dedicated_media_generation_apis(client, auth_headers):
    # 1. Test Text Generation API
    text_resp = client.post(
        "/api/v1/generations/text",
        headers=auth_headers,
        json={
            "platforms": ["twitter", "linkedin"],
            "topic_or_idea": "SaaS productivity tools for remote engineers",
            "tone": "sharp and insightful",
        },
    )
    assert text_resp.status_code == 201
    text_data = text_resp.json()["data"]
    assert text_data["total_generated"] == 2
    for g in text_data["generations"]:
        assert g["media_type"] == "text"
        assert "hook" in g["generated_content"]
        assert "caption" in g["generated_content"]

    # 2. Test Image Generation API
    image_resp = client.post(
        "/api/v1/generations/image",
        headers=auth_headers,
        json={
            "platforms": ["instagram"],
            "prompt_topic": "Modern ergonomic mechanical keyboard on oak desk",
            "style": "Photorealistic commercial photography",
            "aspect_ratio": "1:1",
        },
    )
    assert image_resp.status_code == 201
    image_data = image_resp.json()["data"]
    assert image_data["total_generated"] == 1
    img_gen = image_data["generations"][0]
    assert img_gen["media_type"] == "image"
    assert "media_prompt" in img_gen["generated_content"]

    # 3. Test Video Generation API
    video_resp = client.post(
        "/api/v1/generations/video",
        headers=auth_headers,
        json={
            "platforms": ["youtube"],
            "video_concept": "10x coding efficiency with AI workflow",
            "target_duration": "45s",
            "video_style": "High-energy tech demo",
        },
    )
    assert video_resp.status_code == 201
    video_data = video_resp.json()["data"]
    assert video_data["total_generated"] == 1
    vid_gen = video_data["generations"][0]
    assert vid_gen["media_type"] == "video"
    assert "video_script" in vid_gen["generated_content"]

    # 4. Test Audio Generation API
    audio_resp = client.post(
        "/api/v1/generations/audio",
        headers=auth_headers,
        json={
            "platforms": ["podcast"],
            "audio_concept": "Deep dive into next-generation developer tooling",
            "voice_profile": "Warm, conversational 30s host",
            "pacing": "Moderate 140 WPM",
        },
    )
    assert audio_resp.status_code == 201
    audio_data = audio_resp.json()["data"]
    assert audio_data["total_generated"] == 1
    aud_gen = audio_data["generations"][0]
    assert aud_gen["media_type"] == "audio"
    assert "audio_script" in aud_gen["generated_content"]

    # 5. Test Dedicated GET List Endpoints
    list_text = client.get("/api/v1/generations/text", headers=auth_headers)
    assert list_text.status_code == 200
    assert len(list_text.json()["data"]) >= 2
    for item in list_text.json()["data"]:
        assert item["media_type"] == "text"

    list_image = client.get("/api/v1/generations/image", headers=auth_headers)
    assert list_image.status_code == 200
    assert len(list_image.json()["data"]) >= 1
    for item in list_image.json()["data"]:
        assert item["media_type"] == "image"

    list_video = client.get("/api/v1/generations/video", headers=auth_headers)
    assert list_video.status_code == 200
    assert len(list_video.json()["data"]) >= 1
    for item in list_video.json()["data"]:
        assert item["media_type"] == "video"

    list_audio = client.get("/api/v1/generations/audio", headers=auth_headers)
    assert list_audio.status_code == 200
    assert len(list_audio.json()["data"]) >= 1
    for item in list_audio.json()["data"]:
        assert item["media_type"] == "audio"

