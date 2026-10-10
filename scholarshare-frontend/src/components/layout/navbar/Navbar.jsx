import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Explore Research", to: "/explore" },
  { label: "Categories", to: "/categories" },
  { label: "Topics", to: "/topics" },
  { label: "About", to: "/about" },
];

// NavLink's className/style callbacks receive { isActive }, so this
// just toggles an "active" class instead of always applying one —
// keeps App.css/Navbar.css in charge of what "active" looks like.
const navLinkClassName = ({ isActive }) => (isActive ? "active" : undefined);
const registerClassName = ({ isActive }) => (isActive ? "register active" : "register");

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <header className="site-header">
      <Link to="/" className="brand" onClick={closeMenu}>
        <span className="brand-mark" aria-hidden="true">S</span>

        <span className="brand-content">
          <strong>ScholarShare</strong>
          <small>LEARN • SHARE • GROW</small>
        </span>
      </Link>

      {/* Desktop-only auth actions — hidden below the tablet breakpoint
          so they never compete with the brand/hamburger for space. */}
      <div className="auth-links">
        <NavLink to="/login" className={navLinkClassName}>
          Sign In
        </NavLink>
        <NavLink to="/register" className={registerClassName}>
          Register for free
        </NavLink>
      </div>

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
        {NAV_LINKS.map(({ label, to }) => (
          <NavLink key={to} to={to} className={navLinkClassName} onClick={closeMenu}>
            {label}
          </NavLink>
        ))}

        {/* Same auth actions, restyled for the off-canvas panel — this
            is what actually fixes Sign In disappearing on small
            screens, instead of squeezing it into the top bar. */}
        <div className="mobile-auth">
          <NavLink to="/login" className={navLinkClassName} onClick={closeMenu}>
            Sign In
          </NavLink>
          <NavLink to="/register" className={registerClassName} onClick={closeMenu}>
            Register for free
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;