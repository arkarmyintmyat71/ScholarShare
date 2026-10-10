import httpClient from "./api/httpClient";

/**
 * Expected Java backend contract (adjust to match your real API):
 *
 *   GET /api/research/search?q=<term>  -> [{ id, tag, title, description, image }]
 *   GET /api/categories                -> [{ label, slug }]
 *   GET /api/topics                    -> [{ id, tag, title, description, comments }]
 */

export async function searchResearch(query) {
  const { data } = await httpClient.get("/research/search", {
    params: { q: query },
  });
  return data;
}

export async function getCategories() {
  const { data } = await httpClient.get("/categories");
  return data;
}

export async function getTopics() {
  const { data } = await httpClient.get("/topics");
  return data;
}
