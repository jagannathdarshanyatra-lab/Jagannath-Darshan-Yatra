import { motion } from "framer-motion";
import { Shield, MapPin, HeartHandshake, Clock, Award, Users } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Local Odisha Expertise",
    description: "Born and raised in Odisha, our team knows every hidden gem, sacred temple, and local secret.",
  },
  {
    icon: Shield,
    title: "Safe Travel Promise",
    description: "Your safety is our priority. Verified hotels, sanitized vehicles, and emergency support 24/7.",
  },
  {
    icon: Award,
    title: "Handpicked Hotels",
    description: "We personally inspect and select each hotel to ensure comfort, cleanliness, and authentic hospitality.",
  },
  {
    icon: HeartHandshake,
    title: "Transparent Pricing",
    description: "No hidden charges, no surprises. What you see is what you pay. Complete transparency guaranteed.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Reach us anytime via WhatsApp, call, or email. We're always here to help during your journey.",
  },
  {
    icon: Users,
    title: "Personalized Tours",
    description: "Every traveler is unique. We customize itineraries based on your interests, pace, and preferences.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
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
            Why Choose Jagannath Darshan Yatra?
          </h2>
          <p className="text-muted-foreground text-lg">
            We don't just plan trips; we craft memories. Here's what sets us apart 
            from ordinary travel agencies.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
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
  );
};

export default WhyChooseUs;
