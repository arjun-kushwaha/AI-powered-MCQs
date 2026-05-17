import { useState, useEffect } from "react";
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
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    "Analyzing your syllabus...",
    "Extracting key concepts...",
    "Formulating tricky questions...",
    "Generating plausible distractors...",
    "Evaluating question difficulty...",
    "Verifying accuracy...",
    "Almost there! Formatting the final set..."
  ];

  useEffect(() => {
    let msgInterval;
    let progressInterval;
    
    if (loading) {
      msgInterval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 5000);
      
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const increment = prev > 80 ? 0.2 : prev > 50 ? 0.5 : 1;
          const next = prev + increment;
          return next >= 90 ? 90 : next;
        });
      }, 800);
    } else {
      setLoadingMessageIdx(0);
      setProgress(0);
    }
    
    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [loading]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.generateQuestionSet({
        ...form,
        question_count: Number(form.question_count)
      });
      setProgress(100); // Complete progress bar on success
      setTimeout(() => navigate(`/question-sets/${data.id}`), 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Shell title="Generate MCQs">
      {loading ? (
        <div className="panel loading-view reveal-up">
          <div className="ai-core-container">
            <div className="ai-core-ring ring-1"></div>
            <div className="ai-core-ring ring-2"></div>
            <div className="ai-core-ring ring-3"></div>
            <div className="ai-core-center"></div>
          </div>
          
          <div className="loading-text-wrapper">
            <div className="loading-text" key={loadingMessageIdx}>{loadingMessages[loadingMessageIdx]}</div>
          </div>
          
          <div className="progress-container">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-percentage">{Math.round(progress)}%</div>
          </div>

          <p className="loading-subtext">
            Depending on your question count ({form.question_count}) and the AI model, this may take a couple of minutes. Please don't close this page.
          </p>
        </div>
      ) : (
        <form className="panel stack reveal-up" onSubmit={handleSubmit}>
          <div className="panel-intro">
            <p className="eyebrow">Create Assessment</p>
            <p className="muted">
              Enter a title and paste a syllabus, a subject, or even a short topic like Python or Quantitative Aptitude.
            </p>
          </div>
          <div className="hint-row">
            <span className="hint-chip">Clear title improves question relevance</span>
            <span className="hint-chip">Up to 50 questions supported</span>
          </div>
          <input
            placeholder="Assessment title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
          <textarea
            placeholder="Paste syllabus, topics, or subject outline"
            rows="9"
            value={form.source_text}
            onChange={(event) => setForm({ ...form, source_text: event.target.value })}
            required
          />
          <div className="grid compact-two">
            <input
              type="number"
              placeholder="Question count"
              value={form.question_count}
              onChange={(event) => setForm({ ...form, question_count: event.target.value })}
              min="1"
              max="100"
              required
            />
            <input
              placeholder="Difficulty"
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
              required
            />
          </div>
          {error ? <p className="error">{error}</p> : null}
          <button className="primary-button" type="submit">
            Generate Question Set
          </button>
        </form>
      )}
    </Shell>
  );
}
