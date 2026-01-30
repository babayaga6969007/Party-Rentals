import { useState } from "react";
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
  const [active, setActive] = useState(0);

  const next = () => setActive((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 bg-gray-50">
      
      {/* Heading */}
      <div className="text-center mb-12 px-4">
        <p className="text-sm tracking-widest text-black font-semibold">
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

      {/* Circular Avatar Selector */}
      <div className="flex justify-center gap-6 mb-10 flex-wrap">
        {testimonials.map((t, i) => (
          <img
            key={i}
            src={t.img}
            alt={t.name}
            onClick={() => setActive(i)}
            className={`w-16 h-16 rounded-full object-cover cursor-pointer
              transition-all duration-300 border-2
              ${active === i ? "border-black scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
          />
        ))}
      </div>

      {/* Testimonial Card */}
      <div className="relative max-w-3xl mx-auto px-6">

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute -left-20 ml-4 top-1/2 -translate-y-1/2 bg-white shadow-md p-3 rounded-full text-black hidden md:flex hover:bg-gray-100"
        >
          <FiChevronLeft size={22} />
        </button>

        <button
          onClick={next}
        className="absolute -right-20 mr-4 top-1/2 -translate-y-1/2 bg-white shadow-md p-3 rounded-full text-black hidden md:flex hover:bg-gray-100"
        >
          <FiChevronRight size={22} />
        </button>

        <div
          key={active}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-500 animate-fadeIn"
        >
          <div className="flex items-center gap-4 mb-4">
            <img
              src={testimonials[active].img}
              alt={testimonials[active].name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h4 className="text-xl font-semibold text-[#2D2926]">
                {testimonials[active].name}
              </h4>
              <p className="text-sm text-gray-500">
                {testimonials[active].role}
              </p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex text-[#FFB400] mb-3">
            {Array.from({ length: testimonials[active].rating }).map((_, idx) => (
              <FiStar key={idx} />
            ))}
          </div>

          {/* Review */}
          <p className="text-gray-600 leading-relaxed">
            "{testimonials[active].text}"
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
