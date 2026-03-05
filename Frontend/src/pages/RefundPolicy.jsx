import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RefreshCcw, AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      
      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">Refund & Cancellation Policy</h1>
              <p className="text-gray-600">Fair and transparent policies for your peace of mind.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-8 text-gray-700 leading-relaxed">
              
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCcw className="w-6 h-6 text-orange-600" />
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Overview</h2>
                </div>
                <p>
                  At Jagannath Darshan Yatra, we value our customers and understand that plans can change. We strive to make our cancellation and refund process as smooth as possible, while also respecting the policies of our partners (hotels, transporters).
                </p>
              </section>

              <section>
                 <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <h3 className="font-serif text-xl font-bold text-gray-900">Cancellation Timeline</h3>
                </div>
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Before Trip</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">20 Days or more</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">100% Refund *</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">15 - 20 Days</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">85% Refund</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">7 - 15 Days</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">70% Refund</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2 - 7 Days</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">50% Refund</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 underline decoration-red-200 underline-offset-4">Less than 2 Days</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">No Refund</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm text-gray-500 italic">
                  * Excluding any non-refundable booking fees or taxes already remitted.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  <h3 className="font-serif text-xl font-bold text-gray-900">Refund Processing</h3>
                </div>
                <p>
                  Once a cancellation is confirmed, the refund amount will be calculated based on the policy above.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Refunds will be processed within <strong>5-7 business days</strong>.</li>
                  <li>The amount will be credited back to the original source of payment (Credit Card, Debit Card, UPI, etc.).</li>
                  <li>We will notify you via email once the refund has been initiated.</li>
                </ul>
              </section>

              <section>
                 <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-serif text-xl font-bold text-gray-900">Non-Refundable Items</h3>
                </div>
                <p>
                  Certain components of your packages may be non-refundable, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Specific high-demand temple darshan tickets (once booked).</li>
                  <li>Last-minute custom additions to the itinerary.</li>
                </ul>
              </section>

               <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Force Majeure</h3>
                <p>
                  In the event of cancellations due to "Force Majeure" events (natural disasters, pandemics, government restrictions, temple closure orders), Jagannath Darshan Yatra will work with partners to provide a maximum possible refund or a credit note for future travel. However, full refunds cannot be guaranteed in such extreme circumstances.
                </p>
              </section>

               <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                <p className="font-medium">
                  To request a cancellation or check your refund status, please email us at <a href="mailto:bharatdarshan.hq@gmail.com" className="text-orange-600 hover:underline">bharatdarshan.hq@gmail.com</a> with your Booking ID.
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

export default RefundPolicy;
