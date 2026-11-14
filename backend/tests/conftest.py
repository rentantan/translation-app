import os

# テスト用の設定（アプリの import より先に設定する）
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only-0123456789")
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.rate_limit import login_failures, translate_limiter  # noqa: E402
from app.translator import get_translate_fn  # noqa: E402


async def fake_translate(text: str, dest: str, src: str = "auto"):
    if "FAIL" in text:
        raise RuntimeError("translator down")
    return f"[{dest}] {text}", "ja" if src == "auto" else src


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def override_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    login_failures.clear()
    translate_limiter.clear()
    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_translate_fn] = lambda: fake_translate
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def signup(client, username="alice", password="secret123") -> dict:
    assert client.post("/register", json={"username": username, "password": password}).status_code == 201
    res = client.post("/login", data={"username": username, "password": password})
    assert res.status_code == 200
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture()
def auth(client):
    return signup(client)
