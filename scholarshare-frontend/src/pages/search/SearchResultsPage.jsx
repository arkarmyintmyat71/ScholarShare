import { useSearchParams } from "react-router-dom";

import Pagination from "../../components/pagination/Pagination";
import ResearchCard from "../../components/researchCard/ResearchCard";
import StatusBlock from "../../components/StatusBlock";
import { PAGE_SIZE } from "../../config/constants";
import { useAsync } from "../../hooks/useAsync";
import { getCategories } from "../../services/categoryService";
import { searchResearch } from "../../services/researchService";
import "./SearchResultsPage.css";

const YEARS_BACK = 10;

// Years offered in the filter: this year and the previous ones.
function yearOptions() {
  const thisYear = new Date().getFullYear();
  return Array.from({ length: YEARS_BACK }, (_, i) => thisYear + 1 - i);
}

// /search?q=&categoryId=&year=&page=   The URL is the single source of truth, so the page can be
// bookmarked and the browser's back button works. Without any filter it lists all approved research.
function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const categoryId = params.get("categoryId") ?? "";
  const year = params.get("year") ?? "";
  const page = Number(params.get("page") ?? 0) || 0;

  const categories = useAsync(getCategories, []);
  const results = useAsync(
    () => searchResearch({ q, categoryId, year, page, size: PAGE_SIZE.research }),
    [q, categoryId, year, page]
  );

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: 0, ...changes }).forEach(([key, value]) => {
      if (value === "" || value == null || (key === "page" && Number(value) === 0)) next.delete(key);
      else next.set(key, String(value));
    });
    setParams(next);
  };

  // The text box is uncontrolled (it remounts when `q` changes via key=...); its value goes to the URL on submit.
  const handleSubmit = (event) => {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get("q");
    update({ q: String(text).trim() });
  };

  const items = results.data?.content ?? [];
  const total = results.data?.totalElements ?? 0;

  return (
    <div className="search-page section">
      <div className="section-head">
        <div>
          <p className="kicker dark">RESEARCH LIBRARY</p>
          <h2>{q ? `Results for "${q}"` : "Browse approved research"}</h2>
        </div>
      </div>

      <form key={q} className="pg-filters" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by title or description"
          aria-label="Search research"
        />
        <select
          aria-label="Category"
          value={categoryId}
          onChange={(event) => update({ q, categoryId: event.target.value, year })}
        >
          <option value="">All categories</option>
          {(categories.data ?? []).map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select
          aria-label="Academic year"
          value={year}
          onChange={(event) => update({ q, categoryId, year: event.target.value })}
        >
          <option value="">Any year</option>
          {yearOptions().map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button type="submit" className="pg-btn">Search</button>
      </form>

      <StatusBlock isLoading={results.isLoading && !results.data} error={results.error} onRetry={results.reload} />

      {results.data && (
        <p className="pg-count">
          {total === 0 ? "No research matches your search." : `${total} result${total === 1 ? "" : "s"}`}
        </p>
      )}

      {items.length > 0 && (
        <div className="card-grid search-grid">
          {items.map((research) => (
            <ResearchCard key={research.id} research={research} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={results.data?.totalPages} onChange={(p) => update({ q, categoryId, year, page: p })} />
    </div>
  );
}

export default SearchResultsPage;
