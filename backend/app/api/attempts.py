from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db
from app.models import Attempt, AttemptAnswer, Question, QuestionSet, User
from app.schemas.attempt import AttemptCreateRequest, AttemptResponse, AttemptSubmitRequest, CertificateResponse
from app.services.scoring import apply_attempt_scoring


router = APIRouter(prefix="/attempts", tags=["attempts"])


def _build_attempt_response(attempt: Attempt) -> AttemptResponse:
    answers_resp = []
    if attempt.submitted_at and attempt.answers:
        q_dict = {q.id: q for q in attempt.question_set.questions}
        for ans in attempt.answers:
            answers_resp.append({
                "question_id": ans.question_id,
                "selected_option_key": ans.selected_option_key,
                "is_correct": ans.is_correct,
                "correct_option_key": q_dict[ans.question_id].correct_option_key if ans.question_id in q_dict else None
            })

    return AttemptResponse(
        id=attempt.id,
        question_set_id=attempt.question_set_id,
        started_at=attempt.started_at,
        submitted_at=attempt.submitted_at,
        total_questions=attempt.total_questions,
        attempted_questions=attempt.attempted_questions,
        correct_answers=attempt.correct_answers,
        wrong_answers=attempt.wrong_answers,
        unattempted_questions=attempt.unattempted_questions,
        negative_marks=attempt.negative_marks,
        final_score=attempt.final_score,
        accuracy_percentage=attempt.accuracy_percentage,
        questions=attempt.question_set.questions,
        answers=answers_resp,
    )


@router.post("", response_model=AttemptResponse)
def start_attempt(
    payload: AttemptCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question_set = (
        db.query(QuestionSet)
        .options(joinedload(QuestionSet.questions).joinedload(Question.options))
        .filter(QuestionSet.id == payload.question_set_id, QuestionSet.user_id == current_user.id)
        .first()
    )
    if not question_set:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question set not found")

    attempt = Attempt(
        user_id=current_user.id,
        question_set_id=question_set.id,
        total_questions=question_set.total_questions,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    attempt.question_set = question_set
    return _build_attempt_response(attempt)


@router.get("/{attempt_id}", response_model=AttemptResponse)
def get_attempt(attempt_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempt = (
        db.query(Attempt)
        .options(
            joinedload(Attempt.question_set).joinedload(QuestionSet.questions).joinedload(Question.options),
            joinedload(Attempt.answers)
        )
        .filter(Attempt.id == attempt_id, Attempt.user_id == current_user.id)
        .first()
    )
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")

    return _build_attempt_response(attempt)


@router.post("/{attempt_id}/submit", response_model=AttemptResponse)
def submit_attempt(
    attempt_id: int,
    payload: AttemptSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempt = (
        db.query(Attempt)
        .options(
            joinedload(Attempt.question_set).joinedload(QuestionSet.questions).joinedload(Question.options),
            joinedload(Attempt.answers)
        )
        .filter(Attempt.id == attempt_id, Attempt.user_id == current_user.id)
        .first()
    )
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")
    if attempt.submitted_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Attempt already submitted")

    answers_by_question_id = {answer.question_id: answer.selected_option_key for answer in payload.answers}

    answer_records: list[AttemptAnswer] = []
    for question in attempt.question_set.questions:
        selected_option = answers_by_question_id.get(question.id)
        answer = AttemptAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_option_key=selected_option,
            is_correct=selected_option == question.correct_option_key if selected_option else False,
        )
        db.add(answer)
        answer_records.append(answer)

    db.flush()
    attempt.submitted_at = datetime.utcnow()
    attempt = apply_attempt_scoring(attempt, answer_records, attempt.question_set)
    db.commit()
    db.refresh(attempt)

    return _build_attempt_response(attempt)


@router.get("/{attempt_id}/certificate", response_model=CertificateResponse)
def get_certificate(attempt_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempt = (
        db.query(Attempt)
        .options(joinedload(Attempt.question_set))
        .filter(Attempt.id == attempt_id, Attempt.user_id == current_user.id)
        .first()
    )
    if not attempt or not attempt.submitted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Completed attempt not found")

    return CertificateResponse(
        learner_name=current_user.full_name,
        assessment_title=attempt.question_set.title,
        generated_at=attempt.submitted_at,
        total_questions=attempt.total_questions,
        attempted_questions=attempt.attempted_questions,
        correct_answers=attempt.correct_answers,
        wrong_answers=attempt.wrong_answers,
        unattempted_questions=attempt.unattempted_questions,
        negative_marks=attempt.negative_marks,
        final_score=attempt.final_score,
        accuracy_percentage=attempt.accuracy_percentage,
        certificate_id=f"CERT-{attempt.id:06d}",
    )
