import { useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

const testimonials = [
  {
    name: "Sarah Williams",
    role: "Birthday Event",
    rating: 5,
    text: "Party Rentals made my daughter’s birthday magical! The props looked stunning and delivery + setup was super smooth.",
    img: "https://i.pravatar.cc/120?img=12"
  },
  {
    name: "Michael Brown",
    role: "Corporate Gala",
    rating: 5,
    text: "Top-notch professionalism! The décor instantly elevated our event and the team handled everything end-to-end.",
    img: "https://i.pravatar.cc/120?img=15"
  },
  {
    name: "Priya Sharma",
    role: "Baby Shower",
    rating: 5,
    text: "Loved the thematic decorations. Clean, premium quality items, and punctual service. Highly recommended!",
    img: "https://i.pravatar.cc/120?img=20"
  },
  {
    name: "Ankit Verma",
    role: "Engagement Ceremony",
    rating: 5,
    text: "The entire setup exceeded our expectations. Beautiful props, elegant décor, and friendly staff.",
    img: "https://i.pravatar.cc/120?img=17"
  },
];

const Testimonials = () => {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    sliderRef.current.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    sliderRef.current.scrollBy({ left: 350, behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-[#FFF7F0]">
      {/* Heading */}
      <div className="text-center mb-12 px-4">
        <p className="text-sm tracking-widest text-[#8B5C42] font-semibold">
          OUR CUSTOMERS
        </p>
        <h2
          className="text-4xl font-semibold text-[#2D2926] mt-2"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          Our Success Stories
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mt-3">
          Hear from the amazing people who trusted us to elevate their events
          with beautiful props, décor, and rental solutions.
        </p>
      </div>

      {/* Slider wrapper */}
      <div className="relative max-w-6xl mx-auto px-8">
        
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg p-3 rounded-full text-[#8B5C42] hover:bg-[#f7ebe3] hidden md:flex"
        >
          <FiChevronLeft size={22} />
        </button>

        {/* Cards */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-scroll scroll-smooth no-scrollbar"
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="min-w-[320px] md:min-w-[360px] bg-white shadow-md rounded-xl p-6 border border-[#EAD9C7]"
            >
              {/* Person row */}
              <div className="flex items-center gap-4">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-semibold text-[#2D2926]">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mt-3 text-[#FFB400]">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <FiStar key={idx} />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-gray-600 mt-4 leading-relaxed">
                "{t.text}"
              </p>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg p-3 rounded-full text-[#8B5C42] hover:bg-[#f7ebe3] hidden md:flex"
        >
          <FiChevronRight size={22} />
        </button>
      </div>
    </section>
  );
};

export default Testimonials;
