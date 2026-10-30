import { useCallback, useEffect } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import { useAsync } from "./useAsync";

const REFRESH_EVERY_MS = 60_000; // new notifications show up within a minute, without a page reload

// The signed-in user's inbox (GET /notifications) with mark-as-read.
export function useNotifications() {
  const { data, setData, reload } = useAsync(getNotifications, []);
  const notifications = data ?? [];

  useEffect(() => {
    const timer = setInterval(reload, REFRESH_EVERY_MS);
    return () => clearInterval(timer);
  }, [reload]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Update the screen first, then tell the server; if that fails, load the real state again.
  const markRead = useCallback(
    (id) => {
      setData((prev) => (prev ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)));
      markNotificationRead(id).catch(reload);
    },
    [setData, reload]
  );

  const markAllRead = useCallback(() => {
    setData((prev) => (prev ?? []).map((n) => ({ ...n, read: true })));
    markAllNotificationsRead().catch(reload);
  }, [setData, reload]);

  return { notifications, unreadCount, markRead, markAllRead };
}
