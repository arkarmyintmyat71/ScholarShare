import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../config/constants";
import { homeRouteForUser, normalizeRole } from "../utils/roles";

/**
 * Wrap routes that need a signed-in user. Optionally pass `roles` to
 * restrict them (e.g. roles={[ROLES.ADMIN]}). Everyone else is sent to
 * login (remembering where they wanted to go) or to their own home.
 *
 * NOTE: this only hides pages in the UI. The Spring Boot API must still
 * enforce permissions on every endpoint.
 */
function ProtectedRoute({ roles }) {
  const { user, isAuthenticated, isLoading, hasSignedOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p className="status-message">Loading…</p>;
  }

  if (!isAuthenticated) {
    // Deliberate sign-out: go home rather than to login with this page remembered.
    if (hasSignedOut) return <Navigate to={ROUTES.home} replace />;
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={ROUTES.login} replace state={{ from }} />;
  }

  if (roles && !roles.includes(normalizeRole(user.role))) {
    return <Navigate to={homeRouteForUser(user)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
