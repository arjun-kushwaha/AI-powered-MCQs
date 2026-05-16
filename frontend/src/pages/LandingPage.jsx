import { Link } from "react-router-dom";
import Brand from "../components/Brand";

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <div className="landing">
        <div className="landing-copy reveal-up">
          <Brand subtitle="AI-Powered Learning Management System" />
          <p className="status-pill">AI Exam Studio</p>
          <h1>Turn any topic into a sharp, timed assessment in minutes.</h1>
          <p className="lead">
            Built for competitive exam learners and corporate teams that need clean question
            generation, fast testing flows, and verified certificate records.
          </p>
          <div className="actions actions-row">
            <Link to="/register" className="primary-button">
              Start Building
            </Link>
            <Link to="/login" className="secondary-button">
              Login
            </Link>
          </div>
          <div className="mini-stats">
            <div className="mini-stat">
              <span>Auto Build</span>
              <strong>MCQs in seconds</strong>
            </div>
            <div className="mini-stat">
              <span>Exam Mode</span>
              <strong>Timed + negative marks</strong>
            </div>
          </div>
        </div>
        <div className="landing-card reveal-up delay-2">
          <div className="metric">
            <span>Generate</span>
            <strong>Paste a syllabus, subject, or short topic and build MCQs instantly.</strong>
          </div>
          <div className="metric">
            <span>Assess</span>
            <strong>Run timed tests with custom negative marking and saved question sets.</strong>
          </div>
          <div className="metric">
            <span>Certify</span>
            <strong>Deliver result summaries and certificate-ready completion records.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
