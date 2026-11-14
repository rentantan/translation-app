"""ユーザー登録・ログイン"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.rate_limit import login_failures
from app.schemas import Token, UserCreate, UserOut
from app.security import create_access_token, verify_password

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")
    return crud.create_user(db, user.username, user.password)


@router.post("/login", response_model=Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    username = form_data.username.strip()
    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{username}"
    if login_failures.is_limited(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="ログインの試行回数が多すぎます。しばらくしてから再度お試しください",
        )

    user = crud.get_user_by_username(db, username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        login_failures.hit(key)
        raise HTTPException(status_code=401, detail="ユーザー名またはパスワードが違います")

    login_failures.reset(key)
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
