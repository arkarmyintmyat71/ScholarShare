import { Link } from "react-router-dom";
import { SUBJECT_CATEGORIES } from "../../data/homeContent";
import "./CategoriesPage.css";

function CategoriesPage() {
  return (
    <div className="section">
      <div className="section-head">
        <div>
          <p className="kicker dark">ALL CATEGORIES</p>
          <h2>Browse research by subject</h2>
        </div>
      </div>

      <div className="categories-grid">
        {SUBJECT_CATEGORIES.map(({ label, to }) => (
          <Link key={to} to={to} className="category-tile">
            {label} <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoriesPage;
