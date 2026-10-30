// Single home for values used in more than one place.
// Nothing here should import from the rest of the app.

export const STORAGE_KEYS = {
  token: "scholarshare_token",
};

export const AUTH_EVENTS = {
  // Fired by httpClient when the backend answers 401, so AuthContext can sign out.
  unauthorized: "scholarshare:unauthorized",
};

export const ROLES = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
};

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  categories: "/categories",
  topics: "/topics",
  search: "/search",
  profile: "/profile",
  student: "/student",
  adminDashboard: "/admin/dashboard",
};

// Paths that need an id.
export const researchPath = (id) => `/research/${id}`;
export const topicPath = (id) => `/topics/${id}`;

// Must match the backend (UploadValidator): 10 MB, these extensions.
export const UPLOAD_RULES = {
  maxSizeBytes: 10 * 1024 * 1024,
  extensions: ["pdf", "doc", "docx", "ppt", "pptx"],
  accept: ".pdf,.doc,.docx,.ppt,.pptx",
};

// Values the backend uses for a research file's review status.
export const RESEARCH_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

// Page sizes for lists.
export const PAGE_SIZE = {
  research: 9,
  explore: 6,
  topics: 8,
  users: 8,
};
