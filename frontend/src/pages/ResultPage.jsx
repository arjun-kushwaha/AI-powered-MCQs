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
        <div className="grid two-columns">
          <section className="panel stack">
            <h2>{certificate.assessment_title}</h2>
            <p className="metric-line">Total Questions: {attempt.total_questions}</p>
            <p className="metric-line">Attempted: {attempt.attempted_questions}</p>
            <p className="metric-line">Correct: {attempt.correct_answers}</p>
            <p className="metric-line">Wrong: {attempt.wrong_answers}</p>
            <p className="metric-line">Unattempted: {attempt.unattempted_questions}</p>
            <p className="metric-line">Negative Marks: {attempt.negative_marks}</p>
            <p className="metric-line">Final Score: {attempt.final_score}</p>
            <p className="metric-line">Accuracy: {attempt.accuracy_percentage}%</p>
          </section>

          <section className="panel certificate">
            <p className="eyebrow">Certificate Record</p>
            <h2>{certificate.learner_name}</h2>
            <p>Completed {certificate.assessment_title}</p>
            <p>Certificate ID: {certificate.certificate_id}</p>
            <p>Generated at: {new Date(certificate.generated_at).toLocaleString()}</p>
          </section>
        </div>
      ) : null}
    </Shell>
  );
}
