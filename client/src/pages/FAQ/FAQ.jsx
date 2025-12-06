import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqData = {
  Orders: [
    {
      q: "How do I place an order?",
      a: "Browse our catalog, add items to your rental cart, select dates, and confirm your booking in a few clicks."
    },
    {
      q: "Can I modify an existing order?",
      a: "Yes, you can update dates or items depending on availability. Contact us for adjustments."
    },
  ],

  Billing: [
    {
      q: "What payment methods do you accept?",
      a: "We accept online payments, bank transfers, and in-person payments for selected locations."
    },
    {
      q: "Do you charge any security deposit?",
      a: "Some high-value items require a refundable security deposit."
    }
  ],

  Account: [
    {
      q: "Do I need to create an account?",
      a: "No. You can book rentals as a guest, but an account helps track your bookings."
    },
    {
      q: "Can I delete my account?",
      a: "Yes, send us a request and we will process deletion within 48 hours."
    }
  ],

  Shipping: [
    {
      q: "Do you deliver and pick up the items?",
      a: "Yes, we offer full delivery and pickup services across selected areas."
    },
    {
      q: "Is same-day delivery possible?",
      a: "It depends on availability and item type."
    }
  ],

  Refunds: [
    {
      q: "What is your cancellation policy?",
      a: "Free cancellation up to 24 hours before delivery time."
    },
    {
      q: "What if an item arrives damaged?",
      a: "We immediately replace or refund depending on the situation."
    }
  ],

  Others: [
    {
      q: "How does the service work?",
      a: "Select items, choose rental dates, confirm booking, and we deliver everything to your venue or home."
    },
    {
      q: "Do you serve my area?",
      a: "We currently serve selected regions. Contact support for details."
    },
    {
      q: "What if the item is out of stock?",
      a: "We will suggest alternatives or notify you when it's available again."
    }
  ],
};

const FAQ = () => {
  const tabs = Object.keys(faqData);
  const [activeTab, setActiveTab] = useState("Others");
  const [openIndex, setOpenIndex] = useState(null);

  // Accordion toggle
  const toggle = (i) => {
    setOpenIndex(i === openIndex ? null : i);
  };

  return (
    <div className="page-wrapper min-h-screen bg-white py-16 px-4">
      
      {/* Page heading */}
      <h1
        className="text-4xl font-semibold text-center mb-10 text-[#2D2926]"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}
      >
        Frequently Asked Questions
      </h1>
      <p className="text-center text-gray-600 mb-12">
  Have a question? We're here to help.
</p>


      {/* Tabs */}
<div className="flex flex-wrap justify-center gap-4 pb-3 mb-10 text-center">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setOpenIndex(null);
            }}
            className={`text-lg pb-2 transition-all ${
              activeTab === tab
                ? "border-b-2 border-[#8B5C42] text-[#8B5C42]"
                : "text-gray-500 hover:text-[#8B5C42]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Accordion Section */}
      <div className="max-w-3xl mx-auto space-y-4">
        {faqData[activeTab].map((item, i) => (
          <div
            key={i}
            className="border rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-md transition"
            style={{ borderColor: "#E5D5C2" }}
            onClick={() => toggle(i)}
          >
            {/* Question row */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-[#2D2926]">
                {item.q}
              </h3>

              {openIndex === i ? (
                <FiMinus className="text-[#8B5C42]" />
              ) : (
                <FiPlus className="text-[#8B5C42]" />
              )}
            </div>

            {/* Answer */}
            {openIndex === i && (
              <p className="mt-3 text-gray-600 leading-relaxed">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
      {/* Bottom CTA */}
<div className="mt-16 bg-[#F3E9DF] py-12 rounded-xl max-w-3xl mx-auto text-center">
  <h3 className="text-2xl font-semibold text-[#2D2926]"
      style={{ fontFamily: '"Cormorant Garamond", serif' }}>
    Still need assistance?
  </h3>

  <p className="text-gray-600 mt-2 mb-6">
    Our support team is always ready to help you with rentals, setup, or any inquiries.
  </p>

  <a
    href="/contact"
    className="inline-block bg-[#8B5C42] text-white px-8 py-3 rounded-full shadow-md hover:bg-[#704A36] transition"
  >
    Contact Us
  </a>
</div>
    </div>
    
  );
};



export default FAQ;
