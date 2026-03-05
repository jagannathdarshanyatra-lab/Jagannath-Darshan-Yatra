import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      
      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-gray-600">Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-8 text-gray-700 leading-relaxed">
              
              <section>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p>
                  Welcome to Jagannath Darshan Yatra. By accessing our website, mobile application, or booking services, you agree to comply with and be bound by these Terms of Service. Please read them carefully. If you do not agree with any part of these terms, you must not use our services.
                </p>
              </section>

              <section>
                 <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                  <h3 className="font-bold text-orange-900 mb-2">2. Sacred Conduct & Temple Regulations</h3>
                  <p className="text-orange-800">
                    As a provider of spiritual tourism experiences, specifically centered around the <strong>Lord Jagannath Temple</strong> in Puri, strictly adhere to the temple's customs and regulations.
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-orange-800">
                    <li><strong>Prohibited Items:</strong> Leather items, cameras, mobile phones, and weapons are strictly prohibited inside the temple premises.</li>
                    <li><strong>Dress Code:</strong> Guests must adhere to a modest and traditional dress code.</li>
                    <li><strong>Entry:</strong> Entry to the main temple is restricted to Hindus as per longstanding temple tradition. We respect these traditions and request our guests to do the same.</li>
                    <li><strong>Conduct:</strong> Intoxication or disrespectful behavior within sacred zones will result in immediate termination of services without refund.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">3. Booking & Payments</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Reservation:</strong> Bookings are subject to availability and are only confirmed upon receipt of the advance payment or full payment as specified.</li>
                  <li><strong>Identity Proof:</strong> Valid government-issued photo ID is mandatory for all guests at the time of check-in at hotels and for certain darshan bookings.</li>
                  <li><strong>Pricing:</strong> Prices are subject to change without notice until a booking is confirmed. Taxes are applicable as per government norms.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">4. User Responsibilities</h3>
                <p>
                  You agree to use our services only for lawful purposes. You are responsible for ensuring that all information provided during booking is accurate. Jagannath Darshan Yatra is not liable for issues arising from incorrect details (e.g., wrong dates, name mismatches).
                </p>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">5. Intellectual Property</h3>
                <p>
                  All content on this website, including text, graphics, logos, and images, is the property of Jagannath Darshan Yatra or its content suppliers and is protected by copyright laws. Unauthorized use of any content is strictly prohibited.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h3>
                <p>
                  Jagannath Darshan Yatra acts as an aggregator and facilitator. We are not liable for:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Acts of God, force majeure events, or expenses arising from delays or changes in schedules.</li>
                  <li>Services provided by third-party vendors (hotels, transport) beyond our direct control, though we strive to ensure quality.</li>
                  <li>Personal injury, loss, or damage to property during the tour, although we prioritize guest safety.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">7. Governing Law</h3>
                <p>
                  These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts in <strong>Bhubaneswar, Odisha</strong>.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">8. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the site constitutes acceptance of the modified terms.
                </p>
              </section>

               <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                <p className="font-medium">
                  For any questions regarding these Terms of Service, please contact us at <a href="mailto:bharatdarshan.hq@gmail.com" className="text-orange-600 hover:underline">bharatdarshan.hq@gmail.com</a>
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
