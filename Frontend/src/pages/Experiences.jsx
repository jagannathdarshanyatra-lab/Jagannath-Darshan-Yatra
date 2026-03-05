import { motion } from "framer-motion";
import { Shield, MapPin, HeartHandshake, Clock, Award, Users, Camera, Compass, Heart } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import jagannathImage from "@/assets/Experience2.webp";
import experienceHero from "@/assets/ExperienceHero.webp";
import experience2 from "@/assets/Experience2.webp";
import experience3 from "@/assets/Experience3.webp";
import experience4 from "@/assets/Experience4.webp";

const whyChooseUs = [
  {
    icon: Camera,
    title: "Local Odisha Expertise",
    description: "Born and raised in Odisha, our team knows every hidden gem, sacred temple, and local secret that guidebooks miss.",
  },
  {
    icon: Camera,
    title: "Safe Travel Promise",
    description: "Your safety is our priority. Verified hotels, sanitized vehicles, trained drivers, and emergency support 24/7.",
  },
  {
    icon: Camera,
    title: "Handpicked Hotels",
    description: "We personally inspect and select each hotel to ensure comfort, cleanliness, location, and authentic hospitality.",
  },
  {
    icon: Camera,
    title: "Transparent Pricing",
    description: "No hidden charges, no last-minute surprises. What you see on the quote is exactly what you pay. Complete transparency.",
  },
  {
    icon: Camera,
    title: "24/7 Support",
    description: "Reach us anytime via WhatsApp, call, or email. Our dedicated support team is always here to help during your journey.",
  },
  {
    icon: Camera,
    title: "Personalized Tours",
    description: "Every traveler is unique. We customize itineraries based on your interests, pace, dietary needs, and preferences.",
  },
];

const experiences = [
  {
    icon: Camera,
    title: "Spiritual Journeys",
    description: "Connect with the divine at Jagannath Temple, experience ancient rituals, and find inner peace at sacred sites.",
    image: experience2,
  },
  {
    icon: Camera,
    title: "Heritage Exploration",
    description: "Walk through centuries of history at Konark Sun Temple, ancient caves, and architectural marvels of Kalinga dynasty.",
    image: experience3,
  },
  {
    icon: Camera,
    title: "Cultural Immersion",
    description: "Taste authentic Odia cuisine, watch classical Odissi dance, and experience the warmth of local hospitality.",
    image: experience4,
  },
];

const stats = [
  { number: "5000+", label: "Happy Travelers" },
  { number: "50+", label: "Tour Packages" },
  { number: "10+", label: "Years Experience" },
  { number: "100%", label: "Satisfaction Rate" },
];

const Experiences = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="relative h-[60vh] overflow-hidden">
          <img
            src={experienceHero}
            alt="Jagannath Darshan Yatra Experience"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center px-4"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/30 backdrop-blur-sm text-primary-foreground text-sm font-medium mb-6">
                 The Jagannath Darshan Yatra Experience
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
                Why Travel With Us?
              </h1>
              <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                More than just a tour operator  we're your travel family, 
                dedicated to creating memories that last a lifetime.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-hero-gradient py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                    {stat.number}
                  </div>
                  <div className="text-primary-foreground/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-secondary text-primary text-sm font-medium mb-4">
                Trust & Excellence
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                The Jagannath Darshan Yatra Promise
              </h2>
              <p className="text-muted-foreground text-lg">
                We don't just plan trips; we craft experiences. Here's what sets us apart 
                from ordinary travel agencies.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChooseUs.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-8 rounded-2xl bg-gradient-to-br from-secondary/50 to-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Types */}
        <section className="py-20 bg-warm-gradient">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-secondary text-primary text-sm font-medium mb-4">
                 Types of Experiences
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                What Awaits You in Odisha
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden h-96"
                >
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                      <exp.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-primary-foreground mb-2">
                      {exp.title}
                    </h3>
                    <p className="text-primary-foreground/80">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <img
                  src={jagannathImage}
                  alt="Our Story"
                  className="rounded-2xl shadow-elevated"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-2 rounded-full bg-secondary text-primary text-sm font-medium mb-4">
                  Our Story
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Born in Odisha, Built for Travelers
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Jagannath Darshan Yatra was founded by a group of passionate Odisha natives who saw 
                    tourists struggling with unreliable guides, overpriced hotels, and missed 
                    experiences in their beautiful homeland.
                  </p>
                  <p>
                    We started with a simple mission: to share the real Odisha not the 
                    commercialized version, but the authentic soul of our temples, beaches, 
                    and culture.
                  </p>
                  <p>
                    Today, we've helped over 5,000 travelers experience the magic of Odisha, 
                    and we're just getting started. Soon, we'll bring the same quality and 
                    trust to destinations across India.
                  </p>
                </div>
                <Link to="/packages" className="inline-block mt-8">
                  <Button variant="hero" size="lg">
                    Start Your Journey
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-hero-gradient">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Experience Odisha?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Let us plan your perfect trip. Browse our packages or contact us 
              for a customized itinerary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/packages">
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" size="xl">
                  View Packages
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="heroOutline" size="xl">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Experiences;
