import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "../api/client";
import Brand from "./Brand";

export default function Shell({ title, children }) {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar-wrap">
        <div className="sidebar">
          <Brand to="/dashboard" subtitle="Assessment Workspace" />
          <nav className="nav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/generate">Generate MCQs</Link>
          </nav>
          <button className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="content">
        <header className="page-header">
          <h1>{title}</h1>
        </header>
        {children}
      </main>
    </div>
  );
}
