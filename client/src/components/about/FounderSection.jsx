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

          

          <p className="text-gray-700 leading-relaxed mt-4">
            When we founded this company, we wanted to build more than a woodshop—We wanted to create a place where imagination, craftsmanship, and unforgettable experiences converge. That vision started in a one-car garage with a few hand tools and a passion for being creatives on the weekend.  As we’ve grown throughout the years, these Never-Ending Weekend (NEW) Projects have impacted so many families and companies, progressively exemplifying the essence of what we stand for.  While some do it for the ‘Gram’, we do it for the glam.  For your immersive experience into our designs and fabrications.  In every project we aim to create experiences full of energy, excitement, wonder, and timeless indulgence.  Experiences that linger long after the final guest has departed.  

          </p>
           <p className="text-gray-700 leading-relaxed mt-4">
At New Project Designs, we specialize in the design, fabrication, and alteration of bespoke event décor for discerning clients who value artistry, detail, and impeccable execution.  Every element we produce is thoughtfully crafted and tailored to embody the unique essence of each occasion. From intimate gatherings to grand productions, our work is guided by a commitment to the guest experience, creativity, innovation, and excellence.
Thank you for visiting and for considering us as partners in your vision. We look forward to creating something extraordinary with you.


          </p>
           <p className="text-gray-700 leading-relaxed mt-4">
Founders <br></br>
Elisamarie and Eddie 

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
          <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-black rounded-tl-lg"></div>
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-black rounded-br-lg"></div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
