import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowRight, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/forms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import Logo from "@/assets/Logo_Bharat_Darshan.webp";

// API base URL - change for production
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = API_BASE.includes('/api') ? API_BASE : `${API_BASE.replace(/\/$/, "")}/api`;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || '/';
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isForgotPassword && formData.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      let endpoint;
      if (isForgotPassword) {
        endpoint = "/auth/reset-password";
      } else {
        endpoint = isLogin ? "/auth/login" : "/auth/register";
      }

      const body = isForgotPassword
        ? { email: formData.email, password: formData.password }
        : isLogin
          ? { email: formData.email, password: formData.password }
          : formData;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        if (isForgotPassword) {
          toast.success("Password reset successfully! You can now log in.");
          setIsForgotPassword(false);
          setIsLogin(true);
        } else {
          // Store token and user data
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
          navigate(returnTo);
        }
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <main className="pt-24 pb-12 min-h-screen flex items-center justify-center bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row bg-card rounded-3xl shadow-2xl overflow-hidden max-w-4xl mx-auto border border-border"
          >
            {/* Left Side - Image/Decoration */}
            <div className="md:w-1/2 bg-hero-gradient p-12 text-primary-foreground flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <Link to="/" className="inline-block mb-8">
                  <img src={Logo} alt="Bharat Darshan Logo" className="h-20 w-auto" />
                </Link>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                  {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back!" : "Join Our Community"}
                </h2>
                <p className="text-primary-foreground/80 text-lg">
                  {isForgotPassword 
                    ? "Enter your email and a new password to reset your account."
                    : isLogin
                      ? "Log in to access your bookings and exclusive offers."
                      : "Sign up to start your journey with amazing travel experiences."}
                </p>
              </div>
              
              <div className="relative z-10 mt-12">
                <div className="flex items-center gap-4 text-sm font-medium bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="p-2 bg-white/20 rounded-full">
                    <LogOutIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p>Discover Odisha's</p>
                    <p className="opacity-80">Best Kept Secrets</p>
                  </div>
                </div>
              </div>

              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Right Side - Form */}
            <div className="md:w-1/2 p-8 md:p-12 relative bg-card">
              <div className="flex justify-end mb-8">
                {isForgotPassword ? (
                   <button
                   onClick={() => setIsForgotPassword(false)}
                   className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                 >
                   Back to Login
                 </button>
                ) : (
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    {isLogin ? "Create an account" : "Already have an account?"}
                  </button>
                )}
              </div>

              <div className="mb-8">
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  {isForgotPassword ? "Forgot Password" : isLogin ? "Sign In" : "Sign Up"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && !isForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isForgotPassword ? "Confirm Email Address" : "Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isForgotPassword ? "New Password" : "Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {isForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {isLogin && !isForgotPassword && (
                  <div className="flex justify-end">
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <Button variant="hero" size="lg" className="w-full group" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isForgotPassword ? "Resetting..." : isLogin ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : (
                    <>
                      {isForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Helper icon component
const LogOutIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

export default Login;
