from collections.abc import Iterable

from app.models import Attempt, AttemptAnswer, QuestionSet


def apply_attempt_scoring(attempt: Attempt, answers: Iterable[AttemptAnswer], question_set: QuestionSet) -> Attempt:
    answers = list(answers)
    attempted = sum(1 for answer in answers if answer.selected_option_key)
    correct = sum(1 for answer in answers if answer.selected_option_key and answer.is_correct)
    wrong = attempted - correct
    unattempted = attempt.total_questions - attempted
    negative_marks = wrong * question_set.negative_mark_per_wrong
    final_score = correct - negative_marks
    accuracy = (correct / attempted * 100) if attempted else 0

    attempt.attempted_questions = attempted
    attempt.correct_answers = correct
    attempt.wrong_answers = wrong
    attempt.unattempted_questions = unattempted
    attempt.negative_marks = round(negative_marks, 2)
    attempt.final_score = round(final_score, 2)
    attempt.accuracy_percentage = round(accuracy, 2)

    return attempt
