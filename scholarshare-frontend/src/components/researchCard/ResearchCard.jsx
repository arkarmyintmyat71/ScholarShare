import { Link } from "react-router-dom";

import { researchPath } from "../../config/constants";
import { categoryImage } from "../../utils/categoryImage";
import "./ResearchCard.css";

/**
 * A research summary card for the public site. Presentational only: the page passes
 * a `research` object from the API (see services/researchService.js).
 */
function ResearchCard({ research }) {
  const { id, title, description, categoryName, academicYear } = research;

  return (
    <Link to={researchPath(id)} className="research-card-link">
      <article className="research-card">
        <div className="card-top photo-top">
          <img src={categoryImage(categoryName)} alt="" loading="lazy" />
        </div>

        <div className="card-body">
          <span>{categoryName.toUpperCase()} · {academicYear}</span>
          <h3>{title}</h3>
          <p>{description}</p>

          <footer>
            View research <b aria-hidden="true">→</b>
          </footer>
        </div>
      </article>
    </Link>
  );
}

export default ResearchCard;
