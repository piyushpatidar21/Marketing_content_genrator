def test_register_user_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "jane@example.com"
    assert data["data"]["name"] == "Jane Doe"
    assert "password_hash" not in data["data"]


def test_register_duplicate_email_fails(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Jane Doe",
            "email": "duplicate@example.com",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
        },
    )
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Jane Copy",
            "email": "duplicate@example.com",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
        },
    )
    assert response.status_code == 409
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "EMAIL_ALREADY_REGISTERED"


def test_register_mismatched_passwords_fails(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Mismatch User",
            "email": "mismatch@example.com",
            "password": "Password123!",
            "confirm_password": "DifferentPassword123!",
        },
    )
    assert response.status_code == 422


def test_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Login User",
            "email": "login@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "Password123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"


def test_login_invalid_password_fails(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Login User 2",
            "email": "login2@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login2@example.com", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "UNAUTHORIZED"


def test_get_current_user_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "sarah@example.com"


def test_unauthorized_without_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_update_user_profile(client, auth_headers):
    # Update profile name
    update_res = client.put(
        "/api/v1/users/me",
        headers=auth_headers,
        json={"name": "Sarah Super Marketer"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["name"] == "Sarah Super Marketer"


def test_update_user_profile_duplicate_email_fails(client, auth_headers, other_user_headers):
    # other_user has email bob@example.com
    # Sarah attempts to update her email to bob@example.com
    update_res = client.put(
        "/api/v1/users/me",
        headers=auth_headers,
        json={"email": "bob@example.com"},
    )
    assert update_res.status_code == 409
    assert update_res.json()["success"] is False
    assert "already registered" in update_res.json()["message"]
