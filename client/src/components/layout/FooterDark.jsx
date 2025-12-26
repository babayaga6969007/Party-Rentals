import { FiFacebook, FiInstagram, } from "react-icons/fi";

const FooterDark = () => {
  return (
    <footer className="bg-[#1C1C1C] py-16 border-t border-[#333]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Column 1 */}
        <div>
          <h2
            className="text-3xl font-semibold mb-4 text-white"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            New Project Designs
          </h2>

          <p className="text-white/80 leading-relaxed text-[15px]">
            We provide premium event décor, props, lighting, and celebration essentials.
          </p>

          <p className="mt-5 text-white font-medium">
            hello@newprojectdesigns.com
          </p>

          <div className="flex gap-4 mt-6 text-white">
            <FiFacebook size={22} className="hover:opacity-70 cursor-pointer" />
            <FiInstagram size={22} className="hover:opacity-70 cursor-pointer" />
          
          </div>
        </div>

        {/* Rentals */}
        <div>
          <h3
            className="text-xl font-semibold mb-4 text-white"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Rentals
          </h3>

          <ul className="space-y-3 text-white/80">
            <li className="hover:text-white cursor-pointer">Backdrops</li>
            <li className="hover:text-white cursor-pointer">Lighting</li>
            <li className="hover:text-white cursor-pointer">Table Décor</li>
            <li className="hover:text-white cursor-pointer">Seating & Props</li>
            <li className="hover:text-white cursor-pointer">Event Packages</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3
            className="text-xl font-semibold mb-4 text-white"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Support
          </h3>

          <ul className="space-y-3 text-white/80">
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">FAQs</li>
            <li className="hover:text-white cursor-pointer">Contact Us</li>
            <li className="hover:text-white cursor-pointer">How We Work</li>
            <li className="hover:text-white cursor-pointer">Terms & Policies</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3
            className="text-xl font-semibold mb-4 text-white"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Contact
          </h3>

          <p className="text-white/80 leading-relaxed mb-4">
            America-wide service, 
            Reliable delivery & pickup  
            Friendly support team
          </p>

          <div className="text-white/80 leading-relaxed mb-4">
            
            <span>2031 Via Burton Street Suite A Anaheim CA, 92806</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 text-sm text-white/70">
        © {new Date().getFullYear()} New Project Designs. All Rights Reserved.
      </div>
    </footer>
  );
};

export default FooterDark;
