import DashboardNavbar from "./DashboardNavbar";
import DashboardFooter from "./DashboardFooter";
import "../../styles/dashboard-base.css";

/**
 * The shell shared by the student and admin areas: dashboard header, the page, footer.
 * (StudentLayout and AdminLayout only decide which links the header shows.)
 */
function DashboardLayout({ homeTo, links, navLabel, footerLabel, children }) {
  return (
    <div className="student-app">
      <DashboardNavbar homeTo={homeTo} links={links} navLabel={navLabel} />
      <main className="student-main">{children}</main>
      <DashboardFooter label={footerLabel} />
    </div>
  );
}

export default DashboardLayout;
