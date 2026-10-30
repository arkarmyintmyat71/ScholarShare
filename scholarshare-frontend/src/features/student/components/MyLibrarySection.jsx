import { useState } from "react";
import { Link } from "react-router-dom";

import { researchPath } from "../../../config/constants";
import { capitalize, countText } from "../../../utils/format";
import { UPLOAD_STATUSES } from "../data/studentContent";
import "./MyLibrarySection.css";

// "My uploads" (filtered by review status) next to "Saved research". Both come from the API.
function MyLibrarySection({ uploads, counts, isLoading, saved, onRemoveSaved }) {
  const [status, setStatus] = useState("PENDING");
  const visibleUploads = uploads.filter((u) => u.status === status);
  const label = status.toLowerCase();

  return (
    <section className="sd-section" id="my-research">
      <div className="sd-section-heading">
        <div>
          <span className="sd-eyebrow">YOUR LIBRARY</span>
          <h2>My research & saved resources</h2>
          <p>Track submitted work and return to resources you've saved.</p>
        </div>
      </div>

      <div className="sd-two-col">
        <div className="sd-panel">
          <h3>My uploads</h3>

          <div className="sd-status-tabs" role="group" aria-label="Submission status">
            {UPLOAD_STATUSES.map((name) => (
              <button
                key={name}
                type="button"
                className={`sd-status-tab ${status === name ? "active" : ""}`}
                aria-pressed={status === name}
                onClick={() => setStatus(name)}
              >
                {capitalize(name.toLowerCase())} <span>{countText(counts[name])}</span>
              </button>
            ))}
          </div>

          <div className="sd-item-list">
            {isLoading && uploads.length === 0 && <p className="sd-muted">Loading…</p>}
            {!isLoading && visibleUploads.length === 0 && (
              <p className="sd-muted">
                {uploads.length === 0 ? "No research submitted yet." : `No ${label} research submissions.`}
              </p>
            )}
            {visibleUploads.map((u) => (
              <div key={u.id} className="sd-list-item">
                <strong>{u.title}</strong>
                <small>
                  {u.categoryName} · {u.academicYear} ·{" "}
                  <b className={`sd-status-label ${label}`}>{capitalize(label)}</b> · {u.fileName}
                </small>
                <Link to={researchPath(u.id)}>View details</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="sd-panel">
          <h3>Saved research</h3>

          <div className="sd-item-list">
            {saved.length === 0 && (
              <p className="sd-muted">Save a resource from Explore Research to see it here.</p>
            )}
            {saved.map((r) => (
              <div key={r.id} className="sd-list-item">
                <strong>{r.title}</strong>
                <small>{r.categoryName}</small>
                <Link to={researchPath(r.id)}>View details</Link>
                <button type="button" onClick={() => onRemoveSaved(r.id)}>
                  Remove saved
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MyLibrarySection;
