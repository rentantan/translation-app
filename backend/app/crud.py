from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.security import get_password_hash
from app.models import TranslationHistory, User, get_jst_now


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, username: str, password: str) -> User:
    db_user = User(username=username, hashed_password=get_password_hash(password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_translation(
    db: Session,
    user_id: int,
    source_text: str,
    translated_text: str,
    source_lang: str,
    target_lang: str,
) -> TranslationHistory:
    """翻訳履歴を保存する。

    直前の履歴と原文・言語が同じ場合（Enter の連打や再翻訳など）は、
    新しく追加せずに直前の履歴を更新して重複を防ぐ。
    """
    latest = (
        db.query(TranslationHistory)
        .filter(TranslationHistory.user_id == user_id)
        .order_by(TranslationHistory.created_at.desc(), TranslationHistory.id.desc())
        .first()
    )
    if (
        latest is not None
        and latest.source_text == source_text
        and latest.source_lang == source_lang
        and latest.target_lang == target_lang
    ):
        latest.translated_text = translated_text
        latest.created_at = get_jst_now()
        item = latest
    else:
        item = TranslationHistory(
            user_id=user_id,
            source_text=source_text,
            translated_text=translated_text,
            source_lang=source_lang,
            target_lang=target_lang,
        )
        db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_translations(
    db: Session, user_id: int, skip: int, limit: int, q: str | None = None
) -> tuple[list[TranslationHistory], int]:
    query = db.query(TranslationHistory).filter(TranslationHistory.user_id == user_id)
    if q:
        # LIKE のワイルドカードをエスケープしてから部分一致検索
        escaped = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        pattern = f"%{escaped}%"
        query = query.filter(
            or_(
                TranslationHistory.source_text.ilike(pattern, escape="\\"),
                TranslationHistory.translated_text.ilike(pattern, escape="\\"),
            )
        )
    total = query.count()
    items = (
        query.order_by(TranslationHistory.created_at.desc(), TranslationHistory.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


def delete_translation(db: Session, user_id: int, translation_id: int) -> bool:
    deleted = (
        db.query(TranslationHistory)
        .filter(TranslationHistory.id == translation_id, TranslationHistory.user_id == user_id)
        .delete()
    )
    db.commit()
    return deleted > 0


def clear_translations(db: Session, user_id: int) -> int:
    deleted = db.query(TranslationHistory).filter(TranslationHistory.user_id == user_id).delete()
    db.commit()
    return deleted
