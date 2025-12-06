import heroImg from "../../assets/about/hero.png";
import { FiPlay } from "react-icons/fi";

const AboutHero = () => {
  return (
    <section className="w-full py-20 bg-white">
      
      {/* Heading */}
      <div className="page-wrapper text-center mb-14">
        <h2
          className="text-4xl font-semibold text-[#2D2926]"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          What We Do
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          Tailored Rental Solutions to Elevate Your Celebrations
        </p>
      </div>

      {/* Main Section */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 px-6">

        {/* Left Image */}
            <div className="relative w-full md:w-[35%] h-[420px] rounded-2xl overflow-hidden shadow-lg">
          <img
            src={heroImg}
            alt="About Us"
            className="w-full h-full object-cover"
          />

         
        </div>

        {/* Right Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* 1 */}
          <div className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-[#FFF7F0]">
            <h4 className="text-xl font-semibold text-[#8B5C42]">
              Event Styling
            </h4>
            <p className="text-sm text-gray-600 mt-2">
              Transforming spaces with curated props, décor, and rental setups.
            </p>
            <a href="/services" className="text-[#8B5C42] font-medium mt-3 inline-block">
              READ MORE →
            </a>
          </div>

          {/* 2 */}
          <div className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-[#FDF4EC]">
            <h4 className="text-xl font-semibold text-[#8B5C42]">
              Party Rentals
            </h4>
            <p className="text-sm text-gray-600 mt-2">
              Wide variety of furniture, lighting, and themed props for all events.
            </p>
            <a href="/services" className="text-[#8B5C42] font-medium mt-3 inline-block">
              READ MORE →
            </a>
          </div>

          {/* 3 */}
          <div className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-[#FFF7F2]">
            <h4 className="text-xl font-semibold text-[#8B5C42]">
              Custom Setups
            </h4>
            <p className="text-sm text-gray-600 mt-2">
              Tailored arrangements designed based on themes, occasions, and venues.
            </p>
            <a href="/services" className="text-[#8B5C42] font-medium mt-3 inline-block">
              READ MORE →
            </a>
          </div>

          {/* 4 */}
          <div className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-[#FDF7F0]">
            <h4 className="text-xl font-semibold text-[#8B5C42]">
              Delivery & Setup
            </h4>
            <p className="text-sm text-gray-600 mt-2">
              Hassle-free delivery, installation, and pickup by our expert team.
            </p>
            <a href="/services" className="text-[#8B5C42] font-medium mt-3 inline-block">
              READ MORE →
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutHero;
