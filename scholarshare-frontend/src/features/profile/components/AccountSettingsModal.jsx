import { useRef, useState } from "react";
import UserAvatar from "../../../components/account/UserAvatar";
import { changePassword } from "../../../services/userService";
import { FRAME_COLORS, FRAME_STYLES, FRAME_WIDTHS, frameCssVars } from "../avatarFrame";
import Icon from "./Icon";
import Modal from "./Modal";
import PasswordField from "./PasswordField";
import PhotoCropper from "./PhotoCropper";

const SECTIONS = [
  { id: "email", label: "Email address", icon: "mail" },
  { id: "password", label: "Password & security", icon: "lock" },
  { id: "photo", label: "Profile photo", icon: "camera" },
];

function EmailPanel({ user }) {
  return (
    <section>
      <h3>Email address</h3>
      <p className="fp-muted">The e-mail you use to sign in to ScholarShare.</p>
      <div className="fp-current-email">
        <Icon name="mail" size={23} />
        <div>
          <small>Your email</small>
          <strong>{user.email}</strong>
        </div>
        <span className="fp-lock-badge"><Icon name="lock" size={12} /> View only</span>
      </div>
      <p className="fp-note">Your e-mail address cannot be changed. Contact an administrator if you need help with your account.</p>
    </section>
  );
}

function PasswordPanel() {
  const blank = { current: "", next: "", confirm: "" };
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const set = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.next !== form.confirm) {
      setMessage({ type: "error", text: "The new passwords do not match." });
      return;
    }
    setMessage(null);
    setIsSaving(true);
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next });
      setForm(blank);
      setMessage({ type: "success", text: "Password updated." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <h3>Password &amp; security</h3>
      <p className="fp-muted">Create a strong password to protect your account.</p>
      <form onSubmit={handleSubmit}>
        <PasswordField id="pw-current" label="Current password" autoComplete="current-password"
          placeholder="Enter current password" value={form.current} onChange={set("current")} />
        <PasswordField id="pw-new" label="New password" autoComplete="new-password" minLength={8}
          placeholder="8 to 72 characters" value={form.next} onChange={set("next")} />
        <PasswordField id="pw-confirm" label="Confirm new password" autoComplete="new-password" minLength={8}
          placeholder="Repeat new password" value={form.confirm} onChange={set("confirm")} />
        {message && <p className={`fp-feedback ${message.type}`} role="status">{message.text}</p>}
        <button type="submit" className="fp-btn primary" disabled={isSaving}>
          {isSaving ? "Saving…" : "Update password"}
        </button>
      </form>
    </section>
  );
}

function PhotoPanel({ user, avatar, frame, onFrameChange, onFrameReset }) {
  const fileRef = useRef(null);
  const [picked, setPicked] = useState(null); // the file waiting in the cropper
  const [error, setError] = useState(null);

  const choose = (file) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image (PNG, JPG, GIF or WebP).");
    if (file.size > 12 * 1024 * 1024) return setError("Please choose a photo under 12 MB.");
    setPicked(file);
  };

  const save = async (croppedFile) => {
    await avatar.change(croppedFile);
    setPicked(null);
  };

  return (
    <section>
      <h3>Profile photo</h3>
      <p className="fp-muted">Choose a photo, move and zoom it inside the circle, then pick a frame that suits you.</p>

      {picked ? (
        <PhotoCropper file={picked} isBusy={avatar.isBusy} onApply={save} onCancel={() => setPicked(null)} />
      ) : (
        <>
          <div className="fp-photo-preview">
            <div className="fp-avatar-ring" style={frameCssVars(frame)}>
              <UserAvatar name={user.name} pictureUrl={user.pictureUrl} size={132} />
            </div>
            <div className="fp-photo-actions">
              <button type="button" className="fp-btn secondary" disabled={avatar.isBusy} onClick={() => fileRef.current.click()}>
                <Icon name="camera" /> {avatar.isBusy ? "Working…" : user.pictureUrl ? "Change photo" : "Upload photo"}
              </button>
              {user.pictureUrl && (
                <button type="button" className="fp-btn danger-soft" disabled={avatar.isBusy} onClick={avatar.remove}>
                  Remove photo
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" hidden accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={(event) => {
                choose(event.target.files[0]);
                event.target.value = "";
              }} />
          </div>

          <div className="fp-frame-options">
            <h4>Frame</h4>
            <div className="fp-option-row" role="group" aria-label="Frame style">
              {FRAME_STYLES.map(({ id, label }) => (
                <button key={id} type="button" className={`fp-chip ${frame.style === id ? "on" : ""}`}
                  aria-pressed={frame.style === id} onClick={() => onFrameChange({ style: id })}>{label}</button>
              ))}
            </div>

            {frame.style !== "none" && (
              <>
                <div className="fp-option-row" role="group" aria-label="Frame colour">
                  {FRAME_COLORS.map(({ id, label, value }) => (
                    <button key={id} type="button" className={`fp-swatch ${frame.color === id ? "on" : ""}`}
                      style={{ background: value }} aria-label={label} title={label} aria-pressed={frame.color === id}
                      onClick={() => onFrameChange({ color: id })} />
                  ))}
                </div>
                <div className="fp-option-row" role="group" aria-label="Frame thickness">
                  {FRAME_WIDTHS.map(({ id, label }) => (
                    <button key={id} type="button" className={`fp-chip ${frame.width === id ? "on" : ""}`}
                      aria-pressed={frame.width === id} onClick={() => onFrameChange({ width: id })}>{label}</button>
                  ))}
                </div>
              </>
            )}
            <button type="button" className="fp-link-btn" onClick={onFrameReset}>Reset frame</button>
            <p className="fp-muted fp-frame-note">The frame is saved in this browser.</p>
          </div>
        </>
      )}

      {error && <p className="fp-feedback error" role="alert">{error}</p>}
      {avatar.message && <p className={`fp-feedback ${avatar.message.type}`} role="status">{avatar.message.text}</p>}
    </section>
  );
}

// "Account settings": e-mail (view only), password and profile photo.
function AccountSettingsModal({ user, avatar, frame, onFrameChange, onFrameReset, onClose, startOn = "email" }) {
  const [section, setSection] = useState(startOn);

  return (
    <Modal eyebrow="MY ACCOUNT" title="Account settings" onClose={onClose} wide>
      <div className="fp-settings">
        <div className="fp-settings-menu" role="tablist" aria-label="Account settings">
          {SECTIONS.map(({ id, label, icon }) => (
            <button key={id} type="button" role="tab" aria-selected={section === id}
              className={`fp-settings-tab ${section === id ? "active" : ""}`} onClick={() => setSection(id)}>
              <Icon name={icon} size={17} /> {label}
            </button>
          ))}
        </div>
        <div className="fp-settings-content">
          {section === "email" && <EmailPanel user={user} />}
          {section === "password" && <PasswordPanel />}
          {section === "photo" && <PhotoPanel user={user} avatar={avatar} frame={frame} onFrameChange={onFrameChange} onFrameReset={onFrameReset} />}
        </div>
      </div>
    </Modal>
  );
}

export default AccountSettingsModal;
