import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import NotificationBell from "../../../components/account/NotificationBell";
import UserAvatar from "../../../components/account/UserAvatar";
import Icon from "../../../components/shell/Icons";
import { ROUTES } from "../../../config/constants";
import { useAuth } from "../../../hooks/useAuth";
import { useActiveSection } from "../hooks/useActiveSection";
import "../../../styles/dashboard-base.css"; // colour variables used by the notification bell
import "../../../styles/shell.css";

// Sidebar links. The first three scroll to a section of the single-page student dashboard (`hash`).
const SECTION_LINKS = [
  { label: "Dashboard", hash: "#dashboard", icon: "grid" },
  { label: "Explore research", hash: "#explore", icon: "compass" },
  { label: "My research", hash: "#my-research", icon: "book" },
  { label: "Upload research", hash: "#upload", icon: "upload" },
];

// Sections the page is made of, and which sidebar link each one belongs to.
const SECTION_IDS = ["dashboard", "explore", "my-research", "upload"];

// Shell of the student area: a navy sidebar, a light top bar and the page (same look as the admin area).
function StudentLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const activeSection = useActiveSection(SECTION_IDS);
  const [isOpen, setIsOpen] = useState(false);

  const onDashboard = pathname === ROUTES.student;
  const onTopics = pathname.startsWith(ROUTES.topics);
  const onProfile = pathname === ROUTES.profile;

  let pageTitle = "Research";
  if (onDashboard) pageTitle = SECTION_LINKS.find((l) => l.hash === `#${activeSection}`)?.label ?? "Dashboard";
  else if (onTopics) pageTitle = "Topics";
  else if (onProfile) pageTitle = "My profile";

  const close = () => setIsOpen(false);

  return (
    <div className="student-app ui-app">
      <aside className={`ui-side ${isOpen ? "open" : ""}`} aria-label="Student navigation">
        <Link className="ui-brand" to={ROUTES.student} onClick={close}>
          <img src="/logo-mark.svg" alt="" width="42" height="42" />
          <span>
            <strong>ScholarShare</strong>
            <small>LEARN • SHARE • GROW</small>
          </span>
        </Link>

        <nav className="ui-nav">
          <span className="ui-nav-title">STUDY</span>
          {SECTION_LINKS.map(({ label, hash, icon }) => {
            const active = onDashboard && hash === `#${activeSection}`;
            return (
              <Link
                key={label}
                to={{ pathname: ROUTES.student, hash }}
                className={active ? "active" : undefined}
                aria-current={active ? "true" : undefined}
                onClick={close}
              >
                <Icon name={icon} />
                <span>{label}</span>
              </Link>
            );
          })}
          <Link to={ROUTES.topics} className={onTopics ? "active" : undefined} onClick={close}>
            <Icon name="chat" />
            <span>Topics</span>
          </Link>
          <span className="ui-nav-title">ACCOUNT</span>
          <Link to={ROUTES.profile} className={onProfile ? "active" : undefined} onClick={close}>
            <Icon name="user" />
            <span>My profile</span>
          </Link>
        </nav>

        <div className="ui-side-foot">
          <UserAvatar name={user?.name} pictureUrl={user?.pictureUrl} size={38} />
          <span>
            <strong>{user?.name}</strong>
            <small>Student</small>
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
            <span>Student</span>
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
        <main className="ui-main ui-main-wide student-main">
          <Outlet />
        </main>
        <footer className="ui-foot">ScholarShare student area · Rangsit University</footer>
      </div>
    </div>
  );
}

export default StudentLayout;
