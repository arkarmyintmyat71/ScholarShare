import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ResearchCard from "../../components/researchCard/ResearchCard";
import StatusBlock from "../../components/StatusBlock";
import TopicCard from "../../components/topicCard/TopicCard";
import { ROUTES } from "../../config/constants";
import { TRENDING_TOPICS, ABOUT_POINTS, heroResearch } from "../../data/homeContent";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { getCategories } from "../../services/categoryService";
import { searchResearch } from "../../services/researchService";
import { getTopics } from "../../services/topicService";
import "./HomePage.css";

const HOME_RESEARCH_COUNT = 4;
const HOME_TOPIC_COUNT = 3;

function HomePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Real data from the backend: newest approved research, categories, and (for signed-in users) topics.
  const research = useAsync(() => searchResearch({ size: HOME_RESEARCH_COUNT }), []);
  const categories = useAsync(getCategories, []);
  const topics = useAsync(() => getTopics({ size: HOME_TOPIC_COUNT }), [], { enabled: isAuthenticated });

  const runSearch = (query) => {
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
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

          <Link to="/categories">Browse all categories →</Link>
        </div>

        <StatusBlock isLoading={research.isLoading && !research.data} error={research.error} onRetry={research.reload} />
        <div className="card-grid">
          {(research.data?.content ?? []).map((item) => (
            <ResearchCard key={item.id} research={item} />
          ))}
        </div>
        {research.data && research.data.content.length === 0 && (
          <p className="status-message">No research has been published yet.</p>
        )}
      </section>

      {/* Categories */}
      <section className="path" id="categories">
        <div>
          <p className="kicker">BROWSE BY SUBJECT</p>
          <h2>Start with your academic area</h2>

          <p>
            Choose a category and discover research resources related to
            your study interests.
          </p>

          <a className="light-btn" href="#categoryList">
            Explore categories
          </a>
        </div>

        <div className="subject-list" id="categoryList">
          {(categories.data ?? []).map(({ id, name }) => (
            <Link key={id} to={`${ROUTES.search}?categoryId=${id}`}>
              {name} <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
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
