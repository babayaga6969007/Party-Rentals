import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";          // your normal navbar
import Footer from "./Footer";          // make sure this import exists

const Layout = ({ children }) => {
  const { pathname } = useLocation();

  // Hide the normal navbar only on the main Home (video) page
  const hideMainNavbar = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      {!hideMainNavbar && <Navbar />}

      {/* Page content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer always visible */}
      <Footer />
    </div>
  );
};

export default Layout;
