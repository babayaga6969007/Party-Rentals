import img1 from "../../assets/partners/1.png";
import img2 from "../../assets/partners/2.png";
import img3 from "../../assets/partners/3.png";
import img4 from "../../assets/partners/4.png";
import img5 from "../../assets/partners/5.png";

const Partners = () => {
  const images = [img1, img2, img3, img4, img5];
  const infiniteImages = [...images, ...images, ...images]; // seamless loop

  return (
    <div className="py-14 bg-white overflow-hidden">

      {/* NEW TEXT SECTION */}
      <p
        className="max-w-3xl mx-auto text-center text-[32px] text-[#2D2926] mb-6 leading-relaxed"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
       You shouldn't have to compromise the unique style of your event - with our customizable rentals and tailored fabrications, you don't.
      </p>

      {/* Heading */}
      

      {/* Slider */}
      <div className="relative overflow-hidden px-6">
        <div className="flex items-center gap-16 animate-infinite-scroll">
          {infiniteImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              className="h-16 w-auto object-contain opacity-90 hover:opacity-100 transition"
              alt={`partner-logo-${idx}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;
