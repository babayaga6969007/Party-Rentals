import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiPhone, FiInstagram, FiMenu } from "react-icons/fi";
import logo from "../../assets/logo.png";

const NavbarTransparent = () => {
  const { pathname } = useLocation();

  // Pages that should have scrolling effect
  const isScrollPage = pathname === "/" || pathname === "/home2";

  const [scrolled, setScrolled] = useState(isScrollPage ? false : true);

  // Scroll behavior
useEffect(() => {
  if (!isScrollPage) {
    // Other pages = always scrolled
    setScrolled(true);
    return;
  }

  const handleScroll = () => {
    // SWITCH ONLY AFTER VIDEO ENDS (after user scrolls past 100vh)
    const heroHeight = window.innerHeight;
    setScrolled(window.scrollY > heroHeight - 150); 
    // -50 gives a smoother transition slightly before the exact end
  };

  // Run once on load
  handleScroll();

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [pathname]);



  return (
    <nav
      className={`
        fixed top-0 left-0 w-full z-50 px-6 transition-all duration-300
        ${scrolled ? "bg-white shadow-md" : "bg-transparent"}
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-30">
        
        {/* LOGO */}
        <Link to="/">
          <img
            src={logo}
            alt="Logo"
            className={`h-20 w-auto transition-all duration-300
              ${
                scrolled
                  ? "filter-none"
                  : "brightness-200 invert"
              }
            `}
          />
        </Link>

        {/* CENTER MENU */}
        <ul
          className={`
            hidden md:flex items-center gap-10 px-6 py-2 rounded-full 
            transition-all duration-300
            ${scrolled ? "bg-transparent" : "bg-white/5 backdrop-blur-lg"}
          `}
        >
          {[
            { to: "/", label: "Home" },
            { to: "/home2", label: "Home2" },
            { to: "/category", label: "Rental Products" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            
            { to: "/faqs", label: "FAQs" },
            { to: "/shop", label: "Shop" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={`transition ${
                scrolled
                  ? "text-[#2D2926] hover:text-[#8B5C42]"
                  : "text-white hover:text-gray-200"
              }`}
            >
              {item.label}
            </NavLink>
          ))}
        </ul>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-5">
          
          {/* Phone */}
          <a
            href="tel:+00000000"
            className={`p-2 rounded-full backdrop-blur-md transition 
              ${scrolled ? "bg-[#8B5C42]" : "bg-white/20 hover:bg-white/40"}
            `}
          >
            <FiPhone
              size={18}
              className={`${scrolled ? "text-white" : "text-white"}`}
            />
          </a>

          {/* Instagram */}
          <a
            href="#"
            className={`p-2 rounded-full backdrop-blur-md transition 
              ${scrolled ? "bg-[#8B5C42]" : "bg-white/20 hover:bg-white/40"}
            `}
          >
            <FiInstagram
              size={18}
              className={`${scrolled ? "text-white" : "text-white"}`}
            />
          </a>

          {/* Mobile Menu */}
          <button
            className={`md:hidden p-2 rounded-full backdrop-blur-md transition 
              ${scrolled ? "bg-[#8B5C42]" : "bg-white/20"}
            `}
          >
            <FiMenu
              size={22}
              className={`${scrolled ? "text-white" : "text-white"}`}
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarTransparent;
