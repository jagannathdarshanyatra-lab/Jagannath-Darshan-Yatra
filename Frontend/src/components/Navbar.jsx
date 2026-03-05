import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, MapPin, User, LogOut, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";


const navLinks = [
  { name: "Home", path: "/" },
  { name: "Destinations", path: "/destinations" },
  { name: "Packages", path: "/packages?state=odisha" },
  { name: "Experiences", path: "/experiences" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Check for logged in user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]); // Re-check on route change

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsProfileOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+919556006338" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="w-4 h-4" />
              +91 95560 06338
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Bhubaneswar, Odisha
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Experience Incredible Odisha</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-card/95 backdrop-blur-md shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-xl md:text-2xl font-bold text-primary">Jagannath Darshan Yatra</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8 ml-24">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-medium transition-colors duration-300 ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Button / Profile */}
            <div className="hidden md:flex items-center gap-4 mr-24">
              <Link to="/packages?state=odisha">
                <Button variant="hero" size="lg">
                  Book Now
                </Button>
              </Link>
              {user ? (
                /* Profile Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground hidden lg:block max-w-[100px] truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-border bg-muted/30">
                          <p className="font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/bookings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <span>My Bookings</span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-border py-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="hidden lg:flex">
                    Login / Sign Up
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-card border-t border-border"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                {/* Mobile User Info */}
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}

                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 font-medium ${
                      location.pathname === link.path
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full mb-2" size="lg">
                        My Profile
                      </Button>
                    </Link>
                    <Link to="/bookings" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full mb-2" size="lg">
                        My Bookings
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full mb-2 text-red-500 border-red-200 hover:bg-red-50" 
                      size="lg"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full mb-2" size="lg">
                      Login / Sign Up
                    </Button>
                  </Link>
                )}
                <Link to="/packages?state=odisha" onClick={() => setIsOpen(false)}>
                  <Button variant="hero" className="w-full" size="lg">
                    Book Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;

