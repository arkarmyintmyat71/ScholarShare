import { Outlet, useSearchParams } from "react-router-dom";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { ROUTES } from "../../../config/constants";
import { ADMIN_TABS, DEFAULT_TAB } from "../adminTabs";

// Shell for /admin/dashboard: the same dashboard header, with one link per admin section (?tab=...).
function AdminLayout() {
  const [params] = useSearchParams();
  const activeTab = params.get("tab") ?? DEFAULT_TAB;

  const links = ADMIN_TABS.map(({ id, label }) => ({
    label,
    to: { pathname: ROUTES.adminDashboard, search: `?tab=${id}` },
    active: activeTab === id,
  }));

  return (
    <DashboardLayout
      homeTo={ROUTES.adminDashboard}
      links={links}
      navLabel="Admin navigation"
      footerLabel="Admin dashboard"
    >
      <Outlet />
    </DashboardLayout>
  );
}

export default AdminLayout;
