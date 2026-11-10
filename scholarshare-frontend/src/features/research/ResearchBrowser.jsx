import { useState } from "react";

import Pagination from "../../components/pagination/Pagination";
import ResearchCard from "../../components/researchCard/ResearchCard";
import StatusBlock from "../../components/StatusBlock";
import { PAGE_SIZE } from "../../config/constants";
import { useAsync } from "../../hooks/useAsync";
import { getCategories } from "../../services/categoryService";
import { searchResearch } from "../../services/researchService";
import "./ResearchBrowser.css";

const YEARS_BACK = 10;

// Years offered in the filter: next year and the previous ones.
function yearOptions() {
  const thisYear = new Date().getFullYear();
  return Array.from({ length: YEARS_BACK }, (_, i) => thisYear + 1 - i);
}

/**
 * Search box + category and year filters + result count + cards + pager, all inside the page
 * (no separate "search results" page).
 *
 *   filters = { q, categoryId, year, page }      onChange(nextFilters)
 * The parent owns the filters, so other parts of the page (hero search) can set them too.
 *
 * Optional: renderCard(research) draws a card (default: the public ResearchCard) and gridClassName names the grid
 * (the student dashboard passes its own card with Rate / Comment / Save).
 */
function ResearchBrowser({ filters, onChange, renderCard, gridClassName = "card-grid rb-grid" }) {
  const { q, categoryId, year, page } = filters;
  const [text, setText] = useState(q);
  const [lastQ, setLastQ] = useState(q);

  // The hero search box or a category tile may change `q` from outside: keep the text box in step.
  if (q !== lastQ) {
    setLastQ(q);
    setText(q);
  }

  const categories = useAsync(getCategories, []);
  const results = useAsync(
    () => searchResearch({ q, categoryId, year, page, size: PAGE_SIZE.research }),
    [q, categoryId, year, page]
  );

  const update = (changes) => onChange({ ...filters, page: 0, ...changes });

  const handleSubmit = (event) => {
    event.preventDefault();
    update({ q: text.trim() });
  };

  const items = results.data?.content ?? [];
  const total = results.data?.totalElements ?? 0;

  return (
    <div className="rb">
      <form className="pg-filters" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search by title or description"
          aria-label="Search research"
        />
        <select aria-label="Category" value={categoryId} onChange={(event) => update({ categoryId: event.target.value })}>
          <option value="">All categories</option>
          {(categories.data ?? []).map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select aria-label="Academic year" value={year} onChange={(event) => update({ year: event.target.value })}>
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
        <div className={gridClassName}>
          {items.map((research) => (
            renderCard ? renderCard(research) : <ResearchCard key={research.id} research={research} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={results.data?.totalPages} onChange={(p) => onChange({ ...filters, page: p })} />
    </div>
  );
}

export default ResearchBrowser;
