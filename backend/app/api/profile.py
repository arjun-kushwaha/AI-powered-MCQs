from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Profile, User
from app.schemas.profile import ProfileResponse, ProfileUpdate


router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user.profile


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    profile.preferred_exam_type = payload.preferred_exam_type
    profile.default_time_limit_minutes = payload.default_time_limit_minutes
    profile.negative_mark_per_wrong = payload.negative_mark_per_wrong
    profile.preferred_difficulty = payload.preferred_difficulty
    db.commit()
    db.refresh(profile)
    return profile
