import { Routes, Route } from "react-router-dom";

import AppLayout from "../components/layout/appLayout/AppLayout";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import TopicsPage from "../pages/topics/TopicsPage";
import SearchResultsPage from "../pages/search/SearchResultsPage";
import NotFoundPage from "../pages/notFound/NotFoundPage";

/**
 * All routes live here, in one place, rather than scattered across
 * main.jsx/App.jsx. Adding a new page later is: create it under
 * src/pages, then add one <Route> line below.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="topics" element={<TopicsPage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
