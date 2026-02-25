import img1 from "../../assets/partners/1.png";
import img2 from "../../assets/partners/2.png";
import img3 from "../../assets/partners/3.png";
import img4 from "../../assets/partners/4.png";
import img5 from "../../assets/partners/5.png";
import img6 from "../../assets/partners/6.png";
import img7 from "../../assets/partners/7.png";
import img8 from "../../assets/partners/8.png";
import img9 from "../../assets/partners/9.png";
import img10 from "../../assets/partners/10.png";
import img11 from "../../assets/partners/11.png";

const Partners = () => {
  // ✅ Total 11 images
  const images = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8,
    img9,
    img10,
    img11,
  ];

  // 🔁 Duplicate for seamless infinite scrolling
  const infiniteImages = [...images, ...images, ...images];

  return (
    <div className="py-14 bg-white overflow-hidden">
      {/* TEXT SECTION */}
     <p
  className="
    max-w-3xl
    mx-auto
    text-center
    text-[22px] md:text-[32px]
    text-[#2D2926]
    px-4 md:px-0
    mb-8 md:mb-12
    leading-relaxed
  "
  style={{ fontFamily: '"Cormorant Garamond", serif' }}
>
  You shouldn't have to compromise the unique style of your event – with our
  customizable rentals and tailored fabrications, you won't.
</p>



      {/* SLIDER */}
      <div className="relative overflow-hidden px-6">
        <div className="flex items-center gap-16 animate-infinite-scroll">
          {infiniteImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`partner-logo-${idx}`}
              className="h-16 w-auto object-contain opacity-90 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;
