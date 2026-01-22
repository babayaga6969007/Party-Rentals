import NavbarTransparent from "../../components/layout/NavbarTransparent";
import logo from "../../assets/logo.png";

const TermsAndConditions = () => {
  return (
    <>
      <NavbarTransparent />

      <div className="page-wrapper min-h-screen bg-white px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* LOGO */}
          <div className="flex justify-center mb-10">
            <img
              src={logo}
              alt="New Project Designs"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* TITLE */}
          <h1
            className="text-4xl text-center font-semibold text-[#2D2926] mb-2"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Event Rental, Fabrication & Services Agreement
          </h1>

          <p className="text-center text-sm text-gray-500 mb-10">
            Terms & Client Agreement
          </p>

          {/* CONTENT */}
          <div className="space-y-8 text-[#2D2926] text-sm leading-relaxed">
            <p>
              <strong>New Project Designs, LLC</strong> is a California-based
              creative studio specializing in luxury event design, custom
              fabrication, and curated rental collections. By submitting an
              inquiry, approving a proposal, making payment, or accepting these
              terms electronically, Client agrees to be bound by this Agreement.
            </p>

            <section>
              <h2 className="text-lg font-semibold mb-2">Services</h2>
              <p>
                Services may include design, fabrication, rental, delivery,
                installation, strike, and retrieval of event décor and
                experiential elements (“Rental Items”) as outlined in the
                approved proposal, receipt, or invoice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Payment Terms</h2>
              <p>
                A non-refundable 60% retainer is required to reserve event dates
                and begin services. The remaining 40% balance is due prior to
                the event. Failure to remit payment may result in suspension or
                cancellation of services.
              </p>
              <p className="mt-2">
                If ordered within two (2) weeks of the event, full payment is
                required upon reservation. A credit card authorization will be
                kept on file in the event of damages, theft, or loss of Rental
                Items.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Cancellation & Postponement
              </h2>
              <p>
                Cancellations result in forfeiture of the retainer. Cancellations
                within twenty-one (21) days of the event may result in Client
                responsibility for up to 100% of the contracted amount.
              </p>
              <p className="mt-2">
                Postponements are subject to availability. Accommodations may be
                made if cancellation was due to a medical emergency, venue
                cancellation, or circumstances beyond the Client’s control.
                Reservations may be honored up to one (1) year.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Ownership & Responsibility
              </h2>
              <p>
                All Rental Items remain the exclusive property of New Project
                Designs, LLC. Client assumes full responsibility for Rental Items
                from delivery through pickup.
              </p>
              <p className="mt-2">
                Client must ensure that all gates, doorways, elevators, and
                access points are sufficiently sized for safe entry. New Project
                Designs is not liable for venue damage caused by inadequate
                access and may refuse unsafe installations without refund.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Damage or Loss</h2>
              <p>
                Client agrees to pay for loss, theft, disappearance, or damage
                beyond normal wear and tear, including damage caused by guests,
                vendors, venue staff, or weather exposure. All damage will be
                assessed after the event and documented when possible.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Outdoor Events & Force Majeure
              </h2>
              <p>
                Outdoor installations are at the Client’s risk. New Project
                Designs shall not be liable for delays or non-performance due to
                weather, acts of God, or circumstances beyond reasonable
                control.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Safety & Compliance
              </h2>
              <p>
                Client is responsible for venue approvals, permits, fire marshal
                requirements, and compliance with all applicable laws. New
                Project Designs may refuse unsafe installations without refund.
              </p>
              <p className="mt-2">
                Client is responsible for injuries, loss, or damage to New
                Project Designs’ team or equipment caused by event attendees or
                non-company staff.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Indemnification</h2>
              <p>
                Client agrees to indemnify and hold harmless New Project Designs
                from claims arising out of event activities or use of Rental
                Items, except where prohibited by California law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by California law, New Project
                Designs’ liability shall not exceed the amount paid by Client.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Intellectual Property
              </h2>
              <p>
                All designs, drawings, and creative materials remain the
                intellectual property of New Project Designs, LLC.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Photography Release
              </h2>
              <p>
                Client grants permission for New Project Designs to photograph
                installations for portfolio and marketing use unless objection
                is submitted in writing prior to the event.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Governing Law</h2>
              <p>
                This Agreement shall be governed by the laws of the State of
                California.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Privacy Disclosure Notice
              </h2>
              <p>
                New Project Designs, LLC respects your privacy. Personal
                information is used solely to communicate, prepare proposals,
                fulfill services, process payments, and comply with legal
                obligations. Information is not sold or rented.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Electronic Acceptance
              </h2>
              <p>
                Electronic acceptance constitutes a legally binding signature
                under the California Uniform Electronic Transactions Act (UETA).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">
                Client Acknowledgment
              </h2>
              <p>
                By accepting these terms electronically and/or submitting
                payment, Client confirms they have read, understood, and agree
                to this Agreement.
              </p>
            </section>

            <p className="text-xs text-gray-500 pt-6 border-t">
              New Project Designs, LLC • Confidential & Proprietary
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
