import { ROUTES, researchPath, topicPath } from "../config/constants";

// Where clicking a notification should take the user. Types come from the backend (NotificationType).
export function notificationTarget(notification) {
  switch (notification.type) {
    case "FILE_SUBMITTED":
      return { pathname: ROUTES.adminDashboard, search: "?tab=research" };
    case "FILE_RESULT":
      return { pathname: ROUTES.student, hash: "#my-research" };
    case "NEW_COMMENT": {
      // A comment on a topic, or on a research card.
      const id = notification.relatedEntityId;
      if (!id) return ROUTES.topics;
      return notification.relatedEntityType === "RESEARCH_FILE" ? researchPath(id) : topicPath(id);
    }
    default:
      return ROUTES.home;
  }
}

// Icon and colour variant per notification type (see NotificationBell.css).
export const NOTIFICATION_STYLE = {
  FILE_SUBMITTED: { icon: "▤", variant: "submission" },
  FILE_RESULT: { icon: "✓", variant: "approval" },
  NEW_COMMENT: { icon: "💬", variant: "comment" },
};
