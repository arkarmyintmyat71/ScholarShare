import { useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "../../components/confirmDialog/ConfirmDialog";
import StatusBlock from "../../components/StatusBlock";
import { ROUTES } from "../../config/constants";
import AccountSettingsModal from "../../features/profile/components/AccountSettingsModal";
import EditProfileModal from "../../features/profile/components/EditProfileModal";
import { IntroCard } from "../../features/profile/components/IntroCards";
import ProfileHeader from "../../features/profile/components/ProfileHeader";
import ResearchItem from "../../features/profile/components/ResearchItem";
import { useAvatarFrame } from "../../features/profile/avatarFrame";
import { useAvatar } from "../../features/profile/useAvatar";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { deleteResearch, getMyResearch } from "../../services/researchService";
import { isStudent } from "../../utils/roles";
import "../../features/profile/profile.css";

// /profile - one page: framed photo + name, the Intro card (with "Edit details") and the student's own research.
// The e-mail is only shown, never edited.
function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const student = isStudent(user);

  const research = useAsync(getMyResearch, [], { enabled: student });
  const avatar = useAvatar(setUser);
  const [frame, updateFrame, resetFrame] = useAvatarFrame(user.id);

  const [modal, setModal] = useState(null); // "edit" | "settings" | "signout"
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState(null);

  const confirmDelete = async () => {
    const item = toDelete;
    setToDelete(null);
    setActionError(null);
    try {
      await deleteResearch(item.id);
      research.setData((prev) => (prev ?? []).filter((r) => r.id !== item.id));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const list = research.data ?? [];
  const approved = list.filter((r) => r.status === "APPROVED").length;
  const stats = student && research.data
    ? `${list.length} research ${list.length === 1 ? "submission" : "submissions"} · ${approved} approved`
    : null;

  return (
    <div className="fp-page">
      <ProfileHeader
        user={user}
        avatar={avatar}
        frame={frame}
        stats={stats}
        onSettings={() => setModal("settings")}
        onSignOut={() => setModal("signout")}
      />

      <div className="fp-content">
        {actionError && <p className="fp-feedback error" role="alert">{actionError}</p>}
        <div className="fp-grid">
          <aside className="fp-left" aria-label="Profile introduction">
            <IntroCard user={user} onEdit={() => setModal("edit")} />
          </aside>

          <section className="fp-feed" aria-label="My research">
            <div className="fp-feed-heading">
              <h2>{student ? "My research" : "Administrator account"}</h2>
            </div>

            {!student && (
              <div className="fp-empty">
                <h3>You are signed in as an administrator</h3>
                <p>Review accounts and research from the admin dashboard.</p>
                <Link className="fp-btn primary" to={ROUTES.adminDashboard}>Open admin dashboard</Link>
              </div>
            )}

            {student && (
              <>
                <StatusBlock isLoading={research.isLoading && !research.data} error={research.error} onRetry={research.reload} />
                {research.data && list.length === 0 && (
                  <div className="fp-empty">
                    <h3>No research yet</h3>
                    <p>Share your first paper with the community.</p>
                    <Link className="fp-btn primary" to={`${ROUTES.student}#upload`}>Submit research</Link>
                  </div>
                )}
                <div className="fp-stack">
                  {list.map((r) => <ResearchItem key={r.id} research={r} onDelete={setToDelete} />)}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {modal === "edit" && <EditProfileModal user={user} setUser={setUser} onClose={() => setModal(null)} />}
      {modal === "settings" && <AccountSettingsModal user={user} avatar={avatar} frame={frame} onFrameChange={updateFrame} onFrameReset={resetFrame} onClose={() => setModal(null)} />}

      {modal === "signout" && (
        <ConfirmDialog
          title="Sign out of ScholarShare?"
          message="You'll need to sign in again to share research and see your saved items."
          confirmLabel="Sign out"
          onConfirm={logout}
          onCancel={() => setModal(null)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title={`Delete "${toDelete.title}"?`}
          message="The file, its likes and its comments will be removed for good."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
