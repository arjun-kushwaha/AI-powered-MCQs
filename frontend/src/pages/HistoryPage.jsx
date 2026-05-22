import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Shell from "../components/Shell";

export default function HistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAttempts();
        setAttempts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Shell title="History">
      <div className="section-header">
        <h2 className="question-title">Your Past Assessments</h2>
      </div>

      {error ? <p className="error">{error}</p> : null}
      
      {loading ? (
        <p className="muted">Loading history...</p>
      ) : attempts.length === 0 ? (
        <p className="muted">No attempts found yet.</p>
      ) : (
        <div className="stack">
          {attempts.map((attempt) => (
            <Link 
              key={attempt.id} 
              to={attempt.submitted_at ? `/results/${attempt.id}` : `/attempts/${attempt.id}`} 
              className="list-card reveal-up"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>{attempt.question_set_title}</strong>
                  <span>{new Date(attempt.started_at).toLocaleDateString()} at {new Date(attempt.started_at).toLocaleTimeString()}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {attempt.submitted_at ? (
                    <>
                      <span style={{ 
                        color: attempt.accuracy_percentage >= 50 ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}>
                        {attempt.accuracy_percentage.toFixed(1)}%
                      </span>
                      <span style={{ display: 'block', fontSize: '0.8rem' }}>Score: {attempt.final_score.toFixed(2)}</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>In Progress</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
