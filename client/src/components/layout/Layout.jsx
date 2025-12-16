import { useLocation } from "react-router-dom";
import NavbarTransparent from "./NavbarTransparent";
import Footer from "./Footer";
import FooterDark from "./FooterDark";

const Layout = ({ children }) => {
  const { pathname } = useLocation();

  // ✅ Detect admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">

      {/* ✅ Show Navbar ONLY on non-admin pages */}
      {!isAdminRoute && <NavbarTransparent />}

      {/* Page content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* ✅ Show Footer ONLY on non-admin pages */}
      {!isAdminRoute && (
        ["/about", "/contact"].includes(pathname)
          ? <FooterDark />
          : <Footer />
      )}

    </div>
  );
};

export default Layout;
