import { useState } from "react";
import { Link } from "react-router-dom";

import StatusBlock from "../../../components/StatusBlock";
import { researchPath } from "../../../config/constants";
import { useAsync } from "../../../hooks/useAsync";
import { approveResearch, getPendingResearch, rejectResearch } from "../../../services/adminService";
import { downloadResearch } from "../../../services/researchService";
import { dateText, fileSizeText } from "../../../utils/format";
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
    <section className="pg-card">
      <h2>Research waiting for review ({list.length})</h2>
      <StatusBlock isLoading={isLoading && !data} error={error} onRetry={reload} />
      {actionError && <p className="pg-message error" role="alert">{actionError}</p>}
      {data && list.length === 0 && <p className="pg-empty">Nothing to review. 🎉</p>}

      <ul className="pg-list">
        {list.map((r) => (
          <li key={r.id} className="pg-list-item">
            <div>
              <strong>{r.title}</strong>
              <p>{r.description}</p>
              <small>
                {r.categoryName} · {r.academicYear} · by {r.uploadedByName} · {dateText(r.uploadedAt)}
              </small>
              <small>
                {r.fileName} ({fileSizeText(r.fileSize)}){" "}
                <button type="button" className="pg-link-button" onClick={() => handleDownload(r)}>
                  Download to read
                </button>{" "}
                · <Link to={researchPath(r.id)}>Open page</Link>
              </small>
            </div>
            <ReviewActions
              disabled={busyId === r.id}
              onApprove={() => run(r.id, () => approveResearch(r.id))}
              onReject={(reason) => run(r.id, () => rejectResearch(r.id, reason))}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ResearchReviewTab;
