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

      {/* Navbar (still visible everywhere — change later if needed) */}
      <NavbarTransparent />

      {/* Page content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* ✅ Footer logic */}
      {!isAdminRoute && (
        ["/about", "/contact"].includes(pathname)
          ? <FooterDark />
          : <Footer />
      )}

    </div>
  );
};

export default Layout;
