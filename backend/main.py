import logging

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import crud
from auth import create_access_token, decode_access_token, verify_password
from config import CORS_ORIGINS
from database import Base, engine, get_db
from models import User
from schemas import (
    Token,
    TranslationPage,
    TranslationRequest,
    TranslationResponse,
    UserCreate,
    UserOut,
)
from translator import TranslateFn, get_translate_fn

logger = logging.getLogger(__name__)

# ======================
# FastAPI アプリ初期化
# ======================
app = FastAPI(title="Translation App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    username = decode_access_token(token)
    user = crud.get_user_by_username(db, username) if username else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証の有効期限が切れました。再度ログインしてください",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# ======================
# ユーザー関連
# ======================


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")
    return crud.create_user(db, user.username, user.password)


@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username.strip())
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="ユーザー名またはパスワードが違います")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ======================
# 翻訳
# ======================


@app.post("/translate", response_model=TranslationResponse)
async def translate(
    request: TranslationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    translate_fn: TranslateFn = Depends(get_translate_fn),
):
    try:
        translated_text, detected_lang = await translate_fn(
            request.text, request.target_lang, request.source_lang
        )
    except Exception:
        logger.exception("translation failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="翻訳サービスに接続できませんでした。時間をおいて再度お試しください",
        )

    crud.create_translation(
        db,
        user_id=current_user.id,
        source_text=request.text,
        translated_text=translated_text,
        source_lang=detected_lang,
        target_lang=request.target_lang,
    )
    return {"translated_text": translated_text, "source_lang": detected_lang}


# ======================
# 翻訳履歴
# ======================


@app.get("/translations/history", response_model=TranslationPage)
def get_translation_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    q: str | None = Query(None, max_length=200, description="原文・訳文の部分一致検索"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """ユーザーの翻訳履歴を新しい順に取得"""
    items, total = crud.list_translations(db, current_user.id, skip, limit, (q or "").strip())
    return {"items": items, "total": total}


@app.delete("/translations/history/{translation_id}")
def delete_translation(
    translation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """特定の翻訳履歴を削除"""
    if not crud.delete_translation(db, current_user.id, translation_id):
        raise HTTPException(status_code=404, detail="履歴が見つかりません")
    return {"message": "Translation deleted successfully"}


@app.delete("/translations/history")
def clear_translation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """ユーザーの全翻訳履歴を削除"""
    deleted = crud.clear_translations(db, current_user.id)
    return {"message": "Translation history cleared successfully", "deleted": deleted}
