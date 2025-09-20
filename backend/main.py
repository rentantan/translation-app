from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from googletrans import Translator
from jose import JWTError, jwt
from typing import List
from datetime import datetime

from database import SessionLocal, Base, engine
from models import User, TranslationHistory
from auth import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM
from crud import get_user_by_username, create_user
from schemas import UserCreate, UserOut, Token, TranslationOut

# ======================
# FastAPI アプリ初期化
# ======================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 初期化
Base.metadata.create_all(bind=engine)

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# DB セッション依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 現在のユーザーを取得
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

# ======================
# ユーザー関連エンドポイント
# ======================

@app.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db, user.username, user.password)


@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


# ======================
# 翻訳API
# ======================
translator = Translator()

class TranslationRequest(BaseModel):
    text: str
    target_lang: str = "en"

class TranslationResponse(BaseModel):
    translated_text: str
    source_lang: str = None

MAX_CHUNK = 500  # 長文対策

@app.post("/translate", response_model=TranslationResponse)
def translate(
    request: TranslationRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text = request.text
    chunks = [text[i:i+MAX_CHUNK] for i in range(0, len(text), MAX_CHUNK)]
    translated_text = ""
    detected_lang = None
    
    for chunk in chunks:
        try:
            result = translator.translate(chunk, dest=request.target_lang)
            translated_text += result.text
            if detected_lang is None:
                detected_lang = result.src
        except Exception as e:
            raise HTTPException(status_code=500, detail="翻訳に失敗しました")
    
    # 翻訳履歴を保存
    translation_history = TranslationHistory(
        user_id=current_user.id,
        source_text=text,
        translated_text=translated_text,
        source_lang=detected_lang,
        target_lang=request.target_lang
    )
    db.add(translation_history)
    db.commit()
    
    return {
        "translated_text": translated_text,
        "source_lang": detected_lang
    }

# ======================
# 翻訳履歴API
# ======================

@app.get("/translations/history", response_model=List[TranslationOut])
def get_translation_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザーの翻訳履歴を取得"""
    translations = db.query(TranslationHistory).filter(
        TranslationHistory.user_id == current_user.id
    ).order_by(TranslationHistory.created_at.desc()).offset(skip).limit(limit).all()
    
    return translations

@app.delete("/translations/history/{translation_id}")
def delete_translation(
    translation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """特定の翻訳履歴を削除"""
    translation = db.query(TranslationHistory).filter(
        TranslationHistory.id == translation_id,
        TranslationHistory.user_id == current_user.id
    ).first()
    
    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found")
    
    db.delete(translation)
    db.commit()
    return {"message": "Translation deleted successfully"}

@app.delete("/translations/history")
def clear_translation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """ユーザーの全翻訳履歴を削除"""
    db.query(TranslationHistory).filter(
        TranslationHistory.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "Translation history cleared successfully"}
