import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ConfirmDialog from "../../components/confirmDialog/ConfirmDialog";
import StatusBlock from "../../components/StatusBlock";
import { ROUTES } from "../../config/constants";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { deleteComment, deleteTopic } from "../../services/adminService";
import { addComment, getTopic } from "../../services/topicService";
import { timeAgo } from "../../utils/format";
import { isAdmin, isStudent } from "../../utils/roles";

// /topics/:id - the topic, its comments, a comment box for students, and delete buttons for admins.
function TopicDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, setData, error, isLoading, reload } = useAsync(() => getTopic(id), [id]);

  const [text, setText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  // What the admin is about to delete: { kind: "topic" } or { kind: "comment", id }
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleComment = async (event) => {
    event.preventDefault();
    setCommentError(null);
    setIsPosting(true);
    try {
      const comment = await addComment(id, text.trim());
      setData((prev) => ({
        topic: { ...prev.topic, commentCount: prev.topic.commentCount + 1 },
        comments: [...prev.comments, comment],
      }));
      setText("");
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const confirmDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      if (target.kind === "topic") {
        await deleteTopic(id);
        navigate(ROUTES.topics, { replace: true });
      } else {
        await deleteComment(target.id);
        setData((prev) => ({
          topic: { ...prev.topic, commentCount: prev.topic.commentCount - 1 },
          comments: prev.comments.filter((c) => c.id !== target.id),
        }));
      }
    } catch (err) {
      setCommentError(err.message);
    }
  };

  const topic = data?.topic;
  const comments = data?.comments ?? [];

  return (
    <div className="pg-wrap pg-narrow">
      <Link className="pg-back" to={ROUTES.topics}>← All topics</Link>

      <StatusBlock isLoading={isLoading && !data} error={error} onRetry={reload} />

      {topic && (
        <>
          <article className="pg-card">
            <span className="pg-kicker">BY {topic.createdByName.toUpperCase()}</span>
            <h1>{topic.title}</h1>
            <div className="pg-meta">
              <span>{timeAgo(topic.createdAt)}</span>
              <span>
                {topic.commentCount} {topic.commentCount === 1 ? "comment" : "comments"}
              </span>
            </div>
            <p className="pg-text">{topic.body}</p>
            {isAdmin(user) && (
              <div className="pg-actions">
                <button type="button" className="pg-btn danger small" onClick={() => setPendingDelete({ kind: "topic" })}>
                  Delete topic
                </button>
              </div>
            )}
          </article>

          <section className="pg-card" aria-label="Comments">
            <h2>Comments</h2>

            {comments.length === 0 && <p className="pg-empty">No comments yet.</p>}
            <ul className="pg-list">
              {comments.map((comment) => (
                <li key={comment.id} className="pg-list-item">
                  <div>
                    <strong>{comment.createdByName}</strong>
                    <p>{comment.body}</p>
                    <small>{timeAgo(comment.createdAt)}</small>
                  </div>
                  {isAdmin(user) && (
                    <button
                      type="button"
                      className="pg-btn danger small"
                      onClick={() => setPendingDelete({ kind: "comment", id: comment.id })}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {isStudent(user) ? (
              <form className="pg-form" onSubmit={handleComment} style={{ marginTop: 18 }}>
                <label className="pg-field">
                  Add a comment
                  <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} required />
                </label>
                {commentError && <p className="pg-message error" role="alert">{commentError}</p>}
                <div>
                  <button type="submit" className="pg-btn" disabled={isPosting || !text.trim()}>
                    {isPosting ? "Posting…" : "Post comment"}
                  </button>
                </div>
              </form>
            ) : (
              commentError && <p className="pg-message error" role="alert">{commentError}</p>
            )}
          </section>
        </>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={pendingDelete.kind === "topic" ? "Delete this topic?" : "Delete this comment?"}
          message={
            pendingDelete.kind === "topic"
              ? "The topic and all of its comments will be removed for everyone."
              : "This comment will be removed for everyone."
          }
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

export default TopicDetailPage;
