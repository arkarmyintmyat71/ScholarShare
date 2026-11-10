import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import StatusBlock from "../../components/StatusBlock";
import ConfirmDialog from "../../components/confirmDialog/ConfirmDialog";
import CommentsModal from "../../features/research/CommentsModal";
import RatingButton from "../../features/research/RatingButton";
import { useEngagement } from "../../features/research/useEngagement";
import { useBookmarks } from "../../features/student/hooks/useBookmarks";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { deleteResearch, downloadResearch, getResearch } from "../../services/researchService";
import { RESEARCH_STATUS, ROUTES, researchEditPath } from "../../config/constants";
import { researchImage } from "../../utils/categoryImage";
import { capitalize, dateText, fileSizeText } from "../../utils/format";
import { can } from "../../auth/permissions";
import { homeRouteForUser } from "../../utils/roles";

// /research/:id - details of one research file.
//   everyone:           reads the description
//   signed-in users:    download and comments (admins read and moderate them)
//   students:           also react, save, and edit/delete their own research
// Approved research is public. Pending/rejected ones are only returned to the uploader and admins.
function ResearchDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: research, error, isLoading, reload } = useAsync(() => getResearch(id), [id]);

  const status = research?.status;
  const isApproved = status === RESEARCH_STATUS.APPROVED;
  const canEngage = Boolean(research) && isApproved && can.rate(user);
  const engagement = useEngagement(canEngage);
  const bookmarks = useBookmarks(canEngage);

  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const canEdit = can.editResearch(user, research?.uploadedById);
  const canDelete = can.deleteResearch(user, research?.uploadedById);

  const handleDownload = async () => {
    setMessage(null);
    setIsDownloading(true);
    try {
      await downloadResearch(research);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    setIsConfirmingDelete(false);
    try {
      await deleteResearch(research.id);
      navigate(homeRouteForUser(user), { replace: true });
    } catch (err) {
      setMessage(err.message);
    }
  };

  const saved = research ? bookmarks.isSaved(research.id) : false;

  return (
    <div className="pg-wrap pg-narrow">
      <StatusBlock isLoading={isLoading && !research} error={error} onRetry={reload} />

      {research && (
        <article className="pg-card">
          <img
            src={researchImage(research)}
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
            {isAuthenticated && (
              <span>
                {research.fileName} · {fileSizeText(research.fileSize)}
              </span>
            )}
            {!isApproved && (
              <span className={`pg-badge ${status.toLowerCase()}`}>{capitalize(status.toLowerCase())}</span>
            )}
          </div>

          <p className="pg-text">{research.description}</p>

          {message && <p className="pg-message error" role="alert">{message}</p>}

          {/* Visitors who are not signed in can only read the description. */}
          {!isAuthenticated && (
            <div className="pg-lock" role="note">
              <strong>🔒 Sign in to download, like or comment</strong>
              <p>Everyone can read the description. Downloading, reacting and commenting are for signed-in members.</p>
              <div className="pg-actions" style={{ marginTop: 12 }}>
                <Link className="pg-btn" to={ROUTES.login} state={{ from: location.pathname }}>Sign in</Link>
                <Link className="pg-btn secondary" to={ROUTES.register}>Create an account</Link>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <>
              <div className="ra-row pg-engage">
                {canEngage && (
                  <RatingButton
                    rating={engagement.ratingOf(research.id)}
                    average={engagement.ratingSummary(research).average}
                    count={engagement.ratingSummary(research).count}
                    onRate={(stars) => engagement.rate(research, stars)}
                    onClear={() => engagement.clearRating(research)}
                  />
                )}
                {isApproved && (
                  <button type="button" className="ra-btn" onClick={() => setIsCommentsOpen(true)}>
                    <span className="ra-icon" aria-hidden="true">💬</span>
                    <span>Comments</span>
                    {engagement.commentCount(research) > 0 && <small>{engagement.commentCount(research)}</small>}
                  </button>
                )}
                {canEngage && (
                  <button
                    type="button"
                    className={`ra-btn ${saved ? "saved" : ""}`}
                    aria-pressed={saved}
                    onClick={() => bookmarks.toggle(research)}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 3.5h12v17l-6-4-6 4z" />
                    </svg>
                    <span>{saved ? "Saved" : "Save"}</span>
                  </button>
                )}
              </div>

              <div className="pg-actions">
                <button type="button" className="pg-btn" onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? "Downloading…" : "⬇ Download file"}
                </button>
                {canEdit && (
                  <Link className="pg-btn secondary" to={researchEditPath(research.id)}>✎ Edit</Link>
                )}
                {canDelete && (
                  <button type="button" className="pg-btn danger" onClick={() => setIsConfirmingDelete(true)}>
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </article>
      )}

      {isCommentsOpen && research && (
        <CommentsModal
          research={research}
          onClose={() => setIsCommentsOpen(false)}
          onCountChange={engagement.changeCommentCount}
        />
      )}

      {isConfirmingDelete && (
        <ConfirmDialog
          title="Delete this research?"
          message="The file, its likes and its comments will be removed for good."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      )}
    </div>
  );
}

export default ResearchDetailPage;
