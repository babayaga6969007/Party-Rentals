import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

const Contact = () => {
  return (
    <section className="py-20 px-6 bg-white">

      {/* Page Heading */}
      <div className="page-wrapper max-w-4xl mx-auto text-center mb-16">
        <h1
          className="text-4xl md:text-5xl font-semibold text-[#2D2926]"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          Contact Us
        </h1>

        <p
          className="text-[#2D2926]/80 text-[18px] mt-4 leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          We’re here to help you create unforgettable events.  
          Reach out for bookings, inquiries, or anything else you need.
        </p>
      </div>

      {/* Contact Info + Form */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">

        {/* LEFT SIDE — Contact Info */}
        <div className="space-y-8">
          <div>
            <h2
              className="page-wrapper text-2xl font-semibold text-[#2D2926] mb-4"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              Get in Touch
            </h2>

            <p className="text-[#2D2926]/80 leading-relaxed">
              Whether you’re planning a birthday, wedding, corporate event, or
              intimate celebration, our team is here to assist you with rentals,
              designs, and custom requests.
            </p>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-4">
            <FiPhone size={26} className="text-[#8B5C42]" />
            <div>
              <p className="text-[#2D2926] font-medium text-lg">Phone</p>
              <p className="text-[#2D2926]/70">+1 XXX XXX XXX</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <FiMail size={26} className="text-[#8B5C42]" />
            <div>
              <p className="text-[#2D2926] font-medium text-lg">Email</p>
              <p className="text-[#2D2926]/70">hello@newprojectdesigns.com</p>
            </div>
          </div>
          

          {/* Address */}
          <div className="flex items-start gap-4">
            <FiMapPin size={26} className="text-[#8B5C42]" />
            <div>
              <p className="text-[#2D2926] font-medium text-lg">Location</p>
              <p className="text-[#2D2926]/70">
2031 Via Burton Street
Suite A                <br />
                (Delivery available nationwide)
              </p>
            </div>
          </div>


          {/* Business Hours */}
          <div className="pt-4">
            <h3
              className="text-xl font-semibold text-[#2D2926] mb-2"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              Business Hours
            </h3>
            <ul className="text-[#2D2926]/80 leading-relaxed">
              <li>Mon–Fri: 9:00 AM – 6:00 PM</li>
              <li>Sat: 10:00 AM – 4:00 PM</li>
              <li>Sun: Closed</li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE — Contact Form */}
        <div className="p-8 bg-[#FAF7F5] border border-[#D9C7BE] rounded-2xl shadow-sm">
          <h2
            className="text-2xl font-semibold text-[#2D2926] mb-6"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Send a Message
          </h2>

          <form className="space-y-6">
            {/* Name */}
            <div>
              <label className="block mb-2 text-[#2D2926]">Your Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-[#2D2926]">Your Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
                placeholder="Enter your email"
              />
            </div>

            {/* Address Line */}
            <div>
              <label className="block mb-2 text-[#2D2926]">Address Line</label>
              <input
                type="text"
                className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white 
                focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
                placeholder="Enter your address"
              />
            </div>
                        {/* Event / Rental Date */}
            <div>
              <label className="block mb-2 text-[#2D2926]">Event / Rental Date</label>
              <input
                type="date"
                className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white 
                focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
              />
            </div>


            {/* Title */}
<div>
  <label className="block mb-2 text-[#2D2926]">Title</label>
  <input
    type="text"
    className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
    placeholder="Enter message title"
  />
</div>

            {/* Message */}
            <div>
              <label className="block mb-2 text-[#2D2926]">Your Message</label>
              <textarea
                rows="4"
                className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
                placeholder="Write your message..."
              ></textarea>
            </div>

            <button className="w-full py-3 rounded-lg bg-[#8B5C42] text-white font-medium hover:bg-[#704A36] transition">
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Google Maps Section */}
      <div className="max-w-6xl mx-auto mt-20">
        <h2
          className="text-2xl font-semibold text-[#2D2926] mb-6 text-center"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          Find Us on the Map
        </h2>

        <div className="w-full h-[350px] rounded-xl overflow-hidden shadow-md border border-[#D9C7BE]">
          <iframe
            title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3302.104085378176!2d-118.322553!3d34.1341157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bf0caa18b9d9%3A0xe85dfb0c1dbd2f8b!2sHollywood%20Sign!5e0!3m2!1sen!2sus!4v1707733344444"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      </div>

    </section>
  );
};

export default Contact;
