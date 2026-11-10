import { Link } from "react-router-dom";

import RatingButton from "../../research/RatingButton";
import { researchPath } from "../../../config/constants";
import { researchImage } from "../../../utils/categoryImage";
import "./StudentResearchCard.css";

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3.5h12v17l-6-4-6 4z" />
  </svg>
);

// One approved research item: photo, category, title, description, "View details" and the
// Rate (stars) · Comment · Save row. Purely presentational: the parent supplies the data and handlers.
function StudentResearchCard({
  research,
  isSaved,
  rating,
  ratingAverage,
  ratingCount,
  commentCount,
  onToggleSave,
  onRate,
  onClearRating,
  onOpenComments,
}) {
  const { id, title, description, categoryName, academicYear, uploadedByName } = research;

  return (
    <article className="sd-card">
      <div className="sd-card-photo">
        <img src={researchImage(research)} alt={categoryName} loading="lazy" />
      </div>

      <div className="sd-card-body">
        <span className="sd-card-tag">{categoryName.toUpperCase()}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <small className="sd-card-meta">
          {academicYear} · by {uploadedByName}
        </small>

        <Link className="sd-card-detail" to={researchPath(id)}>
          View details <span aria-hidden="true">→</span>
        </Link>

        <div className="sd-card-actions">
          <RatingButton rating={rating} average={ratingAverage} count={ratingCount} onRate={onRate} onClear={onClearRating} />

          <button
            type="button"
            className="ra-btn"
            aria-label={`Comments (${commentCount})`}
            onClick={onOpenComments}
          >
            <span className="ra-icon" aria-hidden="true">💬</span>
            <span>Comment</span>
            {commentCount > 0 && <small>{commentCount}</small>}
          </button>

          <button
            type="button"
            className={`ra-btn ${isSaved ? "saved" : ""}`}
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
