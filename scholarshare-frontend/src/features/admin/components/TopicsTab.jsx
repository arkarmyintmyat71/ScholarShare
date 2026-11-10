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
import Icon from "../../../components/shell/Icons";

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
    <section className="ui-card flush">
      {actionError && <p className="ui-alert" role="alert">{actionError}</p>}
      <StatusBlock isLoading={isLoading && !data} error={error} onRetry={reload} />
      {data && list.length === 0 && <p className="ui-empty">No topics yet.</p>}

      <ul className="ui-rows">
        {list.map((t) => (
          <li key={t.id} className="ui-row">
            <span className="ui-bubble" title="Comments"><Icon name="chat" size={18} /> {t.commentCount}</span>
            <div className="ui-row-main">
              <strong>{t.title}</strong>
              <small>by {t.createdByName} · {timeAgo(t.createdAt)}</small>
            </div>
            <Link className="ui-link" to={topicPath(t.id)}><Icon name="external" size={16} /> Open</Link>
            <div className="ui-row-actions">
              <button type="button" className="ui-btn danger sm" onClick={() => setToDelete(t)}>
                <Icon name="trash" size={16} /> Delete
              </button>
            </div>
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
