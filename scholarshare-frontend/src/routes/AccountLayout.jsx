import { useAuth } from "../hooks/useAuth";
import { isAdmin } from "../utils/roles";
import AdminLayout from "../features/admin/components/AdminLayout";
import StudentLayout from "../features/student/components/StudentLayout";

// Pages every signed-in user has (the profile) use the sidebar layout of their own role.
function AccountLayout() {
  const { user } = useAuth();
  return isAdmin(user) ? <AdminLayout /> : <StudentLayout />;
}

export default AccountLayout;
