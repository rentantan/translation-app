# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import pytz
from database import Base

# 日本時間のタイムゾーン
JST = pytz.timezone('Asia/Tokyo')

def get_jst_now():
    """日本時間の現在時刻を取得"""
    return datetime.now(JST)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=get_jst_now)

    translations = relationship("TranslationHistory", back_populates="user")

class TranslationHistory(Base):
    __tablename__ = "translations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    source_text = Column(String)
    translated_text = Column(String)
    source_lang = Column(String)
    target_lang = Column(String)
    created_at = Column(DateTime, default=get_jst_now)

    user = relationship("User", back_populates="translations")