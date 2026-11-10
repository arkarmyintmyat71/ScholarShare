import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import UserAvatar from "../../components/account/UserAvatar";
import ConfirmDialog from "../../components/confirmDialog/ConfirmDialog";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { deleteResearchComment } from "../../services/adminService";
import {
  addResearchComment,
  getResearchComments,
  likeResearchComment,
  unlikeResearchComment,
} from "../../services/researchService";
import { timeAgo } from "../../utils/format";
import { can } from "../../auth/permissions";
import "./CommentsModal.css";

const SORTS = [
  { id: "relevant", label: "Most relevant" },
  { id: "newest", label: "Newest" },
];

// "Most relevant" = most liked first, older first on a tie. "Newest" = latest first.
function sortComments(comments, sort) {
  const list = [...comments];
  if (sort === "newest") return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list.sort((a, b) => b.likeCount - a.likeCount || new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * The "Comments" window of a research item: sort, every comment with Like and Reply, and the
 * "Write a comment" bar at the bottom. Students write and like; administrators can read and delete.
 *   research        { id, title }
 *   onCountChange   (researchId, +1 | -1) keeps the number on the card in step
 */
function CommentsModal({ research, onClose, onCountChange }) {
  const { user } = useAuth();
  const { data, setData, error, isLoading, reload } = useAsync(() => getResearchComments(research.id), [research.id]);

  const [sort, setSort] = useState("relevant");
  const [text, setText] = useState("");
  const [message, setMessage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const inputRef = useRef(null);

  const student = can.writeComment(user);
  const admin = can.moderateComments(user);
  const comments = useMemo(() => sortComments(data ?? [], sort), [data, sort]);

  // Esc closes; the page behind does not scroll while the window is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event) => event.key === "Escape" && !toDelete && onClose();
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose, toDelete]);

  const replaceComment = (updated) =>
    setData((prev) => (prev ?? []).map((c) => (c.id === updated.id ? updated : c)));

  const handlePost = async (event) => {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    setMessage(null);
    setIsPosting(true);
    try {
      const comment = await addResearchComment(research.id, body);
      setData((prev) => [...(prev ?? []), comment]);
      onCountChange?.(research.id, 1);
      setText("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const toggleLike = async (comment) => {
    setMessage(null);
    try {
      replaceComment(await (comment.likedByMe ? unlikeResearchComment(comment.id) : likeResearchComment(comment.id)));
    } catch (err) {
      setMessage(err.message);
    }
  };

  const reply = (comment) => {
    setText(`@${comment.createdByName} `);
    inputRef.current?.focus();
  };

  const confirmDelete = async () => {
    const comment = toDelete;
    setToDelete(null);
    try {
      await deleteResearchComment(comment.id);
      setData((prev) => (prev ?? []).filter((c) => c.id !== comment.id));
      onCountChange?.(research.id, -1);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return createPortal(
    <div className="cm-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="cm-window" role="dialog" aria-modal="true" aria-labelledby="cm-title">
        <header className="cm-header">
          <h2 id="cm-title">Comments</h2>
          <button type="button" className="cm-close" aria-label="Close comments" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="cm-body">
          <p className="cm-research">{research.title}</p>

          <label className="cm-sort">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {SORTS.map(({ id, label }) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </label>

          {error && (
            <p className="cm-empty" role="alert">
              {error} <button type="button" className="cm-link" onClick={reload}>Try again</button>
            </p>
          )}
          {isLoading && !data && <p className="cm-empty">Loading comments…</p>}
          {data && comments.length === 0 && <p className="cm-empty">No comments yet. Start the conversation!</p>}

          <ul className="cm-list">
            {comments.map((comment) => (
              <li key={comment.id} className="cm-item">
                <UserAvatar name={comment.createdByName} pictureUrl={comment.createdByPictureUrl} size={38} />
                <div className="cm-main">
                  <div className="cm-bubble">
                    <strong>{comment.createdByName}</strong>
                    <p>{comment.body}</p>
                    {comment.likeCount > 0 && (
                      <span className="cm-likes" aria-label={`${comment.likeCount} likes`}>
                        <span aria-hidden="true">👍</span> {comment.likeCount}
                      </span>
                    )}
                  </div>
                  <div className="cm-tools">
                    <span>{timeAgo(comment.createdAt)}</span>
                    {student && (
                      <>
                        <button type="button" className={comment.likedByMe ? "on" : ""} aria-pressed={comment.likedByMe} onClick={() => toggleLike(comment)}>
                          Like
                        </button>
                        <button type="button" onClick={() => reply(comment)}>Reply</button>
                      </>
                    )}
                    {admin && (
                      <button type="button" className="danger" onClick={() => setToDelete(comment)}>Delete</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="cm-footer">
          {message && <p className="cm-error" role="alert">{message}</p>}
          {student ? (
            <form className="cm-compose" onSubmit={handlePost}>
              <UserAvatar name={user.name} pictureUrl={user.pictureUrl} size={40} />
              <input
                ref={inputRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={1000}
                placeholder={`Write a comment as ${user.name}...`}
                aria-label="Write a comment"
              />
              <button type="submit" disabled={isPosting || !text.trim()}>
                {isPosting ? "Posting…" : "Post"}
              </button>
            </form>
          ) : (
            <p className="cm-note">Administrators can read comments and delete the ones that break the rules.</p>
          )}
        </footer>
      </section>

      {toDelete && (
        <ConfirmDialog
          title="Delete this comment?"
          message="This comment will be removed for everyone."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>,
    document.body
  );
}

export default CommentsModal;
