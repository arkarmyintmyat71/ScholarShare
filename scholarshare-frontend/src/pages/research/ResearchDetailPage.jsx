import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import StatusBlock from "../../components/StatusBlock";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { getResearch, downloadResearch } from "../../services/researchService";
import SaveResearchButton from "../../features/student/components/SaveResearchButton";
import { RESEARCH_STATUS, ROUTES } from "../../config/constants";
import { categoryImage } from "../../utils/categoryImage";
import { capitalize, dateText, fileSizeText } from "../../utils/format";
import { isStudent } from "../../utils/roles";

// /research/:id - details of one research file and the Download button.
// Approved research is public. Pending/rejected ones are only returned to the uploader and admins.
function ResearchDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: research, error, isLoading, reload } = useAsync(() => getResearch(id), [id]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const handleDownload = async () => {
    setDownloadError(null);
    setIsDownloading(true);
    try {
      await downloadResearch(research);
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const status = research?.status;
  const canSave = research && status === RESEARCH_STATUS.APPROVED && isStudent(user);

  return (
    <div className="pg-wrap pg-narrow">
      <Link className="pg-back" to={ROUTES.search}>← Back to research</Link>

      <StatusBlock isLoading={isLoading && !research} error={error} onRetry={reload} />

      {research && (
        <article className="pg-card">
          <img
            src={categoryImage(research.categoryName)}
            alt=""
            style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 14, marginBottom: 18 }}
          />
          <span className="pg-kicker">
            {research.categoryName.toUpperCase()} · {research.academicYear}
          </span>
          <h1>{research.title}</h1>

          <div className="pg-meta">
            <span>By {research.uploadedByName}</span>
            <span>Uploaded {dateText(research.uploadedAt)}</span>
            <span>
              {research.fileName} · {fileSizeText(research.fileSize)}
            </span>
            {status !== RESEARCH_STATUS.APPROVED && (
              <span className={`pg-badge ${status.toLowerCase()}`}>{capitalize(status.toLowerCase())}</span>
            )}
          </div>

          <p className="pg-text">{research.description}</p>

          {downloadError && <p className="pg-message error" role="alert">{downloadError}</p>}

          <div className="pg-actions">
            <button type="button" className="pg-btn" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? "Downloading…" : "⬇ Download file"}
            </button>
            {canSave && <SaveResearchButton research={research} />}
          </div>
        </article>
      )}
    </div>
  );
}

export default ResearchDetailPage;
