import "./TopicCard.css";

function TopicCard({ tag, title, description, comments }) {
  return (
    <article className="topic-card">
      <span>{tag}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <small>{comments} comments</small>
    </article>
  );
}

export default TopicCard;
