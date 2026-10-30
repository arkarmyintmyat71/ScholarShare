import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useDismiss } from "../../hooks/useDismiss";
import { ROUTES } from "../../config/constants";
import ConfirmDialog from "../confirmDialog/ConfirmDialog";
import { isAdmin } from "../../utils/roles";
import UserAvatar from "./UserAvatar";
import "./ProfileMenu.css";

// Menu entries per role (the sign-out entry is added separately below).
const STUDENT_LINKS = [
  { label: "My research", icon: "▤", to: { pathname: ROUTES.student, hash: "#my-research" } },
  { label: "Submit research", icon: "＋", to: { pathname: ROUTES.student, hash: "#upload" } },
  { label: "Topics", icon: "💬", to: ROUTES.topics },
];
const ADMIN_LINKS = [
  { label: "Admin dashboard", icon: "▦", to: ROUTES.adminDashboard },
  { label: "Topics", icon: "💬", to: ROUTES.topics },
];
const COMMON_LINKS = [
  { label: "My profile", icon: "☺", to: ROUTES.profile },
  { label: "ScholarShare home", icon: "⌂", to: ROUTES.home },
];

/**
 * Profile picture in the top bar. Click it to open a menu with the user's
 * name and e-mail and a few shortcuts, like YouTube. "Sign out" asks for
 * confirmation first.
 */
function ProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);
  const rootRef = useRef(null);

  const closeMenu = () => setIsOpen(false);
  // The confirm pop-up lives outside the menu, so only listen while the menu is open and no pop-up is showing.
  useDismiss(rootRef, closeMenu, isOpen && !isConfirmingSignOut);

  const name = user?.name || "Student";
  const menuLinks = [...(isAdmin(user) ? ADMIN_LINKS : STUDENT_LINKS), ...COMMON_LINKS];

  const askToSignOut = () => {
    closeMenu();
    setIsConfirmingSignOut(true);
  };

  return (
    <div className="profile-menu" ref={rootRef}>
      <button
        type="button"
        className={`profile-trigger ${isOpen ? "is-open" : ""}`}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <UserAvatar name={name} pictureUrl={user?.pictureUrl} size={38} />
      </button>

      {isOpen && (
        <div className="profile-panel" role="menu" aria-label="Account">
          <div className="profile-summary">
            <UserAvatar name={name} pictureUrl={user?.pictureUrl} size={56} />
            <div className="profile-summary-text">
              <strong>{name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="profile-links">
            {menuLinks.map(({ label, icon, to }) => (
              <Link key={label} to={to} role="menuitem" onClick={closeMenu}>
                <span aria-hidden="true">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          <div className="profile-links profile-links-last">
            <button type="button" role="menuitem" onClick={askToSignOut}>
              <span aria-hidden="true">⎋</span>
              Sign out
            </button>
          </div>
        </div>
      )}

      {isConfirmingSignOut && (
        <ConfirmDialog
          title="Sign out of ScholarShare?"
          message="You'll need to sign in again to share research and see your saved items."
          confirmLabel="Sign out"
          onConfirm={logout}
          onCancel={() => setIsConfirmingSignOut(false)}
        />
      )}
    </div>
  );
}

export default ProfileMenu;
