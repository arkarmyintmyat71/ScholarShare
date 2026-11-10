import { useState } from "react";
import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";

import NotificationBell from "../../../components/account/NotificationBell";
import UserAvatar from "../../../components/account/UserAvatar";
import { ROUTES } from "../../../config/constants";
import { useAsync } from "../../../hooks/useAsync";
import { useAuth } from "../../../hooks/useAuth";
import { getStats } from "../../../services/adminService";
import { ADMIN_TABS, DEFAULT_TAB } from "../adminTabs";
import Icon from "../../../components/shell/Icons";
import "../../../styles/dashboard-base.css"; // colour variables used by the notification bell
import "../../../styles/shell.css";

// Shell of the admin area: a navy sidebar (one link per section), a light top bar and the page.
function AdminLayout() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const onDashboard = pathname === ROUTES.adminDashboard;
  const activeTab = params.get("tab") ?? DEFAULT_TAB;
  const pageTitle = onDashboard ? (ADMIN_TABS.find((t) => t.id === activeTab)?.label ?? "Overview") : "My profile";

  // Only for the red number on "Research review"; a failure is simply ignored.
  const { data: stats } = useAsync(() => getStats().catch(() => null), [activeTab]);
  const pending = stats?.pendingResearch ?? 0;

  const close = () => setIsOpen(false);

  return (
    <div className="student-app ui-app">
      <aside className={`ui-side ${isOpen ? "open" : ""}`} aria-label="Admin navigation">
        <Link className="ui-brand" to={ROUTES.adminDashboard} onClick={close}>
          <img src="/logo-mark.svg" alt="" width="42" height="42" />
          <span>
            <strong>ScholarShare</strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </Link>

        <nav className="ui-nav">
          <span className="ui-nav-title">MANAGE</span>
          {ADMIN_TABS.map(({ id, label, icon }) => {
            const active = onDashboard && activeTab === id;
            return (
              <Link
                key={id}
                to={{ pathname: ROUTES.adminDashboard, search: `?tab=${id}` }}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={close}
              >
                <Icon name={icon} />
                <span>{label}</span>
                {id === "research" && pending > 0 && <em className="ui-count">{pending}</em>}
              </Link>
            );
          })}
          <span className="ui-nav-title">ACCOUNT</span>
          <Link to={ROUTES.profile} className={pathname === ROUTES.profile ? "active" : undefined} onClick={close}>
            <Icon name="user" />
            <span>My profile</span>
          </Link>
        </nav>

        <div className="ui-side-foot">
          <UserAvatar name={user?.name} pictureUrl={user?.pictureUrl} size={38} />
          <span>
            <strong>{user?.name}</strong>
            <small>Administrator</small>
          </span>
        </div>
      </aside>
      {isOpen && <button type="button" className="ui-scrim" aria-label="Close menu" onClick={close} />}

      <div className="ui-body">
        <header className="ui-top">
          <button type="button" className="ui-menu" aria-label="Open menu" onClick={() => setIsOpen(true)}>
            <Icon name="menu" />
          </button>
          <div className="ui-crumb">
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <strong>{pageTitle}</strong>
          </div>
          <div className="ui-top-actions">
            <NotificationBell />
            <Link to={ROUTES.profile} aria-label="My profile" title="My profile">
              <UserAvatar name={user?.name} pictureUrl={user?.pictureUrl} size={38} />
            </Link>
          </div>
        </header>
        <main className="ui-main">
          <Outlet />
        </main>
        <footer className="ui-foot">ScholarShare admin console · Rangsit University</footer>
      </div>
    </div>
  );
}

export default AdminLayout;
