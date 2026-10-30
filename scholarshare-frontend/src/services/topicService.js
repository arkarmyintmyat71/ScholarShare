import httpClient from "./api/httpClient";

/**
 * GET  /topics?q&page&size       -> { content: [topic], page, size, totalElements, totalPages }
 * GET  /topics/{id}              -> { topic, comments: [comment] }
 * POST /topics { title, body }   -> topic                (students)
 * POST /topics/{id}/comments { body } -> comment         (students)
 *
 * topic   = { id, title, body, createdById, createdByName, createdAt, commentCount }
 * comment = { id, topicId, body, createdById, createdByName, createdAt }
 */
export async function getTopics({ q, page = 0, size } = {}) {
  const { data } = await httpClient.get("/topics", { params: { q: q?.trim() || undefined, page, size } });
  return data;
}

export async function getTopic(id) {
  const { data } = await httpClient.get(`/topics/${id}`);
  return data;
}

export async function createTopic({ title, body }) {
  const { data } = await httpClient.post("/topics", { title, body });
  return data;
}

export async function addComment(topicId, body) {
  const { data } = await httpClient.post(`/topics/${topicId}/comments`, { body });
  return data;
}
