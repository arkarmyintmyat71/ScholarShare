// Photos (profile pictures, category photos) are served by the backend and the API sends them as relative
// paths like "/users/5/avatar?v=123". The browser needs the API address in front of them.
// Absolute links (https://...) and bundled images pass through unchanged.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export function mediaUrl(path) {
  if (!path) return null;
  return path.startsWith("/") ? `${API_BASE}${path}` : path;
}
