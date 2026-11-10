import { Link } from "react-router-dom";

import StatusBlock from "../../../components/StatusBlock";
import { ROUTES } from "../../../config/constants";
import { useAsync } from "../../../hooks/useAsync";
import { useAuth } from "../../../hooks/useAuth";
import { getStats } from "../../../services/adminService";
import Icon from "../../../components/shell/Icons";

const tabLink = (tab) => ({ pathname: ROUTES.adminDashboard, search: `?tab=${tab}` });

// The numbers an administrator needs first. Tiles that need action link to the matching tab.
function OverviewTab() {
  const { data: stats, error, isLoading, reload } = useAsync(getStats, []);
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "admin";

  const tiles = stats && [
    { icon: "clock", label: "Waiting for review", value: stats.pendingResearch, to: tabLink("research"), tone: stats.pendingResearch ? "warn" : "blue" },
    { icon: "book", label: "Published research", value: stats.publishedResearch, tone: "pink" },
    { icon: "users", label: "Students", value: stats.students, to: tabLink("accounts"), tone: "blue" },
    { icon: "tag", label: "Categories", value: stats.categories, to: tabLink("categories"), tone: "green" },
    { icon: "chat", label: "Discussion topics", value: stats.topics, to: tabLink("topics"), tone: "purple" },
  ];
  const total = stats ? stats.pendingResearch + stats.publishedResearch : 0;
  const publishedShare = total ? Math.round((stats.publishedResearch / total) * 100) : 0;

  return (
    <>
      <StatusBlock isLoading={isLoading && !stats} error={error} onRetry={reload} />
      {stats && (
        <>
          <section className="ui-hero">
            <div>
              <span className="ui-kicker light">WELCOME BACK</span>
              <h2>Hello, {firstName}!</h2>
              <p>
                {stats.pendingResearch > 0
                  ? `${stats.pendingResearch} research ${stats.pendingResearch === 1 ? "file is" : "files are"} waiting for your decision.`
                  : "Everything is reviewed. Nothing is waiting for you right now."}
              </p>
              <Link className="ui-btn light" to={tabLink("research")}>
                {stats.pendingResearch > 0 ? "Review research" : "Open research review"} <Icon name="arrow" size={18} />
              </Link>
            </div>
            <span className="ui-hero-s" aria-hidden="true">S</span>
          </section>

          <div className="ui-stats">
            {tiles.map(({ icon, label, value, to, tone }) => {
              const body = (
                <>
                  <span className={`ui-stat-icon ${tone}`}><Icon name={icon} size={22} /></span>
                  <strong>{value}</strong>
                  <span>{label}</span>
                  {to && <Icon name="arrow" size={16} />}
                </>
              );
              return to ? (
                <Link key={label} to={to} className={`ui-stat link ${tone === "warn" ? "attention" : ""}`}>{body}</Link>
              ) : (
                <div key={label} className="ui-stat">{body}</div>
              );
            })}
          </div>

          <section className="ui-card">
            <div className="ui-card-head">
              <h2>Research library</h2>
              <span className="ui-muted">{total} files uploaded</span>
            </div>
            <div className="ui-bar" role="img" aria-label={`${publishedShare}% of the uploaded research is published`}>
              <span style={{ width: `${publishedShare}%` }} />
            </div>
            <div className="ui-legend">
              <span><i className="pink" /> Published · {stats.publishedResearch}</span>
              <span><i className="gray" /> Waiting · {stats.pendingResearch}</span>
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default OverviewTab;
