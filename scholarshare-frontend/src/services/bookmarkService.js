import httpClient from "./api/httpClient";

/**
 * GET    /bookmarks          -> [research]  (the student's saved library)
 * PUT    /bookmarks/{id}     -> save
 * DELETE /bookmarks/{id}     -> remove
 */
export async function getBookmarks() {
  const { data } = await httpClient.get("/bookmarks");
  return data;
}

export async function saveBookmark(researchId) {
  await httpClient.put(`/bookmarks/${researchId}`);
}

export async function removeBookmark(researchId) {
  await httpClient.delete(`/bookmarks/${researchId}`);
}
