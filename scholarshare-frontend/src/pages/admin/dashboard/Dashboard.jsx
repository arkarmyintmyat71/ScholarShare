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

// /admin/dashboard?tab=...   The sidebar links (AdminLayout) choose the tab.
function AdminDashboardPage() {
  const [params] = useSearchParams();
  const tabId = TAB_COMPONENTS[params.get("tab")] ? params.get("tab") : DEFAULT_TAB;
  const Tab = TAB_COMPONENTS[tabId];
  const { label, hint } = ADMIN_TABS.find((tab) => tab.id === tabId);

  return (
    <div className="ui-page">
      <div className="ui-head">
        <span className="ui-kicker">ADMINISTRATOR</span>
        <h1>{label}</h1>
        <p>{hint}</p>
      </div>
      <Tab />
    </div>
  );
}

export default AdminDashboardPage;
