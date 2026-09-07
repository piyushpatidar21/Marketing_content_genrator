import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.db.database import Base, get_db
from app.main import app

# Override settings for testing
settings.ENVIRONMENT = "test"
settings.AI_PROVIDER = "mock"
settings.DATABASE_URL = "sqlite:///:memory:"

# In-memory test SQLite DB
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    # Register & login a test user
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Sarah Marketer",
            "email": "sarah@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "sarah@example.com", "password": "Password123!"},
    )
    token = login_resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def other_user_headers(client):
    # Register & login a second user for ownership tests
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Bob Creator",
            "email": "bob@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "bob@example.com", "password": "Password123!"},
    )
    token = login_resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
