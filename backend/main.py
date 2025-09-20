from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from googletrans import Translator

from database import SessionLocal, Base, engine
from models import User
from auth import verify_password, get_password_hash, create_access_token
from crud import get_user_by_username, create_user
from schemas import UserCreate, UserOut, Token

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

MAX_CHUNK = 500  # 長文対策

@app.post("/translate")
def translate(request: TranslationRequest):
    text = request.text
    chunks = [text[i:i+MAX_CHUNK] for i in range(0, len(text), MAX_CHUNK)]
    translated_text = ""
    for chunk in chunks:
        try:
            translated_text += translator.translate(chunk, dest=request.target_lang).text
        except Exception:
            return {"translated_text": "翻訳に失敗しました"}
    return {"translated_text": translated_text}
