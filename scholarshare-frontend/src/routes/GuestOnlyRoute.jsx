import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { homeRouteForUser } from "../utils/roles";

/**
 * Wrap pages that only make sense for someone who is NOT signed in (login, register).
 * A signed-in user who opens them is sent to their own dashboard instead.
 */
function GuestOnlyRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <p className="status-message">Loading…</p>;
  if (isAuthenticated) return <Navigate to={homeRouteForUser(user)} replace />;
  return <Outlet />;
}

export default GuestOnlyRoute;
