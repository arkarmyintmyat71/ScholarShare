import { useState } from "react";
import { Link } from "react-router-dom";

import NotificationBell from "../account/NotificationBell";
import ProfileMenu from "../account/ProfileMenu";
import "./DashboardNavbar.css";

/**
 * Top bar of the student and admin areas: brand, notification bell, profile menu
 * and the navigation links.
 *
 *   links = [{ label, to, active }]   `to` is anything <Link> accepts; `active` highlights it.
 */
function DashboardNavbar({ homeTo, links, navLabel }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sd-topbar">
      <Link className="sd-brand" to={homeTo} onClick={() => setIsMenuOpen(false)}>
        <span className="sd-brand-mark" aria-hidden="true">S</span>
        <span className="sd-brand-content">
          <strong>ScholarShare</strong>
          <small>LEARN • SHARE • GROW</small>
        </span>
      </Link>

      <div className="sd-actions">
        <NotificationBell />
        <ProfileMenu />
      </div>

      <button
        type="button"
        className={`sd-menu-toggle ${isMenuOpen ? "is-open" : ""}`}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        aria-controls="dashboard-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span className="sd-menu-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <nav
        id="dashboard-navigation"
        className={`sd-nav ${isMenuOpen ? "open" : ""}`}
        aria-label={navLabel}
      >
        {links.map(({ label, to, active }) => (
          <Link
            key={label}
            to={to}
            className={active ? "active" : undefined}
            aria-current={active ? "true" : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default DashboardNavbar;
