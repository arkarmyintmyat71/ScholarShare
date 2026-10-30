import { ROUTES, topicPath } from "../config/constants";

// Where clicking a notification should take the user. Types come from the backend (NotificationType).
export function notificationTarget(notification) {
  switch (notification.type) {
    case "REGISTRATION_SUBMITTED":
      return { pathname: ROUTES.adminDashboard, search: "?tab=accounts" };
    case "FILE_SUBMITTED":
      return { pathname: ROUTES.adminDashboard, search: "?tab=research" };
    case "FILE_RESULT":
      return { pathname: ROUTES.student, hash: "#my-research" };
    case "NEW_COMMENT":
      return notification.relatedEntityId ? topicPath(notification.relatedEntityId) : ROUTES.topics;
    default:
      return ROUTES.home;
  }
}

// Icon and colour variant per notification type (see NotificationBell.css).
export const NOTIFICATION_STYLE = {
  REGISTRATION_SUBMITTED: { icon: "👤", variant: "submission" },
  REGISTRATION_RESULT: { icon: "✓", variant: "approval" },
  FILE_SUBMITTED: { icon: "▤", variant: "submission" },
  FILE_RESULT: { icon: "✓", variant: "approval" },
  NEW_COMMENT: { icon: "💬", variant: "comment" },
};
