import NavbarTransparent from "./NavbarTransparent"; 
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Always show transparent navbar */}
      <NavbarTransparent />

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
