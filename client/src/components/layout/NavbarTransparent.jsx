import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiPhone, FiInstagram, FiMenu } from "react-icons/fi";

import logo from "../../assets/logo.png"; // your existing logo

const NavbarTransparent = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  className={`
    h-20 w-auto transition-all duration-300
    ${scrolled ? "filter-none" : "brightness-200 invert"}
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

          <NavLink
  to="/"
  className={`${scrolled ? "text-[#2D2926] hover:text-[#8B5C42]" : "text-white hover:text-gray-200"} transition`}
>
  Home
</NavLink>
<NavLink
  to="/home2"
  className={`${scrolled ? "text-[#2D2926] hover:text-[#8B5C42]" : "text-white hover:text-gray-200"} transition`}
>
  Home2
</NavLink>
<NavLink
  to="/category"
  className={`${scrolled ? "text-[#2D2926] hover:text-[#8B5C42]" : "text-white hover:text-gray-200"} transition`}
>
  Category
</NavLink>

<NavLink
  to="/about"
  className={`${scrolled ? "text-[#2D2926] hover:text-[#8B5C42]" : "text-white hover:text-gray-200"} transition`}
>
  About
</NavLink>
<NavLink
  to="/contact"
  className={`${scrolled ? "text-[#2D2926] hover:text-[#8B5C42]" : "text-white hover:text-gray-200"} transition`}
>
  Contact
</NavLink>
<NavLink
  to="/product/1"
  className={`${scrolled ? "text-[#2D2926] hover:text-[#8B5C42]" : "text-white hover:text-gray-200"} transition`}
>
  Product
</NavLink>
<NavLink
  to="/faqs"
  className={`${scrolled ? "text-[#2D2926] hover:text-[#8B5C42]" : "text-white hover:text-gray-200"} transition`}
>
  FAQs
</NavLink>
         
        </ul>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-5">

        {/* Phone */}
        <a
            href="tel:+00000000"
            className={`p-2 rounded-full backdrop-blur-md transition 
            ${scrolled ? "bg-[#8B5C42]" : "bg-white/20 hover:bg-white/40"}`}
        >
            <FiPhone
            size={18}
            className={`${scrolled ? "text-white" : "text-white drop-shadow"}`}
            />
        </a>

        {/* Instagram */}
        <a
            href="#"
            className={`p-2 rounded-full backdrop-blur-md transition 
            ${scrolled ? "bg-[#8B5C42]" : "bg-white/20 hover:bg-white/40"}`}
        >
            <FiInstagram
            size={18}
            className={`${scrolled ? "text-white" : "text-white drop-shadow"}`}
            />
        </a>

        {/* Mobile Menu */}
        <button
            className={`md:hidden p-2 rounded-full backdrop-blur-md transition 
            ${scrolled ? "bg-[#8B5C42]" : "bg-white/20"}`}
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
