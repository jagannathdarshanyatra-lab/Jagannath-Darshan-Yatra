import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      
      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-8 text-gray-700 leading-relaxed">
              
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-orange-600" />
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Privacy Policy Overview</h2>
                </div>
                <p>
                  Privacy policy is required by the law and this policy only applies to Jagannath Darshan Yatra and not to the websites of other companies, individuals or organisations to whom we provide links to our websites.
                </p>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mt-4 rounded-r-lg">
                  <p className="font-medium text-orange-800">
                    <strong>Note:</strong> Our policies, especially regarding conduct and entry, are strictly aligned with the rules and regulations of the <strong>Lord Jagannath Temple</strong> in Puri. We request all guests to respect and adhere to these sacred guidelines during their spiritual journey.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Use of Your Information</h3>
                <p>
                  We collect your information for the safety of our users who use our platform and guests who book through Jagannath Darshan Yatra to understand who we are accommodating at our partner properties, for the safety of staff. In addition, website user and guest data is collected for statistical purposes. We also collect our guests’ nationality, date of birth, gender, for statistical analysis purposes. When you visit our websites, we may automatically log your IP address (the unique address which identifies your computer on the internet). We use IP addresses to help us manage our websites and to collect broad demographic information for analytical use. For reservations, we send guests confirmation emails and will therefore require your email address. Exceptions may occur in the case of us needing to contact previous guests in relation to post or lost property.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Reservation Data</h3>
                <p className="mb-4">
                  In order for us to confirm a reservation for you, we do require some information. This will usually consist of:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Your name</li>
                  <li>Telephone or mobile number – in case of an emergency</li>
                  <li>Gender</li>
                  <li>Nationality</li>
                  <li>Date of Birth</li>
                  <li>Identification data i.e. Passport, Driving License details</li>
                  <li>Credit card details, including the three-digit code that appears on the back of your credit card</li>
                  <li>Date of arrival and departure</li>
                  <li>Email address</li>
                </ul>
                <p>
                  Upon arrival, we will require the same information from your fellow travellers, please ensure they are all aware of this to ensure a quick and efficient check-in.
                </p>
              </section>
              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Credit Card Data</h3>
                <p>
                  In order to guarantee reservations via all channels (telephone, website or smartphone application, but not restricted to), we require a full 16 digit debit/credit card number, name on the card, card type (we accept VISA, Master card or Maestro), three digit security code and the expiry date. Your debit/credit card details are only used to secure your booking and Jagannath Darshan Yatra will only debit the account if you do not follow our cancellation procedure. For details on cancellation policies, please refer to the policy for the individual partner for which the booking is being made. Additionally, we may charge a monthly subscription fee if the user subscribes to a Jagannath Darshan Yatra paid membership and when the user authorizes Jagannath Darshan Yatra to periodically charge the card (monthly/quarterly/bi-annually/yearly) based on the type of membership chosen. The user can cancel the membership at any time. Jagannath Darshan Yatra indemnifies itself against all data use on and reservations made via third party websites/agents. Please refer to their relevant privacy policy and terms and conditions. Guests' Personal Data Jagannath Darshan Yatra respects guest privacy and will not sell or disclose guests’ personal information to any other person, business or third party unless in the case of an emergency and/or it is seen as part of our duty of care.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Keeping Guests' Information Updated</h3>
                <p>
                  We have guests returning to our partner properties on a regular basis. It is your duty to inform us if any of your personal information, which we hold about you, needs to be updated. We may contact you at any time, if you have booked accommodation with us and we suspect we hold false information about you.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-orange-600" />
                  <h3 className="font-serif text-xl font-bold text-gray-900">Website Security</h3>
                </div>
                <p>
                  The Internet is not a secure medium. However, we have put in place various security procedures, including firewalls that are used to block unauthorized traffic to our website.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Third Party Websites</h3>
                <p>
                  Our website contains links to many other websites promoting their business and needs to our guests. Jagannath Darshan Yatra indemnifies itself against all data use on and reservations made via third party websites/agents. Please refer to their relevant privacy policy and terms and conditions.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-5 h-5 text-orange-600" />
                  <h3 className="font-serif text-xl font-bold text-gray-900">Photography and Film</h3>
                </div>
                <p>
                  No permission is needed to take photos or film at our properties. However, we do recommend asking for permission before photographing or filming other guests who are not part of your group. Verbal consent is solicited as a goodwill gesture. On occasions we may commission crews to film or take photographs at our properties for promotional purposes. If you do not wish to be filmed or photographed, you are required to voluntarily leave the filming or photography area.
                </p>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Disclosing Guests' Personal Information to Third Parties</h3>
                <p>
                  Other than that for the purposes referred to in this policy, we will not disclose any personal information without your permission unless we are legally obliged to do so (for example, if required to do so by court order or for the purposes of prevention of fraud).
                </p>
              </section>

              <section>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Your Rights</h3>
                <p>
                  By submitting your information to us, you consent to the use of that information as set out in this Privacy Policy. You may request at any time that we provide you with the personal information we hold about you. You may also choose to add, modify or delete information about you stored with us. Provision of such information will be subject to proving your identity and full address with a utility bill and acceptable photo ID. For any such requests, please reach out to us on <a href="mailto:jagannathdarshanyatra@gmail.com" className="text-orange-600 hover:underline">jagannathdarshanyatra@gmail.com</a>.
                </p>
                <p className="mt-4">
                  You also have the right to lodge a complaint with an EU supervisory authority in case of discrepancies, however, we do hope you would give us chance to rectify it first by reaching out to us on <a href="mailto:jagannathdarshanyatra@gmail.com" className="text-orange-600 hover:underline">jagannathdarshanyatra@gmail.com</a>.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <h3 className="font-serif text-xl font-bold text-gray-900">CALIFORNIA-RESIDENT SPECIFIC RIGHTS</h3>
                </div>
                <p className="mb-4">
                  To the extent you are a 'consumer' as defined under the California Consumer Privacy Act of 2018 ("CCPA") and Jagannath Darshan Yatra is a 'business' as defined under CCPA, the following applies to you:
                </p>
                <p className="mb-4">
                  Subject to the provisions of the CCPA, you have the right to request in the manner provided herein, for the following:
                </p>
                
                <div className="pl-6 space-y-4 mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800">a. Right to request for information about the:</h4>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                       <li>Categories of Personal Data Jagannath Darshan Yatra has collected about you.</li>
                       <li>Specific pieces of Personal Data Jagannath Darshan Yatra has collected about you.</li>
                       <li>Categories of sources from which the Personal Data is collected.</li>
                       <li>Business or commercial purpose for collecting Personal Data.</li>
                       <li>Categories of third parties with whom the business shares Personal Data.</li>
                    </ul>
                  </div>
                  
                  <div>
                     <h4 className="font-bold text-gray-800">b. Right to request for deletion of any Personal Data collected about you by Jagannath Darshan Yatra.</h4>
                  </div>
                </div>

                <p>
                  If you seek to exercise the foregoing rights to access or delete Personal Data which constitutes 'Personal information' as defined in CCPA, please contact us at <a href="mailto:jagannathdarshanyatra@gmail.com" className="text-orange-600 hover:underline">jagannathdarshanyatra@gmail.com</a>. We respond to all requests we receive from you wishing to exercise your data protection rights within a reasonable timeframe in accordance with applicable data protection laws. By writing to us, you agree to receive communication from us seeking information from you in order to verify you to be the consumer from whom we have collected the Personal Data from and such other information as reasonably required to enable us to honour your request.
                </p>
                <p className="mt-4">
                  The list of categories of Personal Data collected and disclosed about consumers are enlisted under the head 'Use of Your Information'. Separately, Jagannath Darshan Yatra does not sell your Personal Data.
                </p>
              </section>

              <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">Changes to Our Privacy Policy</h3>
                <p>
                  We may change our Privacy Policy at any time. Continued use of our website signifies that you agree to any such changes.
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

export default PrivacyPolicy;
