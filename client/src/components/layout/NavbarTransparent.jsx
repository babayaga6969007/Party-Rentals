import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiMail, FiInstagram, FiMenu, FiShoppingCart } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { useCart } from "../../context/CartContext";

const NavbarTransparent = () => {
  const { pathname } = useLocation();
  const pageTitleMap = {
  "/": "Home",
  "/category": "Rental Products",
  "/about": "About",
  "/contact": "Contact",
  "/faqs": "FAQs",
  "/shop": "Shop",
  "/cart": "Your Cart",
};

const currentPageTitle =
  pageTitleMap[pathname] || "Page";

  const isScrollPage = pathname === "/";
const iconHoverClass =
  "transition-transform duration-200 ease-out hover:scale-110 active:scale-95";

  /* ======================
     CART STATE (TOP LEVEL)
  ====================== */
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const [animateCart, setAnimateCart] = useState(false);

  /* ======================
     UI STATE
  ====================== */
  const [scrolled, setScrolled] = useState(!isScrollPage);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ======================
     CART POP ANIMATION
  ====================== */
  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  /* ======================
     SCROLL EFFECT
  ====================== */
  useEffect(() => {
    if (!isScrollPage) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setScrolled(window.scrollY > heroHeight - 150);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, isScrollPage]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 px-6 transition-all duration-300
        ${scrolled ? "bg-white shadow-none" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-30">

        {/* LOGO */}
        <Link to="/">
          <img
            src={logo}
            alt="Logo"
            className={`h-20 transition-all duration-300 ${
              scrolled ? "" : "brightness-200 invert"
            }`}
          />
        </Link>
        


        {/* CENTER MENU */}
        <ul
          className={`hidden md:flex items-center gap-10 px-6 py-2 rounded-full
            ${scrolled ? "" : "bg-white/5 backdrop-blur-lg"}`}
        >
          {[
            { to: "/", label: "Home" },
            { to: "/category", label: "Rental Products" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            { to: "/faqs", label: "FAQs" },
            { to: "/shop", label: "Shop" },
          ].map((item) => (
<NavLink
  key={item.to}
  to={item.to}
  className={({ isActive }) =>
    `group relative transition-all duration-200
     ${
       scrolled
         ? "text-[#2D2926] hover:text-[#8B5C42]"
         : "text-white hover:text-gray-200"
     }
     ${isActive ? "font-semibold" : ""}
    `
  }
>


              <span className="relative">
  {item.label}
  <span
    className={`absolute left-0 -bottom-1 h-[2px] w-0 bg-[#8B5C42]
      transition-all duration-300
      group-hover:w-full`}
  />
</span>

            </NavLink>
          ))}
        </ul>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-5">

         <a
  href="mailto:hello@newprojectdesigns.com"
  className={`p-2 rounded-full ${iconHoverClass}
    ${scrolled ? "bg-black" : "bg-white/20 hover:bg-white/40"}`}
>

            <FiMail size={18} className="text-white" />
          </a>

         <a
  href="#"
  className={`p-2 rounded-full ${iconHoverClass}
    ${scrolled ? "bg-black" : "bg-white/20 hover:bg-white/40"}`}
>

            <FiInstagram size={18} className="text-white" />
          </a>

          {/* CART ICON */}
          <Link
            to="/cart"
            className={`relative p-2 rounded-full transition-transform
              ${animateCart ? "scale-125" : "hover:scale-110"}
              ${scrolled ? "bg-black" : "bg-white/20"}`}
          >
            <FiShoppingCart size={20} className="text-white" />

            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px]
                text-[11px] font-bold bg-red-600 text-white rounded-full
                flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

          {/* CUSTOM ENQUIRY */}
          <Link
  to="/contact"
  className={`hidden md:block px-5 py-2 rounded-full text-sm font-medium
    transition-all duration-200 ease-out
    hover:scale-105 active:scale-95
    ${scrolled
      ? "bg-black text-white hover:bg-[#222]"
      : "bg-white/20 text-white hover:bg-white/40"}
  `}
>

            Custom Inquiry
          </Link>

          {/* MOBILE MENU */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-full ${
              scrolled ? "bg-black" : "bg-white/20"
            }`}
          >
            <FiMenu size={22} className="text-white" />
          </button>
        </div>
      </div>
      {/* MOBILE MENU PANEL */}
{mobileOpen && (
  <div className="md:hidden mt-3 mx-4 rounded-2xl bg-white shadow-lg overflow-hidden">
    <ul className="flex flex-col divide-y">
      {[
        { to: "/", label: "Home" },
        { to: "/category", label: "Rental Products" },
        { to: "/shop", label: "Shop" },
        { to: "/about", label: "About" },
        { to: "/contact", label: "Contact" },
        { to: "/faqs", label: "FAQs" },
        { to: "/cart", label: "Cart" },
      ].map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setMobileOpen(false)}
          className="px-5 py-4 text-[#2D2926] font-medium hover:bg-gray-100"
        >
          {item.label}
        </NavLink>
      ))}
    </ul>
  </div>
)}

   

    </nav>
  );
};

export default NavbarTransparent;
