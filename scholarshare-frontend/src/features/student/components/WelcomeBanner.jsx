import { Link } from "react-router-dom";

import Icon from "../../../components/shell/Icons";
import { ROUTES } from "../../../config/constants";

// Top of the dashboard: the navy welcome card (same style as the admin overview).
function WelcomeBanner({ name }) {
  return (
    <section className="ui-hero" id="dashboard">
      <div>
        <span className="ui-kicker light">YOUR SCHOLARSHARE SPACE</span>
        <h2>Welcome back, {name}!</h2>
        <p>Find research ideas, share your work, and connect with your academic community.</p>
        <Link className="ui-btn light" to={{ pathname: ROUTES.student, hash: "#upload" }}>
          <Icon name="upload" size={18} /> Upload research
        </Link>
      </div>
      <span className="ui-hero-s" aria-hidden="true">S</span>
    </section>
  );
}

export default WelcomeBanner;
