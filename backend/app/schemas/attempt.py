from datetime import datetime

# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field

from app.schemas.question_set import QuestionResponse


class AttemptCreateRequest(BaseModel):
    question_set_id: int


class AttemptAnswerInput(BaseModel):
    question_id: int
    selected_option_key: str | None = Field(default=None, pattern="^[A-D]$")


class AttemptSubmitRequest(BaseModel):
    answers: list[AttemptAnswerInput]


class AttemptQuestionResponse(QuestionResponse):
    pass

class AttemptAnswerResponse(BaseModel):
    question_id: int
    selected_option_key: str | None
    is_correct: bool
    correct_option_key: str | None = None


class AttemptResponse(BaseModel):
    id: int
    question_set_id: int
    started_at: datetime
    submitted_at: datetime | None
    total_questions: int
    attempted_questions: int
    correct_answers: int
    wrong_answers: int
    unattempted_questions: int
    negative_marks: float
    final_score: float
    accuracy_percentage: float
    questions: list[AttemptQuestionResponse]
    answers: list[AttemptAnswerResponse] = Field(default_factory=list)


class AttemptSummaryResponse(BaseModel):
    id: int
    question_set_id: int
    started_at: datetime
    submitted_at: datetime | None
    total_questions: int
    attempted_questions: int
    correct_answers: int
    wrong_answers: int
    unattempted_questions: int
    negative_marks: float
    final_score: float
    accuracy_percentage: float
    question_set_title: str

class CertificateResponse(BaseModel):
    learner_name: str
    assessment_title: str
    generated_at: datetime | None
    total_questions: int
    attempted_questions: int
    correct_answers: int
    wrong_answers: int
    unattempted_questions: int
    negative_marks: float
    final_score: float
    accuracy_percentage: float
    certificate_id: str
