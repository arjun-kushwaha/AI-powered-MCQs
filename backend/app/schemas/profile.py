from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
    preferred_exam_type: str
    default_time_limit_minutes: int
    negative_mark_per_wrong: float
    preferred_difficulty: str

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    preferred_exam_type: str = Field(default="competitive", min_length=2, max_length=80)
    default_time_limit_minutes: int = Field(default=30, ge=5, le=300)
    negative_mark_per_wrong: float = Field(default=0.25, ge=0, le=5)
    preferred_difficulty: str = Field(default="medium", min_length=3, max_length=20)
