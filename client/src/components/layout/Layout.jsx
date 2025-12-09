import { useLocation } from "react-router-dom";
import NavbarTransparent from "./NavbarTransparent";
import Footer from "./Footer";
import FooterDark from "./FooterDark";

const Layout = ({ children }) => {
  const { pathname } = useLocation();   // ✅ FIXED: Now pathname exists

  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar */}
      <NavbarTransparent />

      {/* Page content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Dynamic Footer */}
      {["/about", "/contact"].includes(pathname) 
  ? <FooterDark /> 
  : <Footer />
}

    </div>
  );
};

export default Layout;
