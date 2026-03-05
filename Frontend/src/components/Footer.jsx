import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";


const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-xl md:text-2xl font-bold text-primary-foreground">Jagannath Darshan Yatra</span>
            </Link>
            <p className="text-primary-foreground/80 leading-relaxed">
              Your trusted travel partner for authentic Odisha experiences. From sacred temples to pristine beaches, we craft unforgettable journeys.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary/20 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {["Home", "Destinations", "Packages", "Experiences", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase() === "home" ? "" : link.toLowerCase()}`}
                    className="text-primary-foreground/80 hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-6">Popular Destinations</h3>
            <ul className="space-y-3">
              {["Puri Beach", "Konark Sun Temple", "Chilika Lake", "Bhubaneswar", "Jagannath Temple"].map((dest) => (
                <li key={dest}>
                  <Link
                    to="/destinations"
                    className="text-primary-foreground/80 hover:text-primary transition-colors"
                  >
                    {dest}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  Office No: 307, 3rd Floor, Esplanade One Mall, Rasulgarh, Bhubaneswar, Odisha 751010
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+919556006338" className="text-primary-foreground/80 hover:text-primary transition-colors">
                  +91 95560 06338
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:bharatdarshan.hq@gmail.com" className="text-primary-foreground/80 hover:text-primary transition-colors">
                  bharatdarshan.hq@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© 2026 Jagannath Darshan Yatra. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/refund" className="hover:text-primary transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
