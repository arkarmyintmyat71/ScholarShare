import httpClient from "./api/httpClient";

/**
 * GET /notifications               -> [{ id, type, message, relatedEntityType, relatedEntityId, read, createdAt }]
 * GET /notifications/unread-count  -> { count }
 * PUT /notifications/{id}/read
 * PUT /notifications/read-all
 */
export async function getNotifications() {
  const { data } = await httpClient.get("/notifications");
  return data;
}

export async function markNotificationRead(id) {
  await httpClient.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await httpClient.put("/notifications/read-all");
}
