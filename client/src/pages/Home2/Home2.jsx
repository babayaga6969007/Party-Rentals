import NavbarTransparent from "../../components/layout/NavbarTransparent";

import Hero from "../../components/home/herowithbutton";
import Partners from "../../components/home/Partners";
import VideoSlider from "../../components/home/VideoSlider";
import FeaturedProducts from "../../components/home/FeaturedProducts";




const Home = () => {
  return (
    <div className="w-full">
      <NavbarTransparent />
       {/* HERO SECTION */}
      <Hero />

     

      {/* PARTNERS SECTION */}
      
      <Partners />
      <FeaturedProducts />
      <VideoSlider />
      

    </div>
  );
};

export default Home;
