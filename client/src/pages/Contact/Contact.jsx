import {  FiMail, FiMapPin } from "react-icons/fi";
import { useState } from "react";



const Contact = () => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email !== confirmEmail) {
      setError("Email addresses do not match");
      return;
    }

    setError("");
    // proceed with form submission
    console.log("Form submitted");
  };

  const [openForm, setOpenForm] = useState(false);
  
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
                    {/* CUSTOM ENQUIRY SECTION */}
<div className="mt-8">
  <h3
    className="text-xl font-semibold text-[#2D2926] mb-1"
    style={{ fontFamily: '"Cormorant Garamond", serif' }}
  >
    Custom Enquiry
  </h3>

  <p className="text-[#2D2926]/70 text-sm mb-4">
    Need something unique? Our team can help you plan the perfect setup.
  </p>

  <button
  onClick={() => setOpenForm(true)}
  className="inline-block bg-black text-white font-medium 
  px-5 py-2 rounded-lg shadow-sm transition-transform duration-200 ease-out
  hover:scale-105"
>
  Fill the Form →
</button>

</div>
          <div>
            <h2
              className=" text-2xl font-semibold text-[#2D2926] mb-4"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              Get in Touch
            </h2>

            <p className="text-[#2D2926]/80 leading-relaxed">
              Whether you're planning a birthday, wedding, corporate event, or an intimate celebration, our team supports you at every step — from selecting the right rentals to crafting stunning decor themes. 
            </p>
          </div>

          

          {/* Email */}
          <div className="flex items-start gap-4">
            <FiMail size={26} className="text-black" />
            <div>
              <p className="text-[#2D2926] font-medium text-lg">Email</p>
              <p className="text-[#2D2926]/70">hello@newprojectdesigns.com</p>
            </div>
          </div>
          

          {/* Address */}
          <div className="flex items-start gap-4">
            <FiMapPin size={26} className="text-black" />
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
  

<form className="space-y-6" onSubmit={handleSubmit}>

    {/* Name */}
    <div>
      <label className="block mb-2 text-[#2D2926]">Your Name</label>
      <input
        type="text"
        className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white 
        focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
        placeholder="Enter your name"
      />
    </div>

    {/* Email */}
    <div>
      <label className="block mb-2 text-[#2D2926]">Your Email</label>
      <input
  type="email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white 
  focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
  placeholder="Enter your email"
/>

    </div>
      {/* Confirm Email */}
      <div>
        <label className="block mb-2 text-[#2D2926]">Confirm Email</label>
        <input
          type="email"
          required
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className={`w-full p-3 rounded-lg border bg-white 
          focus:outline-none focus:ring-1
          ${email && confirmEmail && email !== confirmEmail
            ? "border-red-400 focus:ring-red-400/50"
            : "border-[#D9C7BE] focus:ring-[#8B5C42]/50"}`}
          placeholder="Re-enter your email"
        />
        {email && confirmEmail && email !== confirmEmail && (
          <p className="mt-1 text-sm text-red-500">
            Emails do not match
          </p>
        )}
      </div>

    

    {/* Title */}
    <div>
      <label className="block mb-2 text-[#2D2926]">Title (or Order Number)</label>
      <input
        type="text"
        className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white 
        focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
        placeholder="Enter message title"
      />
    </div>

    {/* Message */}
    <div>
      <label className="block mb-2 text-[#2D2926]">Your Message</label>
      <textarea
        rows="4"
        className="w-full p-3 rounded-lg border border-[#D9C7BE] bg-white 
        focus:outline-none focus:ring-1 focus:ring-[#8B5C42]/50"
        placeholder="Write your message..."
      ></textarea>
    </div>

    <button className="w-full py-3 rounded-lg bg-black text-white font-medium  transition-transform duration-200 ease-out
  hover:scale-105">
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
      {openForm && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]">

      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b">
        <h2 className="text-xl font-semibold text-[#2D2926]">
          Event Enquiry Form
        </h2>
        <button
          onClick={() => setOpenForm(false)}
          className="text-2xl text-gray-500 hover:text-black"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form className="p-6 space-y-5">

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="First Name"
            className="input" />
          <input required placeholder="Last Name"
            className="input" />
        </div>

        {/* Email */}
        <input required type="email" placeholder="Email"
          className="input" />

        {/* Services */}
        <select required className="input">
          <option value="">What services are you interested in?</option>
          <option>Custom buildout for an event</option>
          <option>Custom sign order</option>
          <option>Props and more</option>
          <option>Rental package</option>
        </select>

        {/* Event Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="date" className="input" />
          <input type="time" className="input" />
        </div>
        <p className="text-sm text-gray-500">
          Time in Pacific Time
        </p>

        {/* Address */}
        <input required placeholder="Address Line 1" className="input" />
        <input placeholder="Address Line 2" className="input" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input required placeholder="City" className="input" />
          <input required placeholder="State" className="input" />
          <input required placeholder="ZIP Code" className="input" />
        </div>

        {/* Budget */}
        <input required type="number" placeholder="Budget (e.g. 2000)"
          className="input" />

        {/* Event Conditions */}
        <div className="space-y-2">
          {[
            "Roof top event",
            "Outdoor",
            "Indoor",
            "Same day setup and pick up",
            "1st level venue",
            "2nd level or higher",
            "Balloons attached to walls",
            "Floral design attached to walls",
            "Mock up design needed"
          ].map(item => (
            <label key={item} className="flex gap-2 items-center text-sm">
              <input type="checkbox" />
              {item}
            </label>
          ))}
        </div>

        {/* Description */}
        <textarea required rows="4"
          placeholder="Please add detailed description (size, color, quantity, packages etc.)"
          className="input" />

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#8B5C42] text-white py-3 rounded-lg
          hover:bg-[#704A36] transition"
        >
          Send
        </button>
      </form>
    </div>
  </div>
)}


    </section>
  );
};

export default Contact;
