import TopicCard from "../../components/topicCard/TopicCard";
import { DISCUSSION_TOPICS } from "../../data/homeContent";
import "./TopicsPage.css";

function TopicsPage() {
  return (
    <div className="section">
      <div className="section-head">
        <div>
          <p className="kicker dark">STUDENT COMMUNITY</p>
          <h2>All discussion topics</h2>
        </div>
      </div>

      <div className="topic-grid topics-page-grid">
        {DISCUSSION_TOPICS.map((topic) => (
          <TopicCard key={topic.id} {...topic} />
        ))}
      </div>
    </div>
  );
}

export default TopicsPage;
