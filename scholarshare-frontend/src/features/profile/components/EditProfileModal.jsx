import { useState } from "react";
import { updateProfile } from "../../../services/userService";
import Modal from "./Modal";

// "Edit your profile": name, headline, bio, university and location.
// (The e-mail address is not editable.)
function EditProfileModal({ user, setUser, onClose }) {
  const [form, setForm] = useState({
    name: user.name ?? "",
    headline: user.headline ?? "",
    bio: user.bio ?? "",
    university: user.university ?? "",
    location: user.location ?? "",
  });
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const set = (name) => (event) => setForm((prev) => ({ ...prev, [name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      setUser(await updateProfile({ ...form, name: form.name.trim() }));
      onClose();
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  return (
    <Modal eyebrow="PROFILE" title="Edit your profile" onClose={onClose}>
      <form className="fp-modal-body" onSubmit={handleSubmit}>
        <div className="fp-field">
          <label htmlFor="ep-name">Display name</label>
          <input id="ep-name" required maxLength={100} autoComplete="name" value={form.name} onChange={set("name")} />
        </div>
        <div className="fp-field">
          <label htmlFor="ep-headline">Short headline</label>
          <input id="ep-headline" maxLength={110} placeholder="Computer Science student · Interested in AI"
            value={form.headline} onChange={set("headline")} />
        </div>
        <div className="fp-field">
          <label htmlFor="ep-bio">Bio</label>
          <textarea id="ep-bio" rows={3} maxLength={420} placeholder="Tell the community about yourself"
            value={form.bio} onChange={set("bio")} />
        </div>
        <div className="fp-split">
          <div className="fp-field">
            <label htmlFor="ep-university">University / Organization</label>
            <input id="ep-university" maxLength={90} value={form.university} onChange={set("university")} />
          </div>
          <div className="fp-field">
            <label htmlFor="ep-location">Location</label>
            <input id="ep-location" maxLength={90} value={form.location} onChange={set("location")} />
          </div>
        </div>
        <div className="fp-field">
          <label htmlFor="ep-email">E-mail</label>
          <input id="ep-email" value={user.email} readOnly disabled />
        </div>

        {error && <p className="fp-feedback error" role="alert">{error}</p>}

        <div className="fp-modal-footer">
          <button type="button" className="fp-btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="fp-btn primary" disabled={isSaving || !form.name.trim()}>
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditProfileModal;
