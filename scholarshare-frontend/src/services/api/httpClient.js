import axios from "axios";
import { AUTH_EVENTS, STORAGE_KEYS } from "../../config/constants";

// Every request from every service goes through this one client, so the base
// URL, auth header and error handling are configured in one place.
//
// - In dev, VITE_API_BASE_URL is normally "/api": requests hit Vite's dev
//   server, which proxies them to Spring Boot (server.proxy in vite.config.js),
//   so CORS is not involved.
// - In production, set VITE_API_BASE_URL to the real backend URL
//   (e.g. https://api.scholarshare.com/api) and allow your site in app.cors.allowed-origins.
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const httpClient = axios.create({ baseURL });

// Attach the JWT (if signed in) to every outgoing request.
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The backend wraps every JSON answer as { success, message, data }.
// Unwrap it here, so services and components only ever see `data`.
function isEnvelope(body) {
  return body !== null && typeof body === "object" && typeof body.success === "boolean";
}

// An error body can arrive as a Blob (when a file download fails). Read it as JSON.
async function readErrorBody(response) {
  const body = response?.data;
  if (body instanceof Blob) {
    try {
      return JSON.parse(await body.text());
    } catch {
      return null;
    }
  }
  return body;
}

httpClient.interceptors.response.use(
  (response) => {
    if (isEnvelope(response.data)) {
      response.message = response.data.message;
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    // An expired/invalid token on a normal request: drop it and tell the app
    // (AuthContext listens) so the user is signed out. A 401 from login itself
    // only means "wrong e-mail or password".
    const isLoginCall = error.config?.url?.startsWith("/auth/login");
    if (error.response?.status === 401 && !isLoginCall && localStorage.getItem(STORAGE_KEYS.token)) {
      localStorage.removeItem(STORAGE_KEYS.token);
      window.dispatchEvent(new Event(AUTH_EVENTS.unauthorized));
    }

    const body = await readErrorBody(error.response);

    const message =
      body?.message ||
      (error.request && !error.response
        ? "Couldn't reach the server. Is the backend running?"
        : "Something went wrong. Please try again.");

    return Promise.reject({
      status: error.response?.status ?? null,
      message,
      details: body?.data ?? null, // e.g. { accountStatus: "PENDING" } on a refused login
      cause: error,
    });
  }
);

export default httpClient;
