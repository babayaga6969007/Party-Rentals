import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqData = {
  "About New Project Designs": [
    {
      q: "What is New Project Designs?",
      a: "New Project Designs is an event design and fabrication studio specializing in custom décor, backdrops, installations, and immersive event environments."
    },
    {
      q: "What types of events do you service?",
      a: "We design for brand activations, corporate events, private celebrations, weddings, galas, pop-ups, and experiential installations."
    }
  ],

  "Design & Services": [
    {
      q: "What services do you offer?",
      a: "Our services include custom backdrop and prop fabrication, luxury décor rentals, event styling and spatial design, delivery, installation, breakdown, and full or partial event production."
    },
    {
      q: "Do you create custom designs?",
      a: "Yes. Custom fabrication is at the core of what we do. Every design is tailored to your vision, brand identity, venue, and guest experience."
    },
    {
      q: "Do you offer design consultations?",
      a: "Yes. Design consultations are available and may be complimentary or applied toward your final invoice depending on the scope of the project."
    }
  ],

  Rentals: [
    {
      q: "How long is the rental period?",
      a: "Standard rentals are for one event day. Multi-day rentals may be arranged based on availability."
    },
    {
      q: "What is included in the rental price?",
      a: "Rental pricing includes the décor piece and standard wear. Delivery, installation, styling, and pickup are quoted separately unless otherwise stated."
    },
    {
      q: "Can rentals be customized?",
      a: "Most of our rental pieces can be enhanced with custom paint finishes, vinyl, shelving, or signage to align with your event aesthetic."
    }
  ],

  "Custom Fabrication": [
    {
      q: "What is the lead time for custom pieces?",
      a: "Custom fabrication typically requires 3–6 weeks depending on complexity, materials, and approvals. Rush projects may be accommodated based on availability."
    },
    {
      q: "Will I see a design before production begins?",
      a: "Yes. We provide digital mockups, renderings, or visual references for approval prior to fabrication."
    },
    {
      q: "Who owns custom-fabricated items?",
      a: "Ownership is defined in the project agreement. Some pieces are client-owned, while others are retained by New Project Designs at a reduced fabrication cost."
    }
  ],

  "Booking & Payments": [
    {
      q: "How do I reserve my event date?",
      a: "Event dates are secured through our website rental system with payment. Custom projects require a signed agreement and non-refundable retainer."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept credit cards, ACH transfers for custom projects, and approved business checks. Please contact us for alternative arrangements."
    },
    {
      q: "When is final payment due?",
      a: "Final balances are typically due two days prior to the event unless otherwise specified. Orders placed within two weeks of the event require full payment upfront."
    }
  ],

  "Delivery, Installation & Pickup": [
    {
      q: "Do you handle delivery and installation?",
      a: "Yes. Our professional team manages delivery, installation, and breakdown for all décor we provide."
    },
    {
      q: "Is there a minimum for delivery services?",
      a: "A minimum order subtotal of $1000 (before tax) is required for delivery services."
    },
    {
      q: "What are your labor and delivery charges?",
      a: "Labor and delivery fees start at 14% of the order subtotal and may increase based on distance, venue access, or special handling requirements."
    },
    {
      q: "Do you coordinate with venues?",
      a: "Yes. We work directly with venue management to comply with load-in schedules, access rules, and installation requirements."
    },
    {
      q: "What if my event runs late?",
      a: "Extended event hours or delayed breakdowns may result in additional labor fees."
    }
  ],

  "Damage, Liability & Insurance": [
    {
      q: "What happens if décor is damaged?",
      a: "Clients are responsible for damage beyond normal wear and tear. Repair or replacement costs will be assessed accordingly."
    },
    {
      q: "Is a damage deposit required?",
      a: "A refundable damage deposit may be required depending on the items selected."
    },
    {
      q: "Are you insured?",
      a: "Yes. New Project Designs is fully insured, and certificates of insurance are available upon request."
    }
  ],

  "Cancellations & Changes": [
    {
      q: "What is your cancellation policy?",
      a: "All retainers are non-refundable. Cancellations within 21 days of the event may result in responsibility for up to 100% of the contracted amount."
    },
    {
      q: "Can I make changes after booking?",
      a: "Changes are accommodated based on availability and timing. Significant changes close to the event date may incur additional fees."
    }
  ],

  "Additional Information": [
    {
      q: "Do you travel for events?",
      a: "Yes. Travel, lodging, and per diem fees may apply for events outside our local service area."
    },
    {
      q: "Do you collaborate with planners and vendors?",
      a: "Absolutely. We regularly collaborate with planners, florists, venues, and production teams to deliver cohesive event experiences."
    }
  ]
};

const FAQ = () => {
  const tabs = Object.keys(faqData);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="page-wrapper min-h-screen bg-white px-4 py-16">
      <h1 className="text-4xl text-center font-semibold mb-4 text-[#2D2926]"
        style={{ fontFamily: '"Cormorant Garamond", serif' }}>
        Frequently Asked Questions
      </h1>

      <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
        Everything you need to know about our design process, rentals, and event services.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setOpenIndex(null);
            }}
            className={`text-sm md:text-base pb-1 border-b-2 transition ${
              activeTab === tab
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto space-y-4">
        {faqData[activeTab].map((item, i) => (
          <div
            key={i}
            className="border rounded-xl p-5 cursor-pointer transition hover:shadow-md"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-[#2D2926]">{item.q}</h3>
              {openIndex === i ? <FiMinus /> : <FiPlus />}
            </div>

            {openIndex === i && (
              <p className="mt-3 text-gray-600 leading-relaxed">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
