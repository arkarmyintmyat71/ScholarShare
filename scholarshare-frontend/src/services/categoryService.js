import httpClient from "./api/httpClient";

// GET /categories -> [{ id, name, researchCount, imageUrl }]   (researchCount = approved files, imageUrl = photo or null)
export async function getCategories() {
  const { data } = await httpClient.get("/categories");
  return data;
}
