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
const cardWidth =
  window.innerWidth < 768
    ? Math.min(window.innerWidth * 0.9 + 24, 384) // frame + margin
    : 284;

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
const startX = useRef(0);

const handleTouchStart = (e) => {
  startX.current = e.touches[0].clientX;
};

const handleTouchEnd = (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX.current - endX;

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      next(); // swipe left
    } else {
      prev(); // swipe right
    }
  }
};

  return (
    <section className="w-full py-16 bg-white relative">

      {/* Heading */}
      <div className="text-center mb-8 px-6">
        <h2 className="text-3xl font-semibold text-[#2D2926]"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Event Stories – Real Moments. Real Celebrations.
        </h2>
        <p className="text-[#2D2926]/80 mt-2 max-w-2xl mx-auto">
          Explore real event setups, decoration ideas, and customer moments from
          our Party Rentals community.
        </p>
      </div>

      {/* Arrows outside slider: [left arrow] [slider] [right arrow] */}
      <div className="flex items-center justify-center gap-4 md:gap-6 w-full max-w-[1200px] mx-auto px-4">
        {/* Left arrow – outside, no overlap */}
        <button
          type="button"
          onClick={prev}
          className="hidden md:flex flex-shrink-0 w-12 h-12 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 items-center justify-center"
          aria-label="Previous"
        >
          <FiChevronLeft size={24} />
        </button>

        {/* Slider only – no arrow overlap */}
        <div className="flex-1 min-w-0 overflow-hidden max-w-[1136px] relative"

  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>

          <div
            ref={trackRef}
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${index * cardWidth}px)`,
            }}
          >
            {/* MOBILE SWIPE ARROW (ONE TIME ONLY) */}
<div className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
  <div className="w-8 h-8 rounded-full bg-[#C8A45D]/90 flex items-center justify-center shadow-md animate-pulse">
    <FiChevronRight className="text-white" size={18} />
  </div>
</div>

            {videos.map((video, i) => (
             <div
  key={i}
  className="
    w-[90vw] max-w-[360px]
    h-[420px]
    mx-3
    flex-shrink-0
    rounded-2xl
    overflow-hidden
    shadow-xl
    border border-black/10
    bg-white
  "
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


        {/* Right arrow – outside, no overlap */}
        <button
          type="button"
          onClick={next}
          className="hidden md:flex flex-shrink-0 w-12 h-12 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 items-center justify-center"
          aria-label="Next"
        >
          <FiChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default VideoSlider;
