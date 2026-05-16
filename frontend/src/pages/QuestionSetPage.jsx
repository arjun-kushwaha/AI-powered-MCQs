import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import Shell from "../components/Shell";

export default function QuestionSetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionSet, setQuestionSet] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getQuestionSet(id);
        setQuestionSet(data);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [id]);

  async function startAttempt() {
    try {
      const data = await api.startAttempt({ question_set_id: Number(id) });
      navigate(`/attempts/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Shell title={questionSet ? questionSet.title : "Question Set"}>
      {error ? <p className="error">{error}</p> : null}
      {questionSet ? (
        <div className="stack">
          <section className="panel">
            <p className="muted">
              {questionSet.total_questions} questions - {questionSet.time_limit_minutes} minutes
            </p>
            <button className="primary-button" onClick={startAttempt}>
              Start Test
            </button>
          </section>
          {questionSet.questions.map((question, index) => (
            <section className="panel question-card" key={question.id}>
              <div className="question-head">
                <span className="question-index">{index + 1}</span>
                <h2 className="question-title">{question.prompt}</h2>
              </div>
              <div className="question-options-grid">
                {question.options.map((option) => (
                  <div className="option-preview compact-option" key={option.option_key}>
                    <strong>{option.option_key}</strong>
                    <span>{option.option_text}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}
