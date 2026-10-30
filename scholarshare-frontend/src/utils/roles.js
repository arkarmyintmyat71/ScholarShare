import { ROLES, ROUTES } from "../config/constants";

// Spring Security often prefixes roles with "ROLE_" — accept both forms.
export function normalizeRole(role) {
  if (!role) return null;
  return String(role).toUpperCase().replace(/^ROLE_/, "");
}

export function isAdmin(user) {
  return normalizeRole(user?.role) === ROLES.ADMIN;
}

export function isStudent(user) {
  return normalizeRole(user?.role) === ROLES.STUDENT;
}

// Where a user lands after signing in (or when they click "Dashboard").
export function homeRouteForUser(user) {
  return isAdmin(user) ? ROUTES.adminDashboard : ROUTES.student;
}
