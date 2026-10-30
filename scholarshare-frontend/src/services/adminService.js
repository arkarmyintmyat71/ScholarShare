import httpClient from "./api/httpClient";

// Everything here needs the ADMIN role on the backend (/api/admin/**).

// ---- overview
// GET /admin/stats -> { pendingAccounts, pendingResearch, students, publishedResearch, topics, categories }
export async function getStats() {
  const { data } = await httpClient.get("/admin/stats");
  return data;
}

// ---- accounts
export async function getPendingUsers() {
  const { data } = await httpClient.get("/admin/users/pending");
  return data;
}

// GET /admin/users?status&q&page&size -> page of users
export async function getUsers({ status, q, page = 0, size } = {}) {
  const { data } = await httpClient.get("/admin/users", {
    params: { status: status || undefined, q: q?.trim() || undefined, page, size },
  });
  return data;
}

export const approveUser = (id) => httpClient.put(`/admin/users/${id}/approve`);
export const rejectUser = (id, reason) => httpClient.put(`/admin/users/${id}/reject`, { reason });
export const disableUser = (id) => httpClient.put(`/admin/users/${id}/disable`);

// ---- research review
export async function getPendingResearch() {
  const { data } = await httpClient.get("/admin/research/pending");
  return data;
}

export const approveResearch = (id) => httpClient.put(`/admin/research/${id}/approve`);
export const rejectResearch = (id, reason) => httpClient.put(`/admin/research/${id}/reject`, { reason });

// ---- categories
export const createCategory = (name) => httpClient.post("/admin/categories", { name });
export const renameCategory = (id, name) => httpClient.put(`/admin/categories/${id}`, { name });
export const deleteCategory = (id) => httpClient.delete(`/admin/categories/${id}`);

// ---- moderation
export const deleteTopic = (id) => httpClient.delete(`/admin/topics/${id}`);
export const deleteComment = (id) => httpClient.delete(`/admin/comments/${id}`);
