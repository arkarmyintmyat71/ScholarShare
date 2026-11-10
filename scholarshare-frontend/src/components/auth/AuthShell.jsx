import { Link } from "react-router-dom";

import Icon from "../shell/Icons";
import { ROUTES } from "../../config/constants";
import "../../pages/auth/AuthPage.css";

const POINTS = [
  { icon: "book", text: "Read approved research for free" },
  { icon: "star", text: "Rate, save and comment on papers" },
  { icon: "upload", text: "Upload your own work with a cover picture" },
];

function Brand({ className }) {
  return (
    <Link className={`auth-logo ${className ?? ""}`} to={ROUTES.home}>
      <img src="/logo-mark.svg" alt="" width="42" height="42" />
      <span>
        <strong>ScholarShare</strong>
        <small>LEARN • SHARE • GROW</small>
      </span>
    </Link>
  );
}

/**
 * Shared frame of the login and register pages: a navy panel with the logo on the left
 * (hidden on phones, where the logo moves into the card) and the form card on the right.
 */
function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-hero">
        <Brand />
        <div className="auth-hero-copy">
          <span className="auth-eyebrow">RESEARCH • DISCOVER • CONNECT</span>
          <h2>
            Share research.
            <em>Grow knowledge.</em>
          </h2>
          <p>A place where university students publish their work and learn from each other.</p>
          <ul>
            {POINTS.map(({ icon, text }) => (
              <li key={text}>
                <span><Icon name={icon} size={16} /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <small className="auth-hero-foot">© ScholarShare · Rangsit University</small>
        <span className="auth-hero-s" aria-hidden="true">S</span>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Brand className="auth-logo-mobile" />
          {children}
        </div>
      </main>
    </div>
  );
}

export default AuthShell;
