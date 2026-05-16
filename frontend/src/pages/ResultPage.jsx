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
      ) : null}
    </Shell>
  );
}
