import Hero from "../../components/home/Hero";
import Partners from "../../components/home/Partners";
import VideoSlider from "../../components/home/VideoSlider";

import FeaturedProducts from "../../components/home/FeaturedProducts";




const Home = () => {
  return (
    <div className="w-full">
       {/* HERO SECTION */}
      <Hero />

     

      {/* PARTNERS SECTION */}
      
      <Partners />
       <VideoSlider />
      <FeaturedProducts />

    </div>
  );
};

export default Home;
