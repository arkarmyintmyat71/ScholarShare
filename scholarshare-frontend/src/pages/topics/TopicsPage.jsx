import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Pagination from "../../components/pagination/Pagination";
import StatusBlock from "../../components/StatusBlock";
import TopicCard from "../../components/topicCard/TopicCard";
import { PAGE_SIZE, topicPath } from "../../config/constants";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { createTopic, getTopics } from "../../services/topicService";
import { isStudent } from "../../utils/roles";
import "./TopicsPage.css";

const EMPTY_FORM = { title: "", body: "" };

// /topics (signed-in users). Students can start a topic; everyone signed in can read and search.
function TopicsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebouncedValue(query);
  const topics = useAsync(
    () => getTopics({ q: debouncedQuery, page, size: PAGE_SIZE.topics }),
    [debouncedQuery, page]
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError(null);
    setIsSaving(true);
    try {
      const created = await createTopic({ title: form.title.trim(), body: form.body.trim() });
      navigate(topicPath(created.id));
    } catch (err) {
      setFormError(err.message);
      setIsSaving(false);
    }
  };

  const items = topics.data?.content ?? [];

  return (
    <div className="section">
      <div className="pg-head">
        <div>
          <p className="kicker dark">STUDENT COMMUNITY</p>
          <h1>Discussion topics</h1>
          <p>Ask a question, share an idea, and talk with other students.</p>
        </div>
        {isStudent(user) && (
          <button type="button" className="pg-btn" onClick={() => setIsFormOpen((open) => !open)}>
            {isFormOpen ? "Close" : "＋ New topic"}
          </button>
        )}
      </div>

      {isFormOpen && (
        <form className="pg-card pg-form" onSubmit={handleCreate} style={{ marginBottom: 22 }}>
          <label className="pg-field">
            Title
            <input name="title" value={form.title} onChange={handleChange} maxLength={255} required />
          </label>
          <label className="pg-field">
            What do you want to discuss?
            <textarea name="body" value={form.body} onChange={handleChange} maxLength={2000} required />
          </label>
          {formError && <p className="pg-message error" role="alert">{formError}</p>}
          <div>
            <button type="submit" className="pg-btn" disabled={isSaving}>
              {isSaving ? "Posting…" : "Post topic"}
            </button>
          </div>
        </form>
      )}

      <div className="pg-filters" style={{ gridTemplateColumns: "1fr" }}>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder="Search topics"
          aria-label="Search topics"
        />
      </div>

      <StatusBlock isLoading={topics.isLoading && !topics.data} error={topics.error} onRetry={topics.reload} />

      <div className="topic-grid topics-page-grid">
        {items.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>

      {topics.data && items.length === 0 && <p className="status-message">No topics yet. Be the first to start one!</p>}

      <Pagination page={page} totalPages={topics.data?.totalPages} onChange={setPage} />
    </div>
  );
}

export default TopicsPage;
