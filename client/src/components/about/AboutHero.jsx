import heroImg from "../../assets/about/hero.png";
import { FiPlay } from "react-icons/fi";

const AboutHero = () => {
  return (
    <section className="w-full py-20 bg-white">
      
      {/* Heading */}
      <div className="page-wrapper text-center mb-14">
        <h1
  className="text-4xl md:text-5xl font-semibold text-[#2D2926]"
  style={{ fontFamily: '"Cormorant Garamond", serif' }}
>
  What We Do
</h1>
        <p className="text-[#2D2926]/80 leading-relaxed mb-4">
  Custom builds. Creative installs. One event at a time
</p>
      </div>

    </section>
  );
};

export default AboutHero;
