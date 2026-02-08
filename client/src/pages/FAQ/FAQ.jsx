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
      a: "Yes. Design consultations are available and may be complimentary or applied toward your final invoice, depending on project scope."
    }
  ],

  Rentals: [
    {
      q: "How long is the rental period?",
      a: "Standard rentals are for one event day. Multi-day rentals may be arranged based on availability."
    },
    {
      q: "What is included in the rental price?",
      a: "Rental pricing includes the décor piece and standard wear. Delivery, installation, lavish styling, and pickup are quoted separately unless otherwise stated."

    },
    {
      q: "Can rentals be customized?",
      a: "What separates New Project Designs from the rest is that most of our rental pieces can be enhanced with custom paint finishes, vinyl, shelving, or signage to better reflect your event aesthetic."
    }
  ],

  "Custom Fabrication": [
    {
      q: "What is the lead time for custom pieces?",
      a: "Custom builds typically require 3–6 weeks, depending on complexity, materials, and approvals. Rush projects may be accommodated based on availability."
    },
    {
      q: "Will I see a design before production begins?",
      a: "Yes. We provide digital mockups, renderings, or visual references for approval prior to fabrication."
    },
    {
      q: "Who owns custom-fabricated items?",
      a: "Ownership is determined by the project agreement. Some custom pieces are client-owned, while others are added to the New Project Designs collection at a reduced fabrication cost. "
    }
  ],

  "Booking & Payments": [
    {
      q: "How do I reserve my event date?",
      a: "Through the website rental system, agreeing to the terms and conditions and submitting payment secures your event date.  For custom inquiries, a signed agreement and non-refundable retainer are required to secure your event date."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept credit cards, ACH transfers (custom inquiries), and approved business checks (custom inquiries). Please contact us if you wish to pay by another method."
    },
    {
      q: "When is final payment due?",
      a: "Final balances are typically due 2 days prior to the event, unless otherwise specified in your contract.   If ordered within two (2) weeks of the event, full payment is required upon reservation.  Rental or custom items will not be delivered if the balance is not paid."
    }
  ],

  "Delivery, Installation & Pickup": [
    {
      q: "Do you handle delivery and installation?",
a: "Yes. Our professional team manages all logistics regarding the setup of the event decor purchased through our company.  We ensure your event is executed seamlessly and safely.  Our team does not take responsibility for the installation of decor that we do not provide (i.e. floral, neon signs, light fixtures, etc.)"
    },
    {
      q: "Do you have a minimum for delivery services?",
      a: "Our minimum purchase price is $1000 (before taxes).  Once you’ve reached this subtotal, our delivery services can be applied.For deliveries outside of Los Angeles and Orange Counties, please reach out to hello@newprojectdesigns.com for order requirements and delivery fee information."
    },
    {
      q: "What are your labor and delivery charges?",
      a: "The labor and delivery fees start at 14% of the order subtotal. If delivery is out of our designated delivery area, this percentage can increase.  Furthermore, if the venue requires a specialized delivery (i.e. stairs, small elevator, difficult delivery route, etc.) there may be additional fees. We then add a mileage charge based on the round trips from our shop, located in Anaheim, to your event location. "
    },
    {
      q: "Do you coordinate with venues?",
      a: "Absolutely. We can work directly with venue management to comply with load-in times, access rules, and installation requirements."
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
      a: "All retainers are non-refundable. Cancellations within a specified timeframe may be subject to additional charges as outlined in your agreement. Cancellations within twenty one  (21) days of the event may result in Client responsibility for up to 100% of the contracted amount. Postponements are subject to availability.  Accommodations can be made if the cancellation was due to a medical emergency, venue cancellation, or an issue out of the Client’s control.  Reservations can be honored up to one (1) year."
    },
    {
      q: "Can I make changes after booking?",
      a: "We’re happy to accommodate changes based on availability and timing. Significant changes close to the event date may incur additional fees or may not be permitted."
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
