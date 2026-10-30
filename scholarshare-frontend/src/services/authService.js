import httpClient from "./api/httpClient";
import { STORAGE_KEYS } from "../config/constants";

/**
 * POST /auth/login     { email, password }        -> { accessToken, user }
 * POST /auth/register  { name, email, password }  -> user (status PENDING, no token: an admin must approve first)
 * GET  /auth/me                                   -> user
 *
 * user = { id, name, email, pictureUrl, role: "STUDENT" | "ADMIN", accountStatus, createdAt }
 */

export async function login({ email, password }) {
  const { data } = await httpClient.post("/auth/login", { email, password });
  localStorage.setItem(STORAGE_KEYS.token, data.accessToken);
  return data.user;
}

// Does NOT sign anyone in. Resolves with the pending user and the server's message.
export async function register({ name, email, password }) {
  const response = await httpClient.post("/auth/register", { name, email, password });
  return { user: response.data, message: response.message };
}

export async function fetchCurrentUser() {
  const { data } = await httpClient.get("/auth/me");
  return data;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.token);
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}
