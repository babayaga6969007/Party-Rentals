import { useContactFormModal } from "../context/ContactFormModalContext";

const ContactFormModal = () => {
  const { isOpen, closeModal } = useContactFormModal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-5 border-b bg-white shrink-0">
          <h2 className="text-xl font-semibold text-[#2D2926]">
            Tell us about your event (don’t worry—big ideas welcome)
          </h2>
          <button
            type="button"
            onClick={closeModal}
            className="text-2xl text-gray-500 hover:text-black cursor-pointer"
          >
            ×
          </button>
        </div>

        <form className="p-6 space-y-10 overflow-y-auto flex-1 min-h-0">
          {/* THE BASICS */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">The Basics</h3>
            <input required placeholder="Name" className="input" />
            <input required type="email" placeholder="Email" className="input" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="date" className="input" />
              <input placeholder="Event location & time" className="input" />
            </div>
          </section>

          {/* SERVICES NEEDED */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">What Can We Help With?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {["Custom backdrops", "Signage", "Props", "Install + breakdown", "Full event styling"].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" />
                  {item}
                </label>
              ))}
            </div>
          </section>

          {/* THE FUN STUFF */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">The Fun Stuff</h3>
            <p className="text-sm text-gray-600">Event Type</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {["Wedding", "Birthday", "Baby / Bridal Shower", "Corporate / Brand Event", "Holiday / Themed Event", "Other"].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" />
                  {item}
                </label>
              ))}
            </div>
            <textarea rows="4" placeholder="What are you envisioning?" className="input" />
          </section>

          {/* THE DETAILS */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">The Details</h3>
            <p className="text-sm text-gray-600">Do you have a budget range in mind?</p>
            <div className="space-y-2 text-sm">
              {["Under $1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000+", "I'm not sure yet"].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" />
                  {item}
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-600">Please check all that apply:</p>
            <div className="flex flex-col gap-2 text-sm">
              {["Roof top event", "Outdoor", "Indoor"].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" />
                  {item}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span>Will you need a mock up design from us?</span>
              <label className="flex items-center gap-1">
                <input type="radio" name="mockup" /> Yes
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="mockup" /> No
              </label>
            </div>
            <textarea rows="3" placeholder="Anything else we should know?" className="input" />
            <p className="text-sm text-gray-500">
              You don’t need all the details figured out yet. We’ll review your inquiry within 1–2 business days.
            </p>
          </section>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Let’s Design This
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
