import { FiFacebook, FiInstagram, FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="bg-white py-16 border-t border-[#EDEEEA]">
<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-20">

        {/* Column 1 — Company Info */}
<div className="max-w-sm">
          <h2
            className="text-3xl font-semibold mb-4 text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            New Project Designs
          </h2>

<p className="text-[#2D2926]/80 leading-relaxed text-[15px] max-w-md">
            We provide premium event décor, props, lighting, and 
            celebration essentials for all types of events across America. 
            From intimate gatherings to grand celebrations, we ensure 
            unforgettable experiences with style and convenience.
          </p>

          <a
            href="mailto:hello@newprojectdesigns.com"
            className="mt-5 block text-black font-medium hover:opacity-80"
          >
            hello@newprojectdesigns.com
          </a>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6 text-[#2D2926]">
  <a
    href="https://www.facebook.com/newprojectdesigns"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
  >
    <FiFacebook size={22} className="hover:opacity-70 cursor-pointer" />
  </a>

  <a
    href="https://www.instagram.com/p/DQ0tqBADhDa/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
  >
    <FiInstagram size={22} className="hover:opacity-70 cursor-pointer" />
  </a>
</div>

        </div>

        {/* Column 3 — Support */}
<div className="max-w-sm">
          <h3
            className="text-xl font-semibold mb-4 text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Quick Links
          </h3>

         <ul className="space-y-3 text-[#2D2926]/80">
  <li>
    <Link
      to="/about"
      className="hover:text-black cursor-pointer block"
    >
      About Us
    </Link>
  </li>

  <li>
    <Link
      to="/faqs"
      className="hover:text-black cursor-pointer block"
    >
      FAQs
    </Link>
  </li>

  <li>
    <Link
      to="/contact"
      className="hover:text-black cursor-pointer block"
    >
      Contact Us
    </Link>
  </li>

  <li>
    <Link
      to="/contract"
      className="hover:text-black cursor-pointer block"
    >
      Terms & Policies
    </Link>
  </li>
</ul>
        </div>

        {/* Column 4 — Contact */}
<div className="max-w-sm">
          <h3
            className="text-xl font-semibold mb-4 text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Contact
          </h3>

          <p className="text-[#2D2926]/80 leading-relaxed mb-4">
            America-wide service,  
            Reliable delivery & pickup  
            Friendly customer support
          </p>

          <div className="text-[#2D2926]/80 leading-relaxed mb-4">
            
            <span>2031 Via Burton Street
Suite A

Anaheim CA, 92806
</span>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="text-center mt-12 text-sm text-[#2D2926]/70">
        © {new Date().getFullYear()} New Project Designs. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
