import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/layout/appLayout/AppLayout";
import AccountLayout from "./AccountLayout";

/**
 * For pages that guests AND members may open (e.g. a research page):
 * signed-in users get the header of their own role (student: bell + My Research; admin: admin header),
 * guests get the public header.
 */
function RoleOrPublicLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <p className="status-message">Loading…</p>;
  return isAuthenticated ? <AccountLayout /> : <AppLayout />;
}

export default RoleOrPublicLayout;
