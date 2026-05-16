import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Shell from "../components/Shell";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [questionSets, setQuestionSets] = useState([]);
  const [form, setForm] = useState({
    preferred_exam_type: "competitive",
    default_time_limit_minutes: 30,
    negative_mark_per_wrong: 0.25,
    preferred_difficulty: "medium"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [currentUser, currentProfile, sets] = await Promise.all([
          api.me(),
          api.getProfile(),
          api.listQuestionSets()
        ]);
        setUser(currentUser);
        setProfile(currentProfile);
        setQuestionSets(sets);
        setForm(currentProfile);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    try {
      const updated = await api.updateProfile({
        ...form,
        default_time_limit_minutes: Number(form.default_time_limit_minutes),
        negative_mark_per_wrong: Number(form.negative_mark_per_wrong)
      });
      setProfile(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Shell title="Dashboard">
      <div className="grid two-columns">
        <section className="panel">
          <h2>{user ? `Welcome, ${user.full_name}` : "Welcome"}</h2>
          <p className="muted">
            Configure your default assessment rules, then generate question sets from a syllabus,
            a subject name, or a short topic list.
          </p>
          <form className="stack" onSubmit={saveProfile}>
            <input
              placeholder="Exam type"
              value={form.preferred_exam_type}
              onChange={(event) => setForm({ ...form, preferred_exam_type: event.target.value })}
            />
            <input
              placeholder="Time limit in minutes"
              type="number"
              value={form.default_time_limit_minutes}
              onChange={(event) =>
                setForm({ ...form, default_time_limit_minutes: event.target.value })
              }
            />
            <input
              placeholder="Negative mark per wrong answer"
              type="number"
              step="0.01"
              value={form.negative_mark_per_wrong}
              onChange={(event) =>
                setForm({ ...form, negative_mark_per_wrong: event.target.value })
              }
            />
            <input
              placeholder="Difficulty"
              value={form.preferred_difficulty}
              onChange={(event) => setForm({ ...form, preferred_difficulty: event.target.value })}
            />
            <button className="primary-button" type="submit">
              Save Preferences
            </button>
          </form>
          {profile ? (
            <p className="muted">
              Default rules: {profile.default_time_limit_minutes} minutes, negative mark{" "}
              {profile.negative_mark_per_wrong}
            </p>
          ) : null}
          {error ? <p className="error">{error}</p> : null}
        </section>

        <section className="panel">
          <div className="section-header">
            <h2>Question Sets</h2>
            <Link className="primary-button" to="/generate">
              New Set
            </Link>
          </div>
          <div className="stack">
            {questionSets.length ? (
              questionSets.map((setItem) => (
                <Link className="list-card" key={setItem.id} to={`/question-sets/${setItem.id}`}>
                  <strong>{setItem.title}</strong>
                  <span>
                    {setItem.total_questions} questions · {setItem.difficulty} ·{" "}
                    {setItem.time_limit_minutes} min
                  </span>
                </Link>
              ))
            ) : (
              <p className="muted">No question sets yet. Start by generating one from a topic.</p>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}
