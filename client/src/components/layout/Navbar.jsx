import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiFacebook, FiInstagram, FiLinkedin, FiMenu } from "react-icons/fi";
import logo from "../../assets/logo.png";


const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full shadow-sm bg-white">

      {/* TOP BAR */}
<div className="w-full bg-[#8B5C42] text-white py-2 px-4 sm:px-6 md:px-10 lg:px-16 text-sm flex justify-between items-center">
        {/* Left: Contact details */}
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <FiPhone size={14} /> +61 XXX XXX XXX
          </span>
          <span className="flex items-center gap-2">
            <FiMail size={14} /> contact@partyrentals.au
          </span>
        </div>

        {/* Right: Social icons */}
        <div className="flex items-center gap-4">
          <FiFacebook className="cursor-pointer hover:text-[#8B5C42]" />
          <FiInstagram className="cursor-pointer hover:text-[#8B5C42]" />
          <FiLinkedin className="cursor-pointer hover:text-[#8B5C42]" />
        </div>
      </div>

      {/* MAIN NAVBAR */}
<nav className="w-full bg-white py-2 md:py-6 lg:py-6 px-4 sm:px-6 md:px-10 lg:px-16 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center">
        <img 
          src={logo} 
          alt="Logo" 
          className="h-20 w-auto md:h-22 object-contain"
        />
      </Link>


        {/* Center Menu Items (desktop only) */}
<ul className="hidden md:flex items-center gap-14 text-lg text-[#2D2926] font-medium mx-auto">

          <li><Link to="/" className="hover:text-[#8B5C42]">Home</Link></li>
          <li><Link to="/about" className="hover:text-[#8B5C42]">About Us</Link></li>
          <li><Link to="/faqs" className="hover:text-[#8B5C42]">FAQs</Link></li>
          <li><Link to="/contact" className="hover:text-[#8B5C42]">Contact Us</Link></li>
          <li><Link to="/reservation" className="hover:text-[#8B5C42]">Make a Reservation</Link></li>
          <li>
  <a href="/home2" className="hover:text-[#8B5C42]">Home 2</a>
</li>
        </ul>
        
        <div className="hidden md:block">
  <button className="bg-[#8B5C42] text-white px-5 py-2 rounded-lg hover:bg-[#704A36] transition">
    WhatsApp
  </button>
</div>


        {/* Hamburger for mobile */}
        <button
          className="md:hidden text-[#2D2926]"
          onClick={() => setOpen(!open)}
        >
          <FiMenu size={28} />
        </button>
      </nav>

      {/* MOBILE DROPDOWN MENU */}
      {open && (
        <div className="md:hidden bg-[#FAF7F5] border-t border-[#D9C7BE] py-4 px-8 space-y-4 text-[#2D2926]">

          <Link to="/" onClick={() => setOpen(false)} className="block hover:text-[#8B5C42]">
            Home
          </Link>

          <Link to="/about" onClick={() => setOpen(false)} className="block hover:text-[#8B5C42]">
            About Us
          </Link>

          <Link to="/faqs" onClick={() => setOpen(false)} className="block hover:text-[#8B5C42]">
            FAQs
          </Link>

          <Link to="/contact" onClick={() => setOpen(false)} className="block hover:text-[#8B5C42]">
            Contact Us
          </Link>

          {/* Extra items (optional) */}
          <div className="pt-3 border-t border-[#D9C7BE] text-sm text-[#2D2926]/70">
            <p className="hover:text-[#8B5C42] cursor-pointer">Privacy Policy</p>
            <p className="hover:text-[#8B5C42] cursor-pointer mt-2">Terms & Conditions</p>
          </div>
          <button className="w-full py-3 rounded-lg bg-[#8B5C42] text-white font-medium hover:bg-[#704A36] transition">
  WhatsApp
</button>

        </div>
      )}
    </header>
  );
};

export default Navbar;
