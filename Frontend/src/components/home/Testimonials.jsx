import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Rajesh Sharma",
    location: "New Delhi",
    avatar: "RS",
    rating: 5,
    text: "The Jagannath Temple darshan was so well organized. No waiting, VIP treatment, and our guide knew all the rituals. Truly a divine experience!",
    package: "Royal Odisha Experience",
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Mumbai",
    avatar: "PP",
    rating: 5,
    text: "Chilika Lake boat ride at sunrise was magical! The dolphins, the birds, and the peaceful atmosphere. Jagannath Darshan Yatra made it perfect.",
    package: "Odisha Heritage Tour",
  },
  {
    id: 3,
    name: "Amit Kumar",
    location: "Bangalore",
    avatar: "AK",
    rating: 5,
    text: "Budget-friendly yet quality experience. Clean hotels, punctual transport, and knowledgeable guides. Will definitely book again!",
    package: "Budget Temple Trail",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    location: "Hyderabad",
    avatar: "SR",
    rating: 5,
    text: "The Konark Sun Temple tour was educational and awe-inspiring. Our guide explained every sculpture's meaning. Unforgettable!",
    package: "Odisha Heritage Tour",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-warm-gradient overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary text-primary text-sm font-medium mb-4">
            Loved by Travelers
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-muted-foreground text-lg">
            Real experiences from real travelers who explored Odisha with us.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-500 relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground leading-relaxed mb-6 text-lg">
                "{testimonial.text}"
              </p>

              {/* Package */}
              <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full mb-4">
                {testimonial.package}
              </span>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-hero-gradient flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
