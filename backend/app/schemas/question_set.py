from datetime import datetime

from pydantic import BaseModel, Field


class QuestionOptionResponse(BaseModel):
    option_key: str
    option_text: str

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    id: int
    prompt: str
    explanation: str
    difficulty: str
    options: list[QuestionOptionResponse]

    class Config:
        from_attributes = True


class QuestionSetGenerateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    source_text: str = Field(min_length=3)
    question_count: int = Field(default=10, ge=5, le=50)
    difficulty: str = Field(default="medium", min_length=3, max_length=20)
    time_limit_minutes: int | None = Field(default=None, ge=5, le=300)
    negative_mark_per_wrong: float | None = Field(default=None, ge=0, le=5)


class QuestionSetSummary(BaseModel):
    id: int
    title: str
    difficulty: str
    time_limit_minutes: int
    negative_mark_per_wrong: float
    total_questions: int
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionSetDetail(QuestionSetSummary):
    source_text: str
    questions: list[QuestionResponse]
