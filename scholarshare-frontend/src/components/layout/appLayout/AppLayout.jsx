import { Outlet } from "react-router-dom";

import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

/**
 * Shared shell for every route: Navbar and Footer render once here
 * instead of being repeated in each page, and <Outlet /> swaps in
 * whichever page matched in routes/AppRoutes.jsx.
 */
function AppLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default AppLayout;
