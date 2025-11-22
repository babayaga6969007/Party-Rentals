import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// videos
import v1 from "../../assets/reels/1.mp4";
import v2 from "../../assets/reels/2.mp4";
import v3 from "../../assets/reels/3.mp4";
import v4 from "../../assets/reels/4.mp4";
import v5 from "../../assets/reels/5.mp4";
import v6 from "../../assets/reels/6.mp4";

const videosOriginal = [v1, v2, v3, v4, v5, v6];
const instaLinks = [
  "https://www.instagram.com/p/DRDNVjFEhgR/",
  "https://www.instagram.com/p/DQ0tqBADhDa/",
  "https://www.instagram.com/p/DN7eZpwDrZe/",
  "https://www.instagram.com/p/DG7HAWSRizA/",
  "https://www.instagram.com/p/DDl164Ox-0n/",
  "https://www.instagram.com/p/C16jS0UrRZ2/",
];


// Create duplicates for infinite effect
const videos = [...videosOriginal, ...videosOriginal, ...videosOriginal];

const VideoSlider = () => {
  const [index, setIndex] = useState(videosOriginal.length); // start in middle copy
  const trackRef = useRef(null);

const visibleCards = window.innerWidth < 768 ? 1 : 4;
const cardWidth = window.innerWidth < 768 ? 300 : 284;

  useEffect(() => {
    // Looping logic: jump without animation
    if (index === 0) {
      setTimeout(() => {
        trackRef.current.style.transition = "none";
        setIndex(videosOriginal.length);
      }, 350);
    }
    if (index === videos.length - visibleCards) {
      setTimeout(() => {
        trackRef.current.style.transition = "none";
        setIndex(videosOriginal.length - visibleCards);
      }, 350);
    }
  }, [index]);

  const next = () => {
    trackRef.current.style.transition = "transform 0.35s ease";
    setIndex((prev) => prev + 1);
  };

  const prev = () => {
    trackRef.current.style.transition = "transform 0.35s ease";
    setIndex((prev) => prev - 1);
  };

  return (
    <section className="w-full py-16 bg-white relative">

      {/* Heading */}
      <div className="text-center mb-8 px-6">
        <h2 className="text-3xl font-semibold text-[#2D2926]"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Event Stories – Real Moments. Real Celebrations.
        </h2>
        <p className="text-[#2D2926]/70 mt-2 max-w-2xl mx-auto">
          Explore real event setups, decoration ideas, and customer moments from
          our Party Rentals community.
        </p>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
      className="hidden md:flex absolute left-20 top-1/2 -translate-y-1/2 z-20 bg-[#8B5C42] p-4 rounded-full text-white shadow-lg hover:bg-[#704A36]"
      >
        <FiChevronLeft size={24} />
      </button>

      <button
        onClick={next}
  className="hidden md:flex absolute right-20 top-1/2 -translate-y-1/2 z-20 bg-[#8B5C42] p-4 rounded-full text-white shadow-lg hover:bg-[#704A36]"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Slider with margins */}
      <div className="max-w-[1136px] mx-auto overflow-hidden">

        {/* SLIDER TRACK */}
        <div
          ref={trackRef}
          className="flex"
          style={{
            transform: `translateX(-${index * cardWidth}px)`,
          }}
        >
          {videos.map((video, i) => (
            <div
              key={i}
                className="w-[260px] h-[400px] mx-3 flex-shrink-0 rounded-xl overflow-hidden shadow-lg"
            >
              <a
              href={instaLinks[i % instaLinks.length]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <video
                src={video}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover cursor-pointer"
              />
            </a>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSlider;
