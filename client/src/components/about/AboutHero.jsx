import heroImg from "../../assets/about/hero.png";
import { FiPlay } from "react-icons/fi";

const AboutHero = () => {
  return (
    <section className="w-full py-20 bg-white">
      
      {/* Heading */}
      <div className="page-wrapper text-center mb-14">
        <h2
          className="text-4xl font-semibold text-[#2D2926]"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          What We Do
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
Custom builds. Creative installs. One event at a time        </p>
      </div>

    </section>
  );
};

export default AboutHero;
