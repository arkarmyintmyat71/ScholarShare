import Pagination from "../../../components/pagination/Pagination";
import StudentResearchCard from "./StudentResearchCard";
import "./ExploreSection.css";

// Search box + category filter + grid of approved research (from the API) + pager.
//   explore    = useExploreResearch()      categories = [{ id, name }]      bookmarks = useBookmarks()
function ExploreSection({ explore, categories, bookmarks }) {
  const { query, setQuery, categoryId, setCategoryId, page, setPage, data, isLoading, error } = explore;
  const results = data?.content ?? [];

  return (
    <section className="sd-section" id="explore">
      <div className="sd-section-heading">
        <div>
          <span className="sd-eyebrow">RESEARCH LIBRARY</span>
          <h2>Explore research</h2>
          <p>Search approved research by topic or category, then save useful resources.</p>
        </div>
      </div>

      <div className="sd-filter-row">
        <label className="sd-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search research..."
            aria-label="Search research"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <select
          aria-label="Filter research by category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="sd-empty" role="alert">{error}</p>}
      {isLoading && !data && <p className="sd-empty">Loading research…</p>}

      <div className="sd-research-grid">
        {results.map((research) => (
          <StudentResearchCard
            key={research.id}
            research={research}
            isSaved={bookmarks.isSaved(research.id)}
            onToggleSave={() => bookmarks.toggle(research)}
          />
        ))}
      </div>

      {!error && data && results.length === 0 && (
        <p className="sd-empty">No research matches your search.</p>
      )}

      <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} />
    </section>
  );
}

export default ExploreSection;
