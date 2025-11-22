import hero1 from "../../assets/home2/hero1.png";
import hero2 from "../../assets/home2/hero2.png";
import hero3 from "../../assets/home2/hero3.png";
import hero4 from "../../assets/home2/hero4.png";
import Partners from "../../components/home/Partners";
import VideoSlider from "../../components/home/VideoSlider";
import FeaturedProducts from "../../components/home/FeaturedProducts";


const Home2 = () => {
  return (
    <section className="w-full bg-[#FFF7F0] pt-20 pb-20 px-6">

    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-14">

        {/* LEFT SIDE TEXT */}
        <div className="md:w-1/2">
          <h1
            className="text-5xl md:text-6xl font-semibold text-[#2D2926] leading-tight"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Make Every Celebration  
            <span className="text-[#8B5C42]"> Unforgettable</span>
          </h1>

          <p className="mt-6 text-gray-600 text-lg leading-relaxed">
            From birthday parties to grand events, we bring your vision to life  
            with premium props, décor, and fully-managed rental solutions.
          </p>

          <a
            href="/about"
            className="inline-block mt-8 bg-[#8B5C42] text-white px-8 py-4 rounded-full shadow-lg hover:bg-[#704A36] transition"
          >
            Explore Our Services
          </a>
        </div>

        {/* RIGHT SIDE IMAGE GRID */}
        <div className="md:w-1/2 grid grid-cols-2 gap-4">
          <div className="rounded-2xl overflow-hidden shadow-md h-48 bg-white">
            <img
              src={hero1}
              className="w-full h-full object-cover"
              alt="Party props"
            />
          </div>

          <div className="rounded-2xl overflow-hidden shadow-md h-48 bg-white">
            <img
              src={hero2}
              className="w-full h-full object-cover"
              alt="Event decor"
            />
          </div>

          <div className="rounded-2xl overflow-hidden shadow-md h-48 bg-white">
            <img
              src={hero3}
              className="w-full h-full object-cover"
              alt="Party setup"
            />
          </div>

          <div className="rounded-2xl overflow-hidden shadow-md h-48 bg-white">
            <img
              src={hero4}
              className="w-full h-full object-cover"
              alt="Event styling"
            />
          </div>
        </div>
      </div>
      <div className="w-full">

      {/* PARTNERS SECTION */}
      <div className="mt-15">
  <Partners />
</div>
{/* FEATURED PRODUCTS */}
      <FeaturedProducts />

      {/* VIDEO SLIDER */}
      <VideoSlider />

      
    </div>
    </section>
    
  );
};
export default Home2;
