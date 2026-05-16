import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Shell from "../components/Shell";

export default function GeneratePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    source_text: "",
    question_count: 10,
    difficulty: "medium"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.generateQuestionSet({
        ...form,
        question_count: Number(form.question_count)
      });
      navigate(`/question-sets/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="Generate MCQs">
      <form className="panel stack" onSubmit={handleSubmit}>
        <div className="panel-intro">
          <p className="eyebrow">Create Assessment</p>
          <p className="muted">
            Enter a title and paste a syllabus, a subject, or even a short topic like Python or
            Quantitative Aptitude.
          </p>
        </div>
        <input
          placeholder="Assessment title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <textarea
          placeholder="Paste syllabus, topics, or subject outline"
          rows="12"
          value={form.source_text}
          onChange={(event) => setForm({ ...form, source_text: event.target.value })}
        />
        <div className="grid compact-two">
          <input
            type="number"
            placeholder="Question count"
            value={form.question_count}
            onChange={(event) => setForm({ ...form, question_count: event.target.value })}
          />
          <input
            placeholder="Difficulty"
            value={form.difficulty}
            onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
          />
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Question Set"}
        </button>
      </form>
    </Shell>
  );
}
