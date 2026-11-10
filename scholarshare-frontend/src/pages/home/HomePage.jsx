import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import StatusBlock from "../../components/StatusBlock";
import ResearchBrowser from "../../features/research/ResearchBrowser";
import TopicCard from "../../components/topicCard/TopicCard";
import { ROUTES } from "../../config/constants";
import { TRENDING_TOPICS, ABOUT_POINTS, heroResearch } from "../../data/homeContent";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { getTopics } from "../../services/topicService";
import "./HomePage.css";

const HOME_TOPIC_COUNT = 3;

const NO_FILTERS = { q: "", categoryId: "", year: "", page: 0 };

function HomePage() {
  const [search, setSearch] = useState("");
  // Filters of the research list in the "Explore" section (the hero search and the category list set them too).
  const [filters, setFilters] = useState(NO_FILTERS);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Real data from the backend: (for signed-in users) topics. The research list loads itself.
  const topics = useAsync(() => getTopics({ size: HOME_TOPIC_COUNT }), [], { enabled: isAuthenticated });

  // Show the matching research in the Explore section of this same page.
  const showResearch = (changes) => {
    setFilters({ ...NO_FILTERS, ...changes });
    navigate({ pathname: ROUTES.home, hash: "#explore" });
  };

  const runSearch = (query) => {
    const trimmed = query.trim();
    if (trimmed) showResearch({ q: trimmed });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    runSearch(search);
  };

  const handleTrendingClick = (topic) => {
    setSearch(topic);
    runSearch(topic);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">RESEARCH • DISCOVER • CONNECT</p>

          <h1>
            Share research.
            <span>Grow knowledge.</span>
          </h1>

          <p className="lead">
            Discover useful university research, explore academic topics,
            and exchange ideas with other students on ScholarShare.
          </p>

          <form className="search-box" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="What research do you want to find?"
              aria-label="Search research"
            />

            <button type="submit">Search</button>
          </form>

          <div className="trending">
            <b>Trending now</b>

            {TRENDING_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTrendingClick(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-photo-wrap">
            <img
              src={heroResearch}
              alt=""
              className="hero-photo"
            />

            <div className="hero-photo-label">
              <span>RESEARCH</span>
              <b>Student knowledge, shared together.</b>
            </div>
          </div>

          <div className="paper p2">S</div>
          <div className="dot-grid"></div>
        </div>
      </section>

      {/* Quick Strip */}
      <section className="quick-strip">
        <p>One place for university research and academic discussion.</p>

        <div>
          <b>Discover</b>
          <span>approved research</span>
        </div>

        <div>
          <b>Share</b>
          <span>your academic work</span>
        </div>

        <div>
          <b>Connect</b>
          <span>through topics</span>
        </div>
      </section>

      {/* Explore Section */}
      <section className="section" id="explore">
        <div className="section-head">
          <div>
            <p className="kicker dark">EXPLORE SCHOLARSHARE</p>
            <h2>Find research that helps you move forward</h2>
          </div>

        </div>

        <ResearchBrowser filters={filters} onChange={setFilters} />
      </section>

      {/* Topics */}
      <section className="section topics" id="topics">
        <div className="section-head">
          <div>
            <p className="kicker dark">STUDENT COMMUNITY</p>
            <h2>Discuss ideas, not just documents</h2>
          </div>

          {isAuthenticated && <Link to="/topics">Explore all topics →</Link>}
        </div>

        {isAuthenticated ? (
          <>
            <StatusBlock isLoading={topics.isLoading && !topics.data} error={topics.error} onRetry={topics.reload} />
            <div className="topic-grid">
              {(topics.data?.content ?? []).map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
            {topics.data && topics.data.content.length === 0 && (
              <p className="status-message">No topics yet. Start the first discussion!</p>
            )}
          </>
        ) : (
          <p className="pg-signin-note">
            Discussion topics are for ScholarShare members. <Link to={ROUTES.login}>Sign in</Link> or{" "}
            <Link to={ROUTES.register}>register</Link> to join the conversation.
          </p>
        )}
      </section>

      {/* About */}
      <section className="community" id="about">
        <div>
          <p className="kicker">WHY SCHOLARSHARE</p>

          <h2>
            More than a file repository — a student research community.
          </h2>

          <ul>
            {ABOUT_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="stat-card">
          <strong>Learn</strong>
          <span>from shared research</span>

          <strong>Share</strong>
          <span>your academic work</span>

          <strong>Grow</strong>
          <span>through discussion</span>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to join ScholarShare?</h2>

        <p>
          Create your student account and start discovering academic
          knowledge.
        </p>

        <Link className="register" to="/register">Register for free</Link>
        <Link to="/login" className="secondary">
          Sign In
        </Link>
      </section>
    </>
  );
}

export default HomePage;
