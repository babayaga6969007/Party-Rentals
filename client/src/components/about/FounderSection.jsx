const FounderSection = () => {
  return (
    <section className="py-20 bg-[#FFF]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT CONTENT */}
        <div>
          <h2
            className="text-4xl font-semibold text-[#2D2926] mb-4"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Meet Our Founder
          </h2>

          <p className="text-gray-700 leading-relaxed">
            John Reynolds, the visionary behind Party Rentals, began this journey
            with a simple goal — to make celebrations effortless, beautiful, and
            unforgettable for everyone. With over 15 years of experience in the
            events and décor industry, John has worked with families, corporate
            teams, and creative planners across the country.
          </p>

          <p className="text-gray-700 leading-relaxed mt-4">
            His passion for aesthetics, attention to detail, and commitment to
            quality inspired the creation of a rental service that blends convenience
            with premium event styling. Today, Party Rentals proudly helps thousands
            bring their dream events to life.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative">
          <img
            src="https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Founder"
            className="rounded-2xl shadow-xl object-cover w-full max-h-[420px]"
          />

          {/* Decorative Corners */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-[#8B5C42] rounded-tl-lg"></div>
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-[#8B5C42] rounded-br-lg"></div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
