import { useSearchParams } from "react-router-dom";

import { ADMIN_TABS, DEFAULT_TAB } from "../../../features/admin/adminTabs";
import AccountsTab from "../../../features/admin/components/AccountsTab";
import CategoriesTab from "../../../features/admin/components/CategoriesTab";
import OverviewTab from "../../../features/admin/components/OverviewTab";
import ResearchReviewTab from "../../../features/admin/components/ResearchReviewTab";
import TopicsTab from "../../../features/admin/components/TopicsTab";

// Which component shows for each ?tab= value (the labels live in adminTabs.js).
const TAB_COMPONENTS = {
  overview: OverviewTab,
  accounts: AccountsTab,
  research: ResearchReviewTab,
  categories: CategoriesTab,
  topics: TopicsTab,
};

// /admin/dashboard?tab=...   The header links (AdminLayout) choose the tab.
function AdminDashboardPage() {
  const [params] = useSearchParams();
  const tabId = TAB_COMPONENTS[params.get("tab")] ? params.get("tab") : DEFAULT_TAB;
  const Tab = TAB_COMPONENTS[tabId];
  const { label } = ADMIN_TABS.find((tab) => tab.id === tabId);

  return (
    <div className="pg-wrap">
      <div className="pg-head">
        <div>
          <span className="pg-kicker">ADMINISTRATOR</span>
          <h1>{label}</h1>
        </div>
      </div>
      <Tab />
    </div>
  );
}

export default AdminDashboardPage;
