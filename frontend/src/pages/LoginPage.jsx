import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../api/client";
import Brand from "../components/Brand";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await api.login(form);
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
          <h2>Run high-quality assessments with consistent result tracking.</h2>
          <p className="muted">Secure login for learners, trainers, and exam managers.</p>
          <div className="stack auth-points">
            <span>Question generation with difficulty control</span>
            <span>Timed attempts and instant score evaluation</span>
            <span>Certificate-ready completion records</span>
          </div>
        </section>

        <form className="panel auth-form stack reveal-up delay-2" onSubmit={handleSubmit}>
          <h1>Login</h1>
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
            Login
          </button>
          <p className="muted">
            New user? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
