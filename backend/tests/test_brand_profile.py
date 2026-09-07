def test_brand_profile_lifecycle(client, auth_headers):
    # 1. Initially brand profile may be empty
    get_init = client.get("/api/v1/brand-profile", headers=auth_headers)
    assert get_init.status_code == 200

    # 2. Save brand profile
    save_resp = client.post(
        "/api/v1/brand-profile",
        headers=auth_headers,
        json={
            "brand_name": "Apex Performance Co",
            "description": "High end fitness nutrition for busy achievers",
            "industry": "Health & Fitness",
            "target_audience": "Working professionals 25-45",
            "brand_voice": "Authoritative, inspiring, clean",
            "preferred_tone": "Energetic",
            "products_services": "Organic protein powders, zero-sugar energy bars",
            "brand_values": "Purity, science-backed efficacy, transparency",
            "default_cta": "Fuel your next breakthrough",
            "forbidden_words": ["miracle cure", "instant weight loss", "magic pill"],
            "preferred_language": "English",
        },
    )
    assert save_resp.status_code == 200
    data = save_resp.json()["data"]
    assert data["brand_name"] == "Apex Performance Co"
    assert len(data["forbidden_words"]) == 3

    # 3. Retrieve saved brand profile
    get_saved = client.get("/api/v1/brand-profile", headers=auth_headers)
    assert get_saved.status_code == 200
    assert get_saved.json()["data"]["brand_name"] == "Apex Performance Co"
