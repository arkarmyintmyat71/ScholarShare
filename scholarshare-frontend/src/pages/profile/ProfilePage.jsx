import { useState } from "react";

import UserAvatar from "../../components/account/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from "../../services/userService";
import { capitalize, dateText } from "../../utils/format";

// /profile - the signed-in user's account. The name and picture link can be changed.
function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, pictureUrl: user.pictureUrl ?? "" });
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setIsSaving(true);
    try {
      const updated = await updateProfile({ name: form.name.trim(), pictureUrl: form.pictureUrl.trim() });
      setUser(updated);
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pg-wrap pg-narrow">
      <section className="pg-card">
        <span className="pg-kicker">MY ACCOUNT</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <UserAvatar name={user.name} pictureUrl={user.pictureUrl} size={64} />
          <div>
            <h1 style={{ fontSize: 26 }}>{user.name}</h1>
            <p className="pg-meta" style={{ margin: "4px 0 0" }}>
              <span>{user.email}</span>
              <span className="pg-badge">{capitalize(user.role.toLowerCase())}</span>
            </p>
          </div>
        </div>
        <p className="pg-meta" style={{ margin: 0 }}>
          <span>Member since {dateText(user.createdAt)}</span>
        </p>
      </section>

      <form className="pg-card pg-form" onSubmit={handleSubmit}>
        <h2>Edit profile</h2>
        <label className="pg-field">
          Name
          <input name="name" value={form.name} onChange={handleChange} maxLength={100} required />
        </label>
        <label className="pg-field">
          Picture link (optional)
          <input
            name="pictureUrl"
            type="url"
            value={form.pictureUrl}
            onChange={handleChange}
            placeholder="https://…"
            maxLength={255}
          />
          <small>Paste the address of an image. Leave empty to use your initials.</small>
        </label>
        <label className="pg-field">
          Email
          <input value={user.email} disabled readOnly />
        </label>

        {message && (
          <p className={`pg-message ${message.type}`} role={message.type === "error" ? "alert" : "status"}>
            {message.text}
          </p>
        )}
        <div>
          <button type="submit" className="pg-btn" disabled={isSaving || !form.name.trim()}>
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
