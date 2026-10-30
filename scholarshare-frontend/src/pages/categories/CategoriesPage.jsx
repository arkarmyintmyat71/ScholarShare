import { Link } from "react-router-dom";

import StatusBlock from "../../components/StatusBlock";
import { ROUTES } from "../../config/constants";
import { useAsync } from "../../hooks/useAsync";
import { getCategories } from "../../services/categoryService";
import "./CategoriesPage.css";

// Every category from the database, with the number of approved files in it.
function CategoriesPage() {
  const { data, error, isLoading, reload } = useAsync(getCategories, []);
  const categories = data ?? [];

  return (
    <div className="section">
      <div className="section-head">
        <div>
          <p className="kicker dark">ALL CATEGORIES</p>
          <h2>Browse research by subject</h2>
        </div>
      </div>

      <StatusBlock isLoading={isLoading && !data} error={error} onRetry={reload} />

      <div className="categories-grid">
        {categories.map(({ id, name, researchCount }) => (
          <Link key={id} to={`${ROUTES.search}?categoryId=${id}`} className="category-tile">
            {name}{" "}
            <small style={{ opacity: 0.7 }}>({researchCount})</small>{" "}
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      {data && categories.length === 0 && <p className="status-message">No categories yet.</p>}
    </div>
  );
}

export default CategoriesPage;
