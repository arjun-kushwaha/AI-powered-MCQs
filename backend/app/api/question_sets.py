from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db
from app.models import Question, QuestionOption, QuestionSet, User
from app.schemas.question_set import QuestionSetDetail, QuestionSetGenerateRequest, QuestionSetSummary
from app.services.ollama import generate_mcqs


router = APIRouter(prefix="/question-sets", tags=["question-sets"])


@router.get("", response_model=list[QuestionSetSummary])
def list_question_sets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(QuestionSet)
        .filter(QuestionSet.user_id == current_user.id)
        .order_by(QuestionSet.created_at.desc())
        .all()
    )


@router.get("/{question_set_id}", response_model=QuestionSetDetail)
def get_question_set(question_set_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    question_set = (
        db.query(QuestionSet)
        .options(joinedload(QuestionSet.questions).joinedload(Question.options))
        .filter(QuestionSet.id == question_set_id, QuestionSet.user_id == current_user.id)
        .first()
    )
    if not question_set:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question set not found")
    return question_set


@router.post("/generate", response_model=QuestionSetDetail)
async def generate_question_set(
    payload: QuestionSetGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    time_limit = payload.time_limit_minutes or current_user.profile.default_time_limit_minutes
    negative_mark = payload.negative_mark_per_wrong
    if negative_mark is None:
        negative_mark = current_user.profile.negative_mark_per_wrong

    question_set = QuestionSet(
        user_id=current_user.id,
        title=payload.title,
        source_text=payload.source_text,
        difficulty=payload.difficulty,
        time_limit_minutes=time_limit,
        negative_mark_per_wrong=negative_mark,
        total_questions=payload.question_count,
    )
    try:
        db.add(question_set)
        db.flush()

        questions = await generate_mcqs(
            source_text=payload.source_text,
            title=payload.title,
            question_count=payload.question_count,
            difficulty=payload.difficulty,
        )

        for generated_question in questions:
            question = Question(
                question_set_id=question_set.id,
                prompt=generated_question["prompt"],
                explanation=generated_question.get("explanation", ""),
                difficulty=generated_question.get("difficulty", payload.difficulty),
                correct_option_key=generated_question["correct_option_key"],
            )
            db.add(question)
            db.flush()

            for option in generated_question["options"]:
                db.add(
                    QuestionOption(
                        question_id=question.id,
                        option_key=option["option_key"],
                        option_text=option["option_text"],
                    )
                )

        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(question_set)

    stored_question_set = (
        db.query(QuestionSet)
        .options(joinedload(QuestionSet.questions).joinedload(Question.options))
        .filter(QuestionSet.id == question_set.id)
        .first()
    )
    return stored_question_set
