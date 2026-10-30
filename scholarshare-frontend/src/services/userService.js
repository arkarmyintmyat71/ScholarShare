import httpClient from "./api/httpClient";

// PUT /users/me { name, pictureUrl } -> user
export async function updateProfile({ name, pictureUrl }) {
  const { data } = await httpClient.put("/users/me", { name, pictureUrl: pictureUrl ?? "" });
  return data;
}
