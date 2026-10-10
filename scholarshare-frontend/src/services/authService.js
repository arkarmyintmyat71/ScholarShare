import httpClient from "./api/httpClient";

const TOKEN_KEY = "scholarshare_token";

/**
 * Expected Java backend contract (adjust to match your real API):
 *
 *   POST /api/auth/login    { email, password }  -> { token, user }
 *   POST /api/auth/register { name, email, password } -> { token, user }
 *   GET  /api/auth/me       (Authorization: Bearer <token>) -> user
 *
 * Where `user` is whatever shape your backend returns, e.g.
 *   { id, name, email, role }
 */

export async function login({ email, password }) {
  const { data } = await httpClient.post("/auth/login", { email, password });
  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data;
}

export async function register({ name, email, password }) {
  const { data } = await httpClient.post("/auth/register", {
    name,
    email,
    password,
  });
  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await httpClient.get("/auth/me");
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
