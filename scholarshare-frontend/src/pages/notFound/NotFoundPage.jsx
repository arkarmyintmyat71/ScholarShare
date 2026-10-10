import { Link } from "react-router-dom";
import "./NotFoundPage.css";

function NotFoundPage() {
  return (
    <div className="not-found">
      <p className="kicker dark">404</p>
      <h1>This page doesn't exist yet</h1>
      <p>The link you followed may be broken, or the page hasn't been built.</p>
      <Link to="/" className="light-btn not-found-btn">
        Back to home
      </Link>
    </div>
  );
}

export default NotFoundPage;
