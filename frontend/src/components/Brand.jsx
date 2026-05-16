import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Brand({ to = "/", subtitle = "AI Learning Platform" }) {
  return (
    <Link to={to} className="brand-lockup">
      <img className="brand-logo" src={logo} alt="Phoneme logo" />
      <div className="brand-copy">
        <strong>Phoneme</strong>
        <span>{subtitle}</span>
      </div>
    </Link>
  );
}
