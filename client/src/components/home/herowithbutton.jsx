import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroVideo from "../../assets/videos/hero.mp4";

const Hero = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shrinkSpeed = 5000;
      const maxShrink = 0.5;

      let newScale = 1 - Math.min(scrollY / shrinkSpeed, maxShrink);
      setScale(newScale);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">

      {/* VIDEO WRAPPER WITH SCALING */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          onLoadedMetadata={(e) => {
            e.target.currentTime = 10;
          }}
          className="w-full h-full object-cover"
        ></video>

        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      </div>

      {/* ⭐ CENTER BUTTONS */}
      <div className="
        absolute inset-0 flex items-center justify-center 
        text-center gap-4 px-4 z-20
      ">

        {/* HORIZONTAL BUTTON WRAPPER */}
<div className="flex flex-col md:flex-row items-center gap-4">

        {/* RENTAL STORE BUTTON */}
<Link
  to="/category"
  className="
    px-10 py-3 font-semibold text-lg
    bg-white text-[#2D2926]
    shadow-lg
    hover:bg-[#8B5C42] hover:text-white
    transition-all duration-300
    text-center whitespace-nowrap
    w-full md:w-[220px]
  "
  style={{ borderRadius: "0px" }}
>
  Rental Store
</Link>

{/* CUSTOMER INQUIRY BUTTON */}
<a
  href="https://forms.gle/YOUR_FORM_LINK"
  target="_blank"
  rel="noopener noreferrer"
  className="
    px-10 py-3 font-semibold text-lg
    bg-white text-[#2D2926]
    shadow-lg
    hover:bg-[#8B5C42] hover:text-white
    transition-all duration-300
    text-center whitespace-nowrap
    w-full md:w-[260px]
  "
  style={{ borderRadius: "0px" }}
>
  Custom Inquiry Form
</a>



        </div>
      </div>

    </div>
  );
};

export default Hero;
