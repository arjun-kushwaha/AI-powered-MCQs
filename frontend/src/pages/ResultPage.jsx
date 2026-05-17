import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import Shell from "../components/Shell";

export default function ResultPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [attemptData, certificateData] = await Promise.all([
          api.getAttempt(id),
          api.getCertificate(id)
        ]);
        setAttempt(attemptData);
        setCertificate(certificateData);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [id]);

  return (
    <Shell title="Result Summary">
      {error ? <p className="error">{error}</p> : null}
      {attempt && certificate ? (
        <>
          <div className="grid two-columns reveal-up">
            <section className="panel stack">
              <h2>{certificate.assessment_title}</h2>
              <div className="score-grid">
                <p className="metric-line">
                  <span>Total Questions</span>
                  <strong>{attempt.total_questions}</strong>
                </p>
                <p className="metric-line">
                  <span>Attempted</span>
                  <strong>{attempt.attempted_questions}</strong>
                </p>
                <p className="metric-line">
                  <span>Correct</span>
                  <strong>{attempt.correct_answers}</strong>
                </p>
                <p className="metric-line">
                  <span>Wrong</span>
                  <strong>{attempt.wrong_answers}</strong>
                </p>
                <p className="metric-line">
                  <span>Unattempted</span>
                  <strong>{attempt.unattempted_questions}</strong>
                </p>
                <p className="metric-line">
                  <span>Negative Marks</span>
                  <strong>{attempt.negative_marks}</strong>
                </p>
                <p className="metric-line">
                  <span>Final Score</span>
                  <strong>{attempt.final_score}</strong>
                </p>
                <p className="metric-line">
                  <span>Accuracy</span>
                  <strong>{attempt.accuracy_percentage}%</strong>
                </p>
              </div>
            </section>

            <section className="panel certificate">
              <p className="eyebrow">Certificate Record</p>
              <h2>{certificate.learner_name}</h2>
              <p className="certificate-line">Completed {certificate.assessment_title}</p>
              <p className="certificate-line">Certificate ID: {certificate.certificate_id}</p>
              <p className="certificate-line">
                Generated at: {new Date(certificate.generated_at).toLocaleString()}
              </p>
              <div className="seal">Verified Completion</div>
            </section>
          </div>
          
          <div className="panel stack reveal-up delay-2" style={{ marginTop: '24px' }}>
            <h2 style={{ marginBottom: '16px' }}>Performance Review</h2>
            {attempt.questions.map((q, i) => {
              const answer = attempt.answers?.find(a => a.question_id === q.id);
              const isCorrect = answer?.is_correct;
              const isUnattempted = !answer || !answer.selected_option_key;
              
              let statusColor = 'var(--text-muted)';
              let statusText = 'Unattempted';
              if (!isUnattempted) {
                statusColor = isCorrect ? 'var(--success)' : 'var(--danger)';
                statusText = isCorrect ? 'Correct' : 'Wrong';
              }

              return (
                <div key={q.id} className="list-card" style={{ borderColor: statusColor, padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>Q{i + 1}. {q.prompt}</strong>
                    <span style={{ color: statusColor, fontWeight: 'bold' }}>{statusText}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {q.options.map(opt => {
                      const isSelected = answer?.selected_option_key === opt.option_key;
                      const isActualCorrect = answer?.correct_option_key === opt.option_key;
                      
                      let bg = 'transparent';
                      let border = '1px solid var(--border)';
                      if (isSelected && isActualCorrect) {
                        bg = 'rgba(16, 185, 129, 0.1)';
                        border = '1px solid var(--success)';
                      } else if (isSelected && !isActualCorrect) {
                        bg = 'rgba(239, 68, 104, 0.1)';
                        border = '1px solid var(--danger)';
                      } else if (!isSelected && isActualCorrect && !isCorrect) {
                        bg = 'rgba(16, 185, 129, 0.1)';
                        border = '1px dotted var(--success)';
                      }

                      return (
                        <div key={opt.option_key} style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: bg,
                          border: border,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ fontWeight: 'bold' }}>{opt.option_key})</span>
                          <span>{opt.option_text}</span>
                        </div>
                      )
                    })}
                  </div>
                  {(!isCorrect && !isUnattempted && q.explanation) && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--accent-primary-hover)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Explanation</strong>
                      <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </Shell>
  );
}
