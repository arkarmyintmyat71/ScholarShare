import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDismiss } from "../../hooks/useDismiss";
import { countText, timeAgo } from "../../utils/format";
import { NOTIFICATION_STYLE, notificationTarget } from "../../utils/notificationTarget";
import { useNotifications } from "../../hooks/useNotifications";
import "./NotificationBell.css";

// Bell button with an unread badge and a dropdown list of notifications.
function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const navigate = useNavigate();
  const rootRef = useRef(null);

  const close = () => setIsOpen(false);
  useDismiss(rootRef, close, isOpen);

  const shown = notifications.filter((n) => filter === "all" || !n.read);

  const openNotification = (notification) => {
    markRead(notification.id);
    close();
    navigate(notificationTarget(notification));
  };

  return (
    <div className="sd-notify" ref={rootRef}>
      <button
        type="button"
        className="sd-bell"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unreadCount > 0 && (
          <span className="sd-badge" aria-label={`${unreadCount} unread notifications`}>
            {countText(unreadCount)}
          </span>
        )}
      </button>

      {isOpen && (
        <div id="notification-panel" className="sd-notify-panel" role="dialog" aria-label="Notifications">
          <div className="sd-notify-head">
            <h3>Notifications</h3>
            <button type="button" className="sd-notify-close" aria-label="Close notifications" onClick={close}>
              ×
            </button>
          </div>

          <div className="sd-notify-controls">
            <div className="sd-notify-tabs" role="group" aria-label="Filter notifications">
              {["all", "unread"].map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`sd-notify-tab ${filter === name ? "active" : ""}`}
                  aria-pressed={filter === name}
                  onClick={() => setFilter(name)}
                >
                  {name === "all" ? "All" : "Unread"}
                </button>
              ))}
            </div>
            <button type="button" className="sd-mark-all" disabled={unreadCount === 0} onClick={markAllRead}>
              Mark all as read
            </button>
          </div>

          <div className="sd-notify-list" aria-live="polite">
            {shown.length === 0 && (
              <p className="sd-notify-empty">You’re all caught up! No notifications here.</p>
            )}
            {shown.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`sd-notify-item ${n.read ? "" : "unread"}`}
                onClick={() => openNotification(n)}
              >
                <span className={`sd-notify-type ${NOTIFICATION_STYLE[n.type]?.variant ?? ""}`}>
                  {NOTIFICATION_STYLE[n.type]?.icon ?? "●"}
                </span>
                <span className="sd-notify-text">
                  <span>{n.message}</span>
                  <small>{timeAgo(n.createdAt)}</small>
                </span>
                {!n.read && <span className="sd-unread-dot" aria-label="Unread" />}
              </button>
            ))}
          </div>

          <div className="sd-notify-foot">Latest 50 notifications · ScholarShare</div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
