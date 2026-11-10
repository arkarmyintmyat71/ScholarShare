import { useState } from "react";
import { Link } from "react-router-dom";

import StatusBlock from "../../../components/StatusBlock";
import { researchPath } from "../../../config/constants";
import { useAsync } from "../../../hooks/useAsync";
import { approveResearch, getPendingResearch, rejectResearch } from "../../../services/adminService";
import { downloadResearch } from "../../../services/researchService";
import { dateText, fileSizeText } from "../../../utils/format";
import { researchImage } from "../../../utils/categoryImage";
import Icon from "../../../components/shell/Icons";
import ReviewActions from "./ReviewActions";

// Uploaded files waiting for a decision. The admin can download a file to read it first.
function ResearchReviewTab() {
  const { data, setData, error, isLoading, reload } = useAsync(getPendingResearch, []);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const run = async (id, action) => {
    setActionError(null);
    setBusyId(id);
    try {
      await action();
      setData((prev) => (prev ?? []).filter((r) => r.id !== id)); // it has left the queue
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = (research) => downloadResearch(research).catch((err) => setActionError(err.message));

  const list = data ?? [];

  return (
    <section className="ui-stack">
      <StatusBlock isLoading={isLoading && !data} error={error} onRetry={reload} />
      {actionError && <p className="ui-alert" role="alert">{actionError}</p>}
      {data && list.length === 0 && (
        <div className="ui-card ui-empty-card">
          <span aria-hidden="true">🎉</span>
          <h2>All caught up</h2>
          <p>Nothing is waiting for review.</p>
        </div>
      )}

      {list.map((r) => (
        <article key={r.id} className="ui-review">
          <img src={researchImage(r)} alt="" loading="lazy" />
          <div className="ui-review-body">
            <span className="ui-eyebrow">{r.categoryName} · {r.academicYear}</span>
            <h2>{r.title}</h2>
            <p>{r.description}</p>
            <div className="ui-meta">
              <span><Icon name="user" size={15} /> {r.uploadedByName}</span>
              <span><Icon name="clock" size={15} /> {dateText(r.uploadedAt)}</span>
            </div>
            <div className="ui-file">
              <span className="ui-file-name">{r.fileName} <small>({fileSizeText(r.fileSize)})</small></span>
              <button type="button" className="ui-link" onClick={() => handleDownload(r)}>
                <Icon name="download" size={16} /> Download to read
              </button>
              <Link className="ui-link" to={researchPath(r.id)}>
                <Icon name="external" size={16} /> Open page
              </Link>
            </div>
            <ReviewActions
              disabled={busyId === r.id}
              onApprove={() => run(r.id, () => approveResearch(r.id))}
              onReject={(reason) => run(r.id, () => rejectResearch(r.id, reason))}
            />
          </div>
        </article>
      ))}
    </section>
  );
}

export default ResearchReviewTab;
