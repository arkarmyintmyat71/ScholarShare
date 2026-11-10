import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "../components/layout/appLayout/AppLayout";
import StudentLayout from "../features/student/components/StudentLayout";
import AdminLayout from "../features/admin/components/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestOnlyRoute from "./GuestOnlyRoute";
import AccountLayout from "./AccountLayout";
import RoleOrPublicLayout from "./RoleOrPublicLayout";
import ScrollManager from "./ScrollManager";
import { ROLES } from "../config/constants";

import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import TopicsPage from "../pages/topics/TopicsPage";
import TopicDetailPage from "../pages/topics/TopicDetailPage";
import ResearchDetailPage from "../pages/research/ResearchDetailPage";
import EditResearchPage from "../pages/research/EditResearchPage";
import ProfilePage from "../pages/profile/ProfilePage";
import PrivacyPage from "../pages/legal/PrivacyPage";
import TermsPage from "../pages/legal/TermsPage";
import NotFoundPage from "../pages/notFound/NotFoundPage";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import AdminDashboardPage from "../pages/admin/dashboard/Dashboard";

/**
 * Every URL in the app is declared here, grouped by who may see it.
 * To add a page: create it under src/pages, then add one <Route> below.
 */
function AppRoutes() {
  return (
    <>
      <ScrollManager />
      <Routes>
        {/* Student area: students only, with the sidebar layout/footer */}
        <Route element={<ProtectedRoute roles={[ROLES.STUDENT]} />}>
          <Route element={<StudentLayout />}>
            <Route path="student" element={<StudentDashboardPage />} />
            <Route path="research/:id/edit" element={<EditResearchPage />} />
          </Route>
        </Route>

        {/* Profile and Topics: any signed-in user, inside the sidebar layout of their role */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AccountLayout />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="topics" element={<TopicsPage />} />
            <Route path="topics/:id" element={<TopicDetailPage />} />
          </Route>
        </Route>

        {/* Admin area: administrators only, same sidebar layout/footer */}
        <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        {/* Pages for everyone: guests see the public header, signed-in users the header of their role */}
        <Route element={<RoleOrPublicLayout />}>
          <Route path="research/:id" element={<ResearchDetailPage />} />
        </Route>

        {/* Login and register: full-screen split pages without the site header/footer.
            Only for signed-out visitors (signed-in users are sent to their dashboard). */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Public site: the main header/footer */}
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          {/* Old addresses: the research list and the categories are sections of the home page now */}
          <Route path="search" element={<Navigate to={{ pathname: "/", hash: "#explore" }} replace />} />
          <Route path="categories" element={<Navigate to={{ pathname: "/", hash: "#explore" }} replace />} />

          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default AppRoutes;
