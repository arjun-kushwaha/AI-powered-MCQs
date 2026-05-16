from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.auth import TokenResponse, UserLogin, UserRegister, UserSummary
from app.services.auth import login_user, register_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    token = register_user(db, payload)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    token = login_user(db, payload)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserSummary)
def me(current_user: User = Depends(get_current_user)):
    return current_user
