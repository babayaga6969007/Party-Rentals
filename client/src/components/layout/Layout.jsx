import { useLocation } from "react-router-dom";
import NavbarTransparent from "./NavbarTransparent";
import Footer from "./Footer";
import { ContactFormModalProvider } from "../../context/ContactFormModalContext";
import ContactFormModal from "../ContactFormModal";

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <ContactFormModalProvider>
      <div className="min-h-screen flex flex-col">
        {!isAdminRoute && <NavbarTransparent />}
        <main className="flex-grow">
          {children}
        </main>
        {!isAdminRoute && <Footer />}
      </div>
      <ContactFormModal />
    </ContactFormModalProvider>
  );
};

export default Layout;
