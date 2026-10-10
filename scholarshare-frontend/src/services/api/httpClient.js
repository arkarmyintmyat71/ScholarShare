import axios from "axios";

// Every request from every service goes through this one client, so
// the backend's base URL, auth header, and error handling only need
// to be configured in one place.
//
// - In dev, VITE_API_BASE_URL is normally left as "/api" so requests
//   hit Vite's dev server, which proxies them to your Java backend
//   (see server.proxy in vite.config.js). That sidesteps CORS during
//   development even before the backend enables it.
// - In production, set VITE_API_BASE_URL to the backend's real URL
//   (e.g. https://api.scholarshare.com/api), and make sure the Java
//   app's CORS config allows your deployed frontend's origin.
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const httpClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if the user is signed in) to every outgoing
// request. authService stores the token in localStorage on
// login/register; nothing else needs to touch this.
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("scholarshare_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so every page can show a useful message without
// digging through axios's response shape itself.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.request && !error.response
        ? "Couldn't reach the server. Is the backend running?"
        : "Something went wrong. Please try again.");

    return Promise.reject({
      status: error.response?.status ?? null,
      message,
      cause: error,
    });
  }
);

export default httpClient;
