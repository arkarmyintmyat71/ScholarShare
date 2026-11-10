import { monthYear } from "../profileText";
import Icon from "./Icon";

// "Intro" card: bio, university, location, joined and the e-mail (view only).
// The one way to change these details is the "Edit details" button.
export function IntroCard({ user, onEdit }) {
  return (
    <div className="fp-card fp-intro">
      <div className="fp-card-heading">
        <h2>Intro</h2>
      </div>
      <p className="fp-bio">{user.bio || "Add a short bio so other students can get to know you."}</p>
      <div className="fp-intro-items">
        {user.university && (
          <p><Icon name="school" size={20} /><span>Studies at <strong>{user.university}</strong></span></p>
        )}
        {user.location && (
          <p><Icon name="location" size={20} /><span>Based in <strong>{user.location}</strong></span></p>
        )}
        <p><Icon name="calendar" size={20} /><span>Joined <strong>{monthYear(user.createdAt)}</strong></span></p>
        <p><Icon name="mail" size={20} /><span><strong>{user.email}</strong></span></p>
      </div>
      <button type="button" className="fp-btn soft block" onClick={onEdit}>Edit details</button>
    </div>
  );
}
