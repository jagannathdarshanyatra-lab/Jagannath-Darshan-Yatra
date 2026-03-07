import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    package: "",
    destination: "",
  });

  const [packages, setPackages] = useState([]);
  const destinations = ["Puri", "Bhubaneswar", "Chilika", "Konark"];
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const [status, setStatus] = useState({ loading: false, error: null });

  // FAQ state - fetched from backend
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  
  // FAQ pagination
  const FAQS_PER_PAGE = 5;
  const [faqPage, setFaqPage] = useState(0);

  // API URL construction - handles cases where VITE_API_URL includes /api
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_URL = API_BASE.includes('/api') ? API_BASE : `${API_BASE.replace(/\/$/, "")}/api`;

  // Fetch FAQs from backend on mount
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`${API_URL}/faqs`);
        const data = await res.json();
        if (data.success) {
          setFaqs(data.faqs);
        }
      } catch {
        // Ignore faqs fetch error
      } finally {
        setFaqsLoading(false);
      }
    };
    
    fetchFaqs();
  }, [API_URL]);

  // Fetch packages from backend on mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${API_URL}/packages`);
        const data = await res.json();
        if (data.success) {
          setPackages(data.packages);
        }
      } catch {
        // Silently fail - dropdown will be empty. Ignore packages fetch error.
      }
    };
    
    fetchPackages();
  }, [API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });
    
    const contactUrl = `${API_URL}/contact`;

    
    try {
      const res = await fetch(contactUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "", package: "", destination: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 md:pt-32">
        {/* Hero */}
        <section className="bg-hero-gradient py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
                Get in Touch
              </h1>
              <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                Have questions? Ready to book? We're here to help you plan 
                the perfect Odisha adventure.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6 -mt-20">
              {[
                { icon: Phone, title: "Call Us", info: "+91 95560 06338", action: "tel:+919556006338" },
                { icon: MessageCircle, title: "WhatsApp", info: "+91 95560 06338", action: "https://wa.me/919556006338" },
                { icon: Mail, title: "Email", info: "jagannathdarshanyatra@gmail.com", action: "mailto:jagannathdarshanyatra@gmail.com" },
                { icon: Clock, title: "Hours", info: "24/7 Support", action: null },
              ].map((item, index) => {
                const Card = item.action ? motion.a : motion.div;
                return (
                  <Card
                    key={index}
                    href={item.action || undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-card rounded-2xl p-6 text-center shadow-card hover:shadow-elevated transition-all duration-300 border border-border hover:border-primary/30 ${!item.action ? 'cursor-default' : ''}`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.info}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-16 bg-warm-gradient">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                  Send Us a Message
                </h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>

                {submitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-emerald-800 mb-2">Message Sent!</h3>
                    <p className="text-emerald-700">We'll get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="+91 95560 06338"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Interested Package
                        </label>
                        <select
                          value={formData.package}
                          onChange={(e) => setFormData({ ...formData, package: e.target.value, destination: "" })}
                          className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select a package</option>
                          {(() => {
                            const tierOrder = ['lite', 'standard', 'pro', 'premium', 'elite'];
                            const uniqueTiers = [...new Set(packages.map((pkg) => pkg.variant).filter(Boolean))];
                            return uniqueTiers
                              .sort((a, b) => tierOrder.indexOf(a) - tierOrder.indexOf(b))
                              .map((v) => (
                                <option key={v} value={v.charAt(0).toUpperCase() + v.slice(1)}>
                                  {v.charAt(0).toUpperCase() + v.slice(1)}
                                </option>
                              ));
                          })()}
                        </select>
                      </div>

                      {formData.package && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Destination
                          </label>
                          <select
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">Select destination</option>
                            {destinations.map((dest) => (
                              <option key={dest} value={dest}>{dest}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="Tell us about your travel plans..."
                      />
                    </div>


                    {status.error && (
                      <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
                        {status.error}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="xl" 
                      className="w-full"
                      disabled={status.loading}
                    >
                      {status.loading ? 'Sending...' : 'Send Message'}
                      {!status.loading && <Send className="w-5 h-5 ml-2" />}
                    </Button>
                  </form>
                )}
              </motion.div>

              {/* Office Info */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                  Visit Our Office
                </h2>
                
                <div className="bg-card rounded-2xl overflow-hidden shadow-card mb-8">
                  <div className="h-64 z-0">
                    <MapContainer 
                      center={[20.296059, 85.867256]} 
                      zoom={15} 
                      scrollWheelZoom={false} 
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[20.296059, 85.867256]} icon={redIcon}>
                        <Popup>
                          Jagannath Darshan Yatra Travels <br /> Esplanade One Mall, Bhubaneswar.
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">Jagannath Darshan Yatra Travels</h3>
                    <p className="text-muted-foreground mb-4">
                      Office No: 307, 3rd Floor, <br />
                      Esplanade One Mall, Rasulgarh, <br />
                      Bhubaneswar, Odisha 751010, India
                    </p>
                    <div className="flex gap-3">
                      <a 
                        href="https://www.google.com/maps/dir/?api=1&destination=20.296059,85.867256" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="default" size="sm">
                          Get Directions
                        </Button>
                      </a>
                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=20.296059,85.867256" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          View on Map
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Quick Contact */}
                <div className="bg-hero-gradient rounded-2xl p-6 text-primary-foreground">
                  <h3 className="font-serif text-xl font-bold mb-4">Need Immediate Help?</h3>
                  <p className="text-primary-foreground/80 mb-4">
                    Our travel experts are available 24/7 to assist you with bookings, 
                    queries, or any travel emergencies.
                  </p>
                  <a href="https://wa.me/917205099129" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 w-full gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-secondary text-primary text-sm font-medium mb-4">
                FAQs
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
            </motion.div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs
                .slice(faqPage * FAQS_PER_PAGE, (faqPage + 1) * FAQS_PER_PAGE)
                .map((faq, index) => {
                  const actualIndex = faqPage * FAQS_PER_PAGE + index;
                  return (
                    <motion.div
                      key={faq._id || actualIndex}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-secondary rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === actualIndex ? null : actualIndex)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <span className="font-medium text-foreground pr-4">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                            openFaq === actualIndex ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openFaq === actualIndex && (
                        <div className="px-5 pb-5 text-muted-foreground">
                          {faq.answer}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
            </div>

            {/* FAQ Pagination */}
            {faqs.length > FAQS_PER_PAGE && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFaqPage(prev => Math.max(0, prev - 1))}
                  disabled={faqPage === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {faqPage + 1} of {Math.ceil(faqs.length / FAQS_PER_PAGE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFaqPage(prev => Math.min(Math.ceil(faqs.length / FAQS_PER_PAGE) - 1, prev + 1))}
                  disabled={faqPage >= Math.ceil(faqs.length / FAQS_PER_PAGE) - 1}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
