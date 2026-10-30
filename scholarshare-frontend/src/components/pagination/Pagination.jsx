import "./Pagination.css";

/**
 * "← Previous   Page 2 of 5   Next →". `page` is zero-based (as in the API).
 * Renders nothing when there is only one page.
 */
function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" disabled={page <= 0} onClick={() => onChange(page - 1)}>
        ← Previous
      </button>
      <span aria-current="page">
        Page {page + 1} of {totalPages}
      </span>
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </nav>
  );
}

export default Pagination;
