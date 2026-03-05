import { motion } from "framer-motion";
import { Button } from "@/components/ui/forms";
import { MessageCircle, Phone, Sparkles } from "lucide-react";

const WhatsAppCTA = () => {
  const whatsappNumber = "917205099129";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi! I'm interested in Jagannath Darshan Yatra travel packages. Please share the latest offers.`;

  return (
    <section className="py-20 bg-hero-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
            <span className="text-primary-foreground text-sm font-medium">Instant Response</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Get Exclusive Travel Deals
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Connect with us on WhatsApp to receive personalized offers, 
            instant support, and the latest packages for Odisha.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                className="bg-[#25D366] hover:bg-[#20BD5A] text-white px-8 py-6 text-lg w-full sm:w-auto gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageCircle className="w-6 h-6" />
                Chat on WhatsApp
              </Button>
            </a>
            
            <a 
              href="tel:+919556006338"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg w-full sm:w-auto gap-3"
              >
                <Phone className="w-5 h-5" />
                +91 95560 06338
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatsAppCTA;
