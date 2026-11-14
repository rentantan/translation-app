from conftest import signup

from app.rate_limit import translate_limiter


def test_register_validation(client):
    assert client.post("/register", json={"username": "ab", "password": "secret123"}).status_code == 422
    assert client.post("/register", json={"username": "alice", "password": "123"}).status_code == 422


def test_register_duplicate(client, auth):
    res = client.post("/register", json={"username": "alice", "password": "secret123"})
    assert res.status_code == 400


def test_login_wrong_password(client, auth):
    res = client.post("/login", data={"username": "alice", "password": "wrong-pass"})
    assert res.status_code == 401


def test_me(client, auth):
    res = client.get("/me", headers=auth)
    assert res.status_code == 200
    assert res.json()["username"] == "alice"


def test_invalid_token(client):
    res = client.get("/me", headers={"Authorization": "Bearer nope"})
    assert res.status_code == 401


def test_translate_saves_history(client, auth):
    res = client.post("/translate", json={"text": "こんにちは", "target_lang": "en"}, headers=auth)
    assert res.status_code == 200
    assert res.json() == {"translated_text": "[en] こんにちは", "source_lang": "ja"}

    page = client.get("/translations/history", headers=auth).json()
    assert page["total"] == 1
    item = page["items"][0]
    assert item["source_lang"] == "ja"
    assert item["target_lang"] == "en"
    # タイムゾーン付きで返る
    assert item["created_at"].endswith("+09:00")


def test_translate_validation(client, auth):
    assert client.post("/translate", json={"text": "   ", "target_lang": "en"}, headers=auth).status_code == 422
    assert client.post("/translate", json={"text": "hi", "target_lang": "xx"}, headers=auth).status_code == 422


def test_translate_requires_auth(client):
    assert client.post("/translate", json={"text": "hi", "target_lang": "ja"}).status_code == 401


def test_translate_upstream_error(client, auth):
    res = client.post("/translate", json={"text": "FAIL", "target_lang": "en"}, headers=auth)
    assert res.status_code == 502
    assert client.get("/translations/history", headers=auth).json()["total"] == 0


def test_history_search_and_paging(client, auth):
    for word in ["りんご", "みかん", "りんごジュース", "100%果汁"]:
        client.post("/translate", json={"text": word, "target_lang": "en"}, headers=auth)

    page = client.get("/translations/history", params={"q": "りんご"}, headers=auth).json()
    assert page["total"] == 2
    # 新しい順
    assert [i["source_text"] for i in page["items"]] == ["りんごジュース", "りんご"]

    # % はワイルドカードではなく文字として扱う
    assert client.get("/translations/history", params={"q": "%"}, headers=auth).json()["total"] == 1

    page = client.get("/translations/history", params={"skip": 1, "limit": 2}, headers=auth).json()
    assert page["total"] == 4
    assert len(page["items"]) == 2


def test_history_is_private(client, auth):
    client.post("/translate", json={"text": "秘密", "target_lang": "en"}, headers=auth)
    item_id = client.get("/translations/history", headers=auth).json()["items"][0]["id"]

    bob = signup(client, "bob")
    assert client.get("/translations/history", headers=bob).json()["total"] == 0
    assert client.delete(f"/translations/history/{item_id}", headers=bob).status_code == 404


def test_delete_and_clear(client, auth):
    for word in ["a", "b", "c"]:
        client.post("/translate", json={"text": word, "target_lang": "ja"}, headers=auth)
    items = client.get("/translations/history", headers=auth).json()["items"]

    assert client.delete(f"/translations/history/{items[0]['id']}", headers=auth).status_code == 200
    assert client.get("/translations/history", headers=auth).json()["total"] == 2

    res = client.delete("/translations/history", headers=auth)
    assert res.json()["deleted"] == 2
    assert client.get("/translations/history", headers=auth).json()["total"] == 0


def test_same_translation_is_not_duplicated(client, auth):
    for _ in range(3):
        client.post("/translate", json={"text": "こんにちは", "target_lang": "en"}, headers=auth)
    assert client.get("/translations/history", headers=auth).json()["total"] == 1

    # 翻訳先が変われば別の履歴として残す
    client.post("/translate", json={"text": "こんにちは", "target_lang": "fr"}, headers=auth)
    # 直前と違えば、過去と同じ内容でも新しく残す
    client.post("/translate", json={"text": "こんにちは", "target_lang": "en"}, headers=auth)
    items = client.get("/translations/history", headers=auth).json()["items"]
    assert [i["target_lang"] for i in items] == ["en", "fr", "en"]


def test_login_is_locked_after_repeated_failures(client, auth):
    for _ in range(5):
        assert client.post("/login", data={"username": "alice", "password": "wrong-pass"}).status_code == 401
    # ロック中は正しいパスワードでも弾く
    res = client.post("/login", data={"username": "alice", "password": "secret123"})
    assert res.status_code == 429


def test_login_success_resets_failures(client, auth):
    for _ in range(4):
        client.post("/login", data={"username": "alice", "password": "wrong-pass"})
    assert client.post("/login", data={"username": "alice", "password": "secret123"}).status_code == 200
    for _ in range(4):
        client.post("/login", data={"username": "alice", "password": "wrong-pass"})
    assert client.post("/login", data={"username": "alice", "password": "secret123"}).status_code == 200


def test_translate_rate_limit(client, auth):
    original = translate_limiter.max_calls
    translate_limiter.max_calls = 2
    try:
        for word in ["a", "b"]:
            assert client.post("/translate", json={"text": word, "target_lang": "ja"}, headers=auth).status_code == 200
        res = client.post("/translate", json={"text": "c", "target_lang": "ja"}, headers=auth)
        assert res.status_code == 429
    finally:
        translate_limiter.max_calls = original
