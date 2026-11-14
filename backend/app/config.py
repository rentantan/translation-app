"""アプリ設定。環境変数（または backend/.env）から読み込む。"""
import os
import secrets
import warnings

from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # 開発用のフォールバック。再起動のたびに変わるので、発行済みトークンは無効になる。
    SECRET_KEY = secrets.token_urlsafe(32)
    warnings.warn(
        "SECRET_KEY が未設定のため一時的な鍵を生成しました。"
        "本番環境では backend/.env に SECRET_KEY を設定してください。",
        stacklevel=1,
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

# 1 回のリクエストで受け付ける最大文字数
MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "5000"))

# ログインの失敗がこの回数を超えたら、一定時間ログインを受け付けない
LOGIN_MAX_FAILURES = int(os.getenv("LOGIN_MAX_FAILURES", "5"))
LOGIN_LOCK_SECONDS = int(os.getenv("LOGIN_LOCK_SECONDS", "300"))

# 1 ユーザーが 1 分間に翻訳できる回数
TRANSLATE_RATE_LIMIT = int(os.getenv("TRANSLATE_RATE_LIMIT", "30"))
