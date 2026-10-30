import httpClient from "./api/httpClient";

// GET /categories -> [{ id, name, researchCount }]   (researchCount = approved files)
export async function getCategories() {
  const { data } = await httpClient.get("/categories");
  return data;
}
