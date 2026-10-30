import { Link } from "react-router-dom";
import "../notFound/NotFoundPage.css";

// Placeholder for pages that are linked in the UI but not built yet.
function ComingSoonPage({ title }) {
  return (
    <div className="not-found">
      <p className="kicker dark">COMING SOON</p>
      <h1>{title}</h1>
      <p>This page is still being built.</p>
      <Link to="/" className="light-btn not-found-btn">
        Back to home
      </Link>
    </div>
  );
}

export default ComingSoonPage;
