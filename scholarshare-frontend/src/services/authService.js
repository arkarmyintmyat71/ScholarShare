import httpClient from "./api/httpClient";
import { STORAGE_KEYS } from "../config/constants";

/**
 * POST /auth/login     { email, password }        -> { accessToken, user }
 * POST /auth/register  { name, email, password }  -> { accessToken, user }   (no approval step: the account works at once)
 * POST /auth/google    { idToken }                -> { accessToken, user }   (same as login; a new Google user is created and signed in at once)
 * GET  /auth/me                                   -> user
 *
 * user = { id, name, email, pictureUrl, role: "STUDENT" | "ADMIN", accountStatus, createdAt }
 */

export async function login({ email, password }) {
  const { data } = await httpClient.post("/auth/login", { email, password });
  setToken(data.accessToken);
  return data.user;
}

export async function loginWithGoogle(idToken) {
  const { data } = await httpClient.post("/auth/google", { idToken });
  setToken(data.accessToken);
  return data.user;
}

// Creates the account and signs the student in (same answer as login).
export async function register({ name, email, password }) {
  const { data } = await httpClient.post("/auth/register", { name, email, password });
  setToken(data.accessToken);
  return data.user;
}

export async function fetchCurrentUser() {
  const { data } = await httpClient.get("/auth/me");
  return data;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.token);
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}
