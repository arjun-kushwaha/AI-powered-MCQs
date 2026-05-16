import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import Shell from "../components/Shell";

export default function AttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAttempt(id);
        setAttempt(data);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [id]);

  function selectAnswer(questionId, optionKey) {
    setAnswers((current) => ({ ...current, [questionId]: optionKey }));
  }

  async function submitAttempt() {
    try {
      const payload = {
        answers: Object.entries(answers).map(([question_id, selected_option_key]) => ({
          question_id: Number(question_id),
          selected_option_key
        }))
      };
      await api.submitAttempt(id, payload);
      navigate(`/results/${id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <Shell title="Attempt Test">
      {error ? <p className="error">{error}</p> : null}
      {attempt ? (
        <div className="attempt-layout">
          <section className="panel attempt-summary">
            <p className="muted">Total questions: {attempt.total_questions}</p>
            <p className="muted">
              Attempted: {answeredCount} / {attempt.total_questions}
            </p>
          </section>
          <div className="stack">
            {attempt.questions.map((question, index) => (
              <section className="panel question-card" key={question.id}>
                <div className="question-head">
                  <span className="question-index">{index + 1}</span>
                  <h2 className="question-title">{question.prompt}</h2>
                </div>
                <div className="question-options-grid">
                  {question.options.map((option) => (
                    <label className="option-choice compact-option" key={option.option_key}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answers[question.id] === option.option_key}
                        onChange={() => selectAnswer(question.id, option.option_key)}
                      />
                      <span>
                        <strong>{option.option_key}.</strong> {option.option_text}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <section className="panel attempt-submit-bar">
            <p className="muted">
              Attempted {answeredCount} out of {attempt.total_questions}
            </p>
            <button className="primary-button" onClick={submitAttempt}>
              Submit Test
            </button>
          </section>
        </div>
      ) : null}
    </Shell>
  );
}
