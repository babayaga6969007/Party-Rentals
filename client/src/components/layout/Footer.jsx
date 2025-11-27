import { FiFacebook, FiInstagram, FiLinkedin, FiPhone } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-white py-16 border-t border-[#EDEEEA]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Column 1 — Company Info */}
        <div>
          <h2
            className="text-3xl font-semibold mb-4 text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Party Rentals
          </h2>

          <p className="text-[#2D2926]/80 leading-relaxed text-[15px]">
            Party Rentals provides premium event décor, props, lighting, and 
            celebration essentials for all types of events across Australia. 
            From intimate gatherings to grand celebrations, we ensure 
            unforgettable experiences with style and convenience.
          </p>

          <p className="mt-5 text-[#8B5C42] font-medium">
          hello@newprojectdesigns.com

          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6 text-[#2D2926]">
            <FiFacebook size={22} className="hover:opacity-70 cursor-pointer" />
            <FiInstagram size={22} className="hover:opacity-70 cursor-pointer" />
            <FiLinkedin size={22} className="hover:opacity-70 cursor-pointer" />
          </div>
        </div>

        {/* Column 2 — Rentals */}
        <div>
          <h3
            className="text-xl font-semibold mb-4 text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Rentals
          </h3>

          <ul className="space-y-3 text-[#2D2926]/80">
            <li className="hover:text-[#8B5C42] cursor-pointer">Backdrops</li>
            <li className="hover:text-[#8B5C42] cursor-pointer">Lighting</li>
            <li className="hover:text-[#8B5C42] cursor-pointer">Table Décor</li>
            <li className="hover:text-[#8B5C42] cursor-pointer">Seating & Props</li>
            <li className="hover:text-[#8B5C42] cursor-pointer">Event Packages</li>
          </ul>
        </div>

        {/* Column 3 — Support */}
        <div>
          <h3
            className="text-xl font-semibold mb-4 text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Support
          </h3>

          <ul className="space-y-3 text-[#2D2926]/80">
            <li className="hover:text-[#8B5C42] cursor-pointer">About Us</li>
            <li className="hover:text-[#8B5C42] cursor-pointer">FAQs</li>
            <li className="hover:text-[#8B5C42] cursor-pointer">Contact Us</li>
            <li className="hover:text-[#8B5C42] cursor-pointer">How We Work</li>
            <li className="hover:text-[#8B5C42] cursor-pointer">Terms & Policies</li>
          </ul>
        </div>

        {/* Column 4 — Contact */}
        <div>
          <h3
            className="text-xl font-semibold mb-4 text-[#2D2926]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Contact
          </h3>

          <p className="text-[#2D2926]/80 leading-relaxed mb-4">
            America-wide service  
            Reliable delivery & pickup  
            Friendly customer support
          </p>

          <div className="flex items-center gap-3 text-[#2D2926] font-medium">
            <FiPhone size={20} />
            <span>+1 XXX XXX XXX</span>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="text-center mt-12 text-sm text-[#2D2926]/70">
        © {new Date().getFullYear()} Party Rentals America. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
