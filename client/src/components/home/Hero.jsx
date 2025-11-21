import { useEffect, useState } from "react";
import heroVideo from "../../assets/videos/hero.mp4";

const Hero = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Smooth shrink effect (adjust values as you like)
      const shrinkSpeed = 5000;   // increase = slower shrink, decrease = faster
      const maxShrink = 0.5;     // increase = more shrink, decrease = less

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
        {/* Fullscreen Video */}
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          onLoadedMetadata={(e) => {
            e.target.currentTime = 10; // start video at 10 seconds
          }}
          className="w-full h-full object-cover"
        ></video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      </div>

    </div>
  );
};

export default Hero;
