from datetime import datetime, timedelta, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base

# 日本時間（夏時間がないので固定オフセットで十分）
JST = timezone(timedelta(hours=9), "JST")


def get_jst_now() -> datetime:
    """日本時間の現在時刻を取得（SQLite には naive な JST として保存される）"""
    return datetime.now(JST)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=get_jst_now)

    translations = relationship(
        "TranslationHistory", back_populates="user", cascade="all, delete-orphan"
    )


class TranslationHistory(Base):
    __tablename__ = "translations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    source_text = Column(String)
    translated_text = Column(String)
    source_lang = Column(String)
    target_lang = Column(String)
    created_at = Column(DateTime, default=get_jst_now)

    user = relationship("User", back_populates="translations")
