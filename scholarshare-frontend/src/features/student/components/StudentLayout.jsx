import { Outlet, useLocation } from "react-router-dom";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { ROUTES } from "../../../config/constants";
import { useActiveSection } from "../hooks/useActiveSection";

// Each link scrolls to a section of the single-page student dashboard.
const NAV_LINKS = [
  { label: "Dashboard", hash: "#dashboard" },
  { label: "Explore Research", hash: "#explore" },
  { label: "My Research", hash: "#my-research" },
];

// Sections the page is made of, and which top-bar link each one belongs to.
const SECTION_IDS = ["dashboard", "explore", "categories", "my-research", "upload"];
const LINK_FOR_SECTION = {
  dashboard: "#dashboard",
  explore: "#explore",
  categories: "#explore",
  "my-research": "#my-research",
  upload: "#my-research",
};

// Shell for /student: the dashboard header (links that scroll to sections) around the page.
function StudentLayout() {
  const { pathname } = useLocation();
  const activeSection = useActiveSection(SECTION_IDS);
  const activeLink = pathname === ROUTES.student ? LINK_FOR_SECTION[activeSection] : null;

  const links = NAV_LINKS.map(({ label, hash }) => ({
    label,
    to: { pathname: ROUTES.student, hash },
    active: activeLink === hash,
  }));

  return (
    <DashboardLayout
      homeTo={ROUTES.student}
      links={links}
      navLabel="Student navigation"
      footerLabel="Student dashboard"
    >
      <Outlet />
    </DashboardLayout>
  );
}

export default StudentLayout;
