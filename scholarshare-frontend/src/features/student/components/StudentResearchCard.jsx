import { Link } from "react-router-dom";

import { researchPath } from "../../../config/constants";
import { categoryImage } from "../../../utils/categoryImage";
import "./StudentResearchCard.css";

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3.5h12v17l-6-4-6 4z" />
  </svg>
);

// One approved research item with Save and View. Purely presentational:
// the parent supplies the data and the save handler.
function StudentResearchCard({ research, isSaved, onToggleSave }) {
  const { id, title, description, categoryName, academicYear, uploadedByName } = research;

  return (
    <article className="sd-card">
      <div className="sd-card-photo">
        <img src={categoryImage(categoryName)} alt={categoryName} loading="lazy" />
      </div>

      <div className="sd-card-body">
        <span className="sd-card-tag">{categoryName.toUpperCase()}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <small className="sd-card-meta">
          {academicYear} · by {uploadedByName}
        </small>

        <div className="sd-card-actions">
          <Link className="sd-action" to={researchPath(id)}>
            View details →
          </Link>

          <button
            type="button"
            className={`sd-action sd-save ${isSaved ? "saved" : ""}`}
            aria-label={isSaved ? "Remove bookmark" : "Save research"}
            aria-pressed={isSaved}
            onClick={onToggleSave}
          >
            <BookmarkIcon />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default StudentResearchCard;
