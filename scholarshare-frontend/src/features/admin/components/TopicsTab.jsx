import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "../../../components/confirmDialog/ConfirmDialog";
import Pagination from "../../../components/pagination/Pagination";
import StatusBlock from "../../../components/StatusBlock";
import { PAGE_SIZE, topicPath } from "../../../config/constants";
import { useAsync } from "../../../hooks/useAsync";
import { deleteTopic } from "../../../services/adminService";
import { getTopics } from "../../../services/topicService";
import { timeAgo } from "../../../utils/format";

// Moderation: every topic with a delete button. Open a topic to delete single comments.
function TopicsTab() {
  const [page, setPage] = useState(0);
  const { data, error, isLoading, reload } = useAsync(() => getTopics({ page, size: PAGE_SIZE.topics }), [page]);
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState(null);

  const confirmDelete = async () => {
    const topic = toDelete;
    setToDelete(null);
    setActionError(null);
    try {
      await deleteTopic(topic.id);
      // If that was the last topic on this page, go back one page.
      if (data.content.length === 1 && page > 0) setPage(page - 1);
      else reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const list = data?.content ?? [];

  return (
    <section className="pg-card">
      <h2>Topics</h2>
      {actionError && <p className="pg-message error" role="alert">{actionError}</p>}
      <StatusBlock isLoading={isLoading && !data} error={error} onRetry={reload} />
      {data && list.length === 0 && <p className="pg-empty">No topics yet.</p>}

      <ul className="pg-list">
        {list.map((t) => (
          <li key={t.id} className="pg-list-item">
            <div>
              <strong>{t.title}</strong>
              <small>
                by {t.createdByName} · {timeAgo(t.createdAt)} · {t.commentCount} comments ·{" "}
                <Link to={topicPath(t.id)}>Open</Link>
              </small>
            </div>
            <button type="button" className="pg-btn danger small" onClick={() => setToDelete(t)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} />

      {toDelete && (
        <ConfirmDialog
          title={`Delete "${toDelete.title}"?`}
          message="The topic and all of its comments will be removed for everyone."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}

export default TopicsTab;
