import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import Shell from "../components/Shell";

export default function AttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
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
    setAnswers((current) => {
      if (current[questionId] === optionKey) {
        const copy = { ...current };
        delete copy[questionId];
        return copy;
      }
      return { ...current, [questionId]: optionKey };
    });
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
        <div className="attempt-layout reveal-up">
          {attempt.questions[currentIndex] && (() => {
            const question = attempt.questions[currentIndex];
            return (
              <section className="panel question-card reveal-up" key={`q-${currentIndex}`}>
                <div className="question-head">
                  <span className="question-index">{currentIndex + 1}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                      Question {currentIndex + 1} of {attempt.total_questions}
                    </span>
                    <h2 className="question-title">{question.prompt}</h2>
                  </div>
                </div>
                <div className="question-options-grid">
                  {question.options.map((option) => {
                    const isSelected = answers[question.id] === option.option_key;
                    return (
                      <div 
                        className={`option-choice compact-option ${isSelected ? 'selected' : ''}`} 
                        key={option.option_key}
                        onClick={() => selectAnswer(question.id, option.option_key)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                      >
                        <div className={`custom-radio ${isSelected ? 'checked' : ''}`} />
                        <span>
                          <strong>{option.option_key})</strong> {option.option_text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}

          <div className="actions-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button 
              className="secondary-button" 
              onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
              disabled={currentIndex === 0}
            >
              Previous
            </button>
            {currentIndex < attempt.total_questions - 1 ? (
              <button 
                className="secondary-button" 
                onClick={() => setCurrentIndex(c => Math.min(attempt.total_questions - 1, c + 1))}
              >
                Next
              </button>
            ) : (
              <button className="primary-button" onClick={submitAttempt}>
                Submit Test
              </button>
            )}
          </div>
          
          <section className="panel attempt-submit-bar">
            <p className="muted">
              Attempted {answeredCount} out of {attempt.total_questions}
            </p>
            {currentIndex < attempt.total_questions - 1 && (
              <button className="primary-button" onClick={submitAttempt}>
                Submit Early
              </button>
            )}
          </section>
        </div>
      ) : null}
    </Shell>
  );
}
