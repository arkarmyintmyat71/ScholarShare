import { Link } from "react-router-dom";

import { topicPath } from "../../config/constants";
import { timeAgo } from "../../utils/format";
import "./TopicCard.css";

// A discussion topic from the API: { id, title, body, createdByName, createdAt, commentCount }.
function TopicCard({ topic }) {
  const { id, title, body, createdByName, createdAt, commentCount } = topic;

  return (
    <Link to={topicPath(id)} className="topic-card-link">
      <article className="topic-card">
        <span>BY {createdByName.toUpperCase()}</span>
        <h3>{title}</h3>
        <p>{body}</p>
        <small>
          {commentCount} {commentCount === 1 ? "comment" : "comments"} · {timeAgo(createdAt)}
        </small>
      </article>
    </Link>
  );
}

export default TopicCard;
