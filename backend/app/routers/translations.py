"""翻訳と翻訳履歴"""
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import TranslationPage, TranslationRequest, TranslationResponse
from app.translator import TranslateFn, get_translate_fn

logger = logging.getLogger(__name__)

router = APIRouter(tags=["translations"])


@router.post("/translate", response_model=TranslationResponse)
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


@router.get("/translations/history", response_model=TranslationPage)
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


@router.delete("/translations/history/{translation_id}")
def delete_translation(
    translation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """特定の翻訳履歴を削除"""
    if not crud.delete_translation(db, current_user.id, translation_id):
        raise HTTPException(status_code=404, detail="履歴が見つかりません")
    return {"message": "Translation deleted successfully"}


@router.delete("/translations/history")
def clear_translation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """ユーザーの全翻訳履歴を削除"""
    deleted = crud.clear_translations(db, current_user.id)
    return {"message": "Translation history cleared successfully", "deleted": deleted}
