import { useRef } from "react";
import { frameCssVars } from "../avatarFrame";
import UserAvatar from "../../../components/account/UserAvatar";
import { capitalize } from "../../../utils/format";
import { isAdmin } from "../../../utils/roles";
import Icon from "./Icon";

// The top of the profile page: the framed profile photo (click it to change it), name, role, headline and the action buttons.
function ProfileHeader({ user, avatar, frame, stats, onSettings, onSignOut }) {
  const fileRef = useRef(null);

  return (
    <section className="fp-hero" aria-label="Profile header">
      <div className="fp-identity">
        <div className="fp-identity-main">
          <div className="fp-avatar-wrap">
            <button type="button" className="fp-avatar-frame" style={frameCssVars(frame)} aria-label="Change profile photo" title="Change profile photo"
              disabled={avatar.isBusy} onClick={() => fileRef.current.click()}>
              <span className="fp-avatar">
                <UserAvatar name={user.name} pictureUrl={user.pictureUrl} size={166} />
              </span>
              <span className="fp-avatar-edit"><Icon name="camera" size={18} /> {avatar.isBusy ? "Saving…" : "Edit"}</span>
            </button>
            <input ref={fileRef} type="file" hidden accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={(event) => {
                avatar.change(event.target.files[0]);
                event.target.value = "";
              }} />
          </div>

          <div className="fp-identity-text">
            <div className="fp-name-line">
              <h1>{user.name}</h1>
              <span className={`fp-role ${isAdmin(user) ? "admin" : ""}`}>{capitalize(user.role.toLowerCase())}</span>
            </div>
            {user.headline && <p className="fp-tagline">{user.headline}</p>}
            {stats && <div className="fp-meta">{stats}</div>}
          </div>
        </div>

        <div className="fp-hero-actions">
          <button type="button" className="fp-btn secondary" onClick={onSettings}><Icon name="settings" /> Account settings</button>
          <button type="button" className="fp-btn danger-soft" onClick={onSignOut}><Icon name="logout" /> Sign out</button>
        </div>
      </div>

      {avatar.message && (
        <p className={`fp-feedback fp-hero-feedback ${avatar.message.type}`} role="status">{avatar.message.text}</p>
      )}
    </section>
  );
}

export default ProfileHeader;
