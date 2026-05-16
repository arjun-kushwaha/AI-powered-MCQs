from datetime import datetime

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
