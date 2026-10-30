import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";
import ConfirmDialog from "../../confirmDialog/ConfirmDialog";
import { ROUTES } from "../../../config/constants";
import { homeRouteForUser } from "../../../utils/roles";
import "./Navbar.css";

// Links that point at a section of the home page use `hash`.
const NAV_LINKS = [
  { label: "Explore Research", to: ROUTES.home, hash: "#explore" },
  { label: "Categories", to: ROUTES.categories },
  { label: "Topics", to: ROUTES.topics },
  { label: "About", to: ROUTES.home, hash: "#about" },
];

const navLinkClassName = ({ isActive }) => (isActive ? "active" : undefined);
const registerClassName = ({ isActive }) => (isActive ? "register active" : "register");

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const askToSignOut = () => {
    closeMenu();
    setIsConfirmingSignOut(true);
  };

  // Sign in / Register for guests; Dashboard / Sign out for signed-in users.
  // Rendered twice (top bar on desktop, menu panel on mobile) so it lives in a function.
  const renderAuthActions = () =>
    isAuthenticated ? (
      <>
        <NavLink to={homeRouteForUser(user)} className={navLinkClassName} onClick={closeMenu}>
          My dashboard
        </NavLink>
        <button type="button" className="sign-out-btn" onClick={askToSignOut}>
          Sign out
        </button>
      </>
    ) : (
      <>
        <NavLink to={ROUTES.login} className={navLinkClassName} onClick={closeMenu}>
          Sign In
        </NavLink>
        <NavLink to={ROUTES.register} className={registerClassName} onClick={closeMenu}>
          Register for free
        </NavLink>
      </>
    );

  return (
    <header className="site-header">
      <Link to={ROUTES.home} className="brand" onClick={closeMenu}>
        <span className="brand-mark" aria-hidden="true">S</span>

        <span className="brand-content">
          <strong>ScholarShare</strong>
          <small>LEARN • SHARE • GROW</small>
        </span>
      </Link>

      <div className="auth-links">{renderAuthActions()}</div>

      <button
        type="button"
        className={`menu-btn ${isMenuOpen ? "is-open" : ""}`}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
        onClick={toggleMenu}
      >
        <span className="menu-btn-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <nav
        id="main-navigation"
        className={`main-nav ${isMenuOpen ? "open" : ""}`}
        aria-label="Main navigation"
      >
        {NAV_LINKS.map(({ label, to, hash }) => {
          // NavLink can't tell "/#explore" from "/#about", so work out "active" by hand.
          const isActive = location.pathname === to && (hash ? location.hash === hash : true);
          return (
            <Link
              key={label}
              to={{ pathname: to, hash }}
              className={isActive ? "active" : undefined}
              onClick={closeMenu}
            >
              {label}
            </Link>
          );
        })}

        <div className="mobile-auth">{renderAuthActions()}</div>
      </nav>

      {isConfirmingSignOut && (
        <ConfirmDialog
          title="Sign out of ScholarShare?"
          message="You'll need to sign in again to share research and see your saved items."
          confirmLabel="Sign out"
          onConfirm={logout}
          onCancel={() => setIsConfirmingSignOut(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
