// Shows "Loading…" or the error message (with a Retry button) for data loaded with useAsync.
// Renders nothing once there is data and no error, so pages can place it above their content.
//
//   <StatusBlock isLoading={q.isLoading && !q.data} error={q.error} onRetry={q.reload} />
function StatusBlock({ isLoading, error, onRetry }) {
  if (error) {
    return (
      <p className="status-message error" role="alert">
        {error}{" "}
        {onRetry && (
          <button type="button" className="pg-link-button" onClick={onRetry}>
            Try again
          </button>
        )}
      </p>
    );
  }
  if (isLoading) return <p className="status-message">Loading…</p>;
  return null;
}

export default StatusBlock;
