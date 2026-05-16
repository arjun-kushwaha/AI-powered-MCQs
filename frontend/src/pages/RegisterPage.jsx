import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../api/client";
import Brand from "../components/Brand";

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await api.register(form);
      setToken(data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-showcase reveal-up">
          <Brand subtitle="Assessment Workspace" />
          <h2>Create your learner workspace and launch your first assessment flow.</h2>
          <p className="muted">Registration takes less than a minute.</p>
          <div className="stack auth-points">
            <span>Save personal exam preferences</span>
            <span>Generate structured MCQ sets quickly</span>
            <span>Track attempts and certificate records</span>
          </div>
        </section>

        <form className="panel auth-form stack reveal-up delay-2" onSubmit={handleSubmit}>
          <h1>Create account</h1>
          <input
            placeholder="Full name"
            value={form.full_name}
            onChange={(event) => setForm({ ...form, full_name: event.target.value })}
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {error ? <p className="error">{error}</p> : null}
          <button className="primary-button" type="submit">
            Register
          </button>
          <p className="muted">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
