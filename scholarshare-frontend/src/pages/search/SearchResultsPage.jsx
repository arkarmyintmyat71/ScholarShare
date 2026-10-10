import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ResearchCard from "../../components/researchCard/ResearchCard";
import { searchResearch } from "../../services/researchService";
import "./SearchResultsPage.css";

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [results, setResults] = useState([]);
  // idle | loading | success | error — "idle" only ever applies when
  // there's no query, which is checked directly at render time below,
  // so the effect never needs to set it back to "idle" itself.
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      return;
    }

    let cancelled = false;

    async function runSearch() {
      setStatus("loading");
      setError(null);

      try {
        const data = await searchResearch(query);
        if (cancelled) return;
        setResults(Array.isArray(data) ? data : []);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        // Expected until the Java backend implements
        // GET /api/research/search — surfaced here instead of a
        // crash so the page stays usable while the backend is built.
        setError(err.message ?? "Search failed.");
        setStatus("error");
      }
    }

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const isIdle = !query;

  return (
    <div className="search-page section">
      <div className="section-head">
        <div>
          <p className="kicker dark">SEARCH RESULTS</p>
          <h2>{query ? `Results for "${query}"` : "Search ScholarShare"}</h2>
        </div>
      </div>

      {isIdle && (
        <p className="status-message">Type a search term to get started.</p>
      )}

      {!isIdle && status === "loading" && (
        <p className="status-message">Searching…</p>
      )}

      {!isIdle && status === "error" && (
        <p className="status-message error">
          {error} Once your Java backend implements{" "}
          <code>GET /api/research/search?q=</code>, results will appear here
          automatically.
        </p>
      )}

      {!isIdle && status === "success" && results.length === 0 && (
        <p className="status-message">No research found for "{query}".</p>
      )}

      {!isIdle && status === "success" && results.length > 0 && (
        <div className="card-grid search-grid">
          {results.map((item) => (
            <ResearchCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;
