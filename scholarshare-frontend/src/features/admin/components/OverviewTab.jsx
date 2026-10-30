import { Link } from "react-router-dom";

import StatusBlock from "../../../components/StatusBlock";
import { ROUTES } from "../../../config/constants";
import { useAsync } from "../../../hooks/useAsync";
import { getStats } from "../../../services/adminService";

const tabLink = (tab) => ({ pathname: ROUTES.adminDashboard, search: `?tab=${tab}` });

// The numbers an administrator needs first. Tiles that need action link to the matching tab.
function OverviewTab() {
  const { data: stats, error, isLoading, reload } = useAsync(getStats, []);

  return (
    <>
      <StatusBlock isLoading={isLoading && !stats} error={error} onRetry={reload} />
      {stats && (
        <div className="pg-stats">
          <Link to={tabLink("accounts")} className={`pg-stat ${stats.pendingAccounts ? "attention" : ""}`}>
            <strong>{stats.pendingAccounts}</strong>
            <span>Accounts waiting for approval</span>
          </Link>
          <Link to={tabLink("research")} className={`pg-stat ${stats.pendingResearch ? "attention" : ""}`}>
            <strong>{stats.pendingResearch}</strong>
            <span>Research waiting for review</span>
          </Link>
          <div className="pg-stat">
            <strong>{stats.students}</strong>
            <span>Students</span>
          </div>
          <div className="pg-stat">
            <strong>{stats.publishedResearch}</strong>
            <span>Published research</span>
          </div>
          <Link to={tabLink("categories")} className="pg-stat">
            <strong>{stats.categories}</strong>
            <span>Categories</span>
          </Link>
          <Link to={tabLink("topics")} className="pg-stat">
            <strong>{stats.topics}</strong>
            <span>Discussion topics</span>
          </Link>
        </div>
      )}
    </>
  );
}

export default OverviewTab;
