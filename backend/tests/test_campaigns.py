def test_create_and_get_campaign(client, auth_headers):
    # 1. Create campaign
    create_resp = client.post(
        "/api/v1/campaigns",
        headers=auth_headers,
        json={
            "name": "Summer Fitness Blast",
            "idea": "Launch high-protein organic hydration drink",
            "product_service": "HydraPro Shake",
            "target_audience": "18-35 athletes and fitness enthusiasts",
            "goal": "sales",
            "tone": "energetic",
            "language": "English",
            "cta": "Get 20% off today",
        },
    )
    assert create_resp.status_code == 201
    campaign = create_resp.json()["data"]
    campaign_id = campaign["id"]
    assert campaign["name"] == "Summer Fitness Blast"
    assert campaign["product_service"] == "HydraPro Shake"

    # 2. Get campaign by ID
    get_resp = client.get(f"/api/v1/campaigns/{campaign_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["name"] == "Summer Fitness Blast"


def test_campaign_ownership_isolation(client, auth_headers, other_user_headers):
    # User 1 creates campaign
    create_resp = client.post(
        "/api/v1/campaigns",
        headers=auth_headers,
        json={
            "name": "User 1 Private Campaign",
            "idea": "Secret product launch",
            "product_service": "Classified Product",
            "target_audience": "Tech founders",
        },
    )
    campaign_id = create_resp.json()["data"]["id"]

    # User 2 tries to access User 1's campaign -> Must be 403 Forbidden
    forbidden_get = client.get(f"/api/v1/campaigns/{campaign_id}", headers=other_user_headers)
    assert forbidden_get.status_code == 403

    # User 2 tries to update User 1's campaign -> Must be 403
    forbidden_update = client.put(
        f"/api/v1/campaigns/{campaign_id}",
        headers=other_user_headers,
        json={"name": "Hacked Campaign"},
    )
    assert forbidden_update.status_code == 403

    # User 2 tries to delete User 1's campaign -> Must be 403
    forbidden_delete = client.delete(f"/api/v1/campaigns/{campaign_id}", headers=other_user_headers)
    assert forbidden_delete.status_code == 403


def test_update_and_delete_campaign(client, auth_headers):
    create_resp = client.post(
        "/api/v1/campaigns",
        headers=auth_headers,
        json={
            "name": "Old Name",
            "idea": "Initial idea",
            "product_service": "Product A",
            "target_audience": "Everyone",
        },
    )
    campaign_id = create_resp.json()["data"]["id"]

    # Update
    update_resp = client.put(
        f"/api/v1/campaigns/{campaign_id}",
        headers=auth_headers,
        json={"name": "Updated Campaign Name", "tone": "humorous"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["data"]["name"] == "Updated Campaign Name"
    assert update_resp.json()["data"]["tone"] == "humorous"

    # Delete
    del_resp = client.delete(f"/api/v1/campaigns/{campaign_id}", headers=auth_headers)
    assert del_resp.status_code == 200

    # Get after delete -> 404
    get_after = client.get(f"/api/v1/campaigns/{campaign_id}", headers=auth_headers)
    assert get_after.status_code == 404
