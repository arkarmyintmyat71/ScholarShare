import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";
import UserAvatar from "../../account/UserAvatar";
import { ROUTES } from "../../../config/constants";
import { homeRouteForUser } from "../../../utils/roles";
import "./Navbar.css";

// Links that point at a section of the home page use `hash` (they scroll, they do not open another page).
// Guests: Explore Research, Student Community, About. Signed-in users: Explore Research, Topics.
const GUEST_LINKS = [
  { label: "Explore Research", to: ROUTES.home, hash: "#explore" },
  { label: "Student Community", to: ROUTES.home, hash: "#topics" },
  { label: "About", to: ROUTES.home, hash: "#about" },
];
const MEMBER_LINKS = [
  { label: "Explore Research", to: ROUTES.home, hash: "#explore" },
  { label: "Topics", to: ROUTES.topics },
];

const signInClassName = ({ isActive }) => (isActive ? "signin-btn active" : "signin-btn");
const registerClassName = ({ isActive }) => (isActive ? "register active" : "register");

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Sign in / Register for guests; the profile picture (-> profile page) for signed-in users.
  // Rendered twice (top bar on desktop, menu panel on mobile) so it lives in a function.
  const renderAuthActions = () =>
    isAuthenticated ? (
      <Link className="nav-avatar" to={ROUTES.profile} aria-label="My profile" title="My profile" onClick={closeMenu}>
        <UserAvatar name={user.name} pictureUrl={user.pictureUrl} size={38} />
        <span className="nav-avatar-label">My profile</span>
      </Link>
    ) : (
      <>
        <NavLink to={ROUTES.login} className={signInClassName} onClick={closeMenu}>
          Sign In
        </NavLink>
        <NavLink to={ROUTES.register} className={registerClassName} onClick={closeMenu}>
          Register for free
        </NavLink>
      </>
    );

  return (
    <header className="site-header">
      {/* Signed in: the logo goes to the user's dashboard. Guests: to the home page. */}
      <Link to={isAuthenticated ? homeRouteForUser(user) : ROUTES.home} className="brand" onClick={closeMenu}>
        <img className="brand-mark" src="/logo-mark.svg" alt="" width="40" height="40" />

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
        {(isAuthenticated ? MEMBER_LINKS : GUEST_LINKS).map(({ label, to, hash }) => {
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

    </header>
  );
};

export default Navbar;
