import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/constants";
import { heroResearch } from "../data/studentContent";
import "./WelcomeBanner.css";

// Top of the dashboard: same navy hero as the main site's home page.
function WelcomeBanner({ name }) {
  return (
    <section className="sd-hero" id="dashboard">
      <div className="sd-hero-copy">
        <span className="sd-eyebrow">YOUR SCHOLARSHARE SPACE</span>
        <h1>
          Welcome back,
          <span>{name}.</span>
        </h1>
        <p>Find research ideas, share your work, and connect with your academic community.</p>
        <Link className="sd-btn sd-btn-primary" to={{ pathname: ROUTES.student, hash: "#upload" }}>
          + Upload research
        </Link>
      </div>

      {/* Decorative, so it is hidden on small screens (as on the main site). */}
      <div className="sd-hero-art" aria-hidden="true">
        <div className="sd-hero-photo">
          <img src={heroResearch} alt="" />
          <div className="sd-hero-label">
            <span>DISCOVER · SHARE · CONNECT</span>
            <b>Student knowledge, shared together.</b>
          </div>
        </div>
        <div className="sd-hero-paper">S</div>
        <div className="sd-hero-dots" />
      </div>
    </section>
  );
}

export default WelcomeBanner;
