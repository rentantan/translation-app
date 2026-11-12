from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

from config import MAX_TEXT_LENGTH
from models import JST

# フロントエンドの言語リストと揃える
SUPPORTED_LANGUAGES = {"en", "ja", "fr", "es", "de", "it", "ko", "zh-cn", "zh-tw", "pt", "ru"}


def _with_jst(value: datetime) -> datetime:
    """DB から読んだ naive な日時に JST のタイムゾーン情報を付ける。

    これにより JSON は "2025-01-01T12:00:00+09:00" の形式になり、
    ブラウザのタイムゾーンに関係なく正しく解釈される。
    """
    return value.replace(tzinfo=JST) if value.tzinfo is None else value


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=6, max_length=128)

    @field_validator("username")
    @classmethod
    def strip_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("ユーザー名は3文字以上で入力してください")
        return v


class UserOut(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> datetime:
        return _with_jst(value)


class Token(BaseModel):
    access_token: str
    token_type: str


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)
    target_lang: str = "en"
    source_lang: str = "auto"

    @field_validator("text")
    @classmethod
    def text_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("翻訳する文章を入力してください")
        return v

    @field_validator("target_lang")
    @classmethod
    def check_target(cls, v: str) -> str:
        v = v.lower()
        if v not in SUPPORTED_LANGUAGES:
            raise ValueError(f"未対応の言語です: {v}")
        return v

    @field_validator("source_lang")
    @classmethod
    def check_source(cls, v: str) -> str:
        v = v.lower()
        if v != "auto" and v not in SUPPORTED_LANGUAGES:
            raise ValueError(f"未対応の言語です: {v}")
        return v


class TranslationResponse(BaseModel):
    translated_text: str
    source_lang: Optional[str] = None


class TranslationOut(BaseModel):
    id: int
    source_text: str
    translated_text: Optional[str] = None
    source_lang: Optional[str] = None
    target_lang: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> datetime:
        return _with_jst(value)


class TranslationPage(BaseModel):
    items: list[TranslationOut]
    total: int
