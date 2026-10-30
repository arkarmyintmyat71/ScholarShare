import { Routes, Route } from "react-router-dom";

import AppLayout from "../components/layout/appLayout/AppLayout";
import StudentLayout from "../features/student/components/StudentLayout";
import AdminLayout from "../features/admin/components/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import ScrollManager from "./ScrollManager";
import { ROLES } from "../config/constants";

import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import TopicsPage from "../pages/topics/TopicsPage";
import TopicDetailPage from "../pages/topics/TopicDetailPage";
import ResearchDetailPage from "../pages/research/ResearchDetailPage";
import ProfilePage from "../pages/profile/ProfilePage";
import SearchResultsPage from "../pages/search/SearchResultsPage";
import ComingSoonPage from "../pages/comingSoon/ComingSoonPage";
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
        {/* Student area: students only, with the dashboard header/footer */}
        <Route element={<ProtectedRoute roles={[ROLES.STUDENT]} />}>
          <Route element={<StudentLayout />}>
            <Route path="student" element={<StudentDashboardPage />} />
          </Route>
        </Route>

        {/* Admin area: administrators only, same dashboard header/footer */}
        <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        {/* Public site: the main header/footer */}
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="research/:id" element={<ResearchDetailPage />} />

          {/* Any signed-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="topics" element={<TopicsPage />} />
            <Route path="topics/:id" element={<TopicDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="forgot-password" element={<ComingSoonPage title="Forgot password" />} />
          <Route path="privacy" element={<ComingSoonPage title="Privacy policy" />} />
          <Route path="terms" element={<ComingSoonPage title="Terms of use" />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default AppRoutes;
