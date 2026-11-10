import httpClient from "./api/httpClient";

/**
 * The signed-in user's own account.
 *   PUT    /users/me           { name, headline, bio, university, location }  -> user
 *   PUT    /users/me/password  { currentPassword, newPassword }
 *   POST   /users/me/avatar    multipart "file" (image, 2 MB)  -> user
 *   DELETE /users/me/avatar                                    -> user
 * The e-mail address can only be viewed, never changed.
 */
export async function updateProfile(details) {
  const { data } = await httpClient.put("/users/me", details);
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  await httpClient.put("/users/me/password", { currentPassword, newPassword });
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await httpClient.post("/users/me/avatar", form);
  return data;
}

export async function removeAvatar() {
  const { data } = await httpClient.delete("/users/me/avatar");
  return data;
}
