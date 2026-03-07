import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Loader2, PackageX, Clock, CheckCircle2, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/forms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { generateInvoicePdf } from "@/utils/InvoicePdf";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = API_BASE.includes('/api') ? API_BASE : `${API_BASE.replace(/\/$/, "")}/api`;

const Bookings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage]);

  const fetchBookings = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Default limit is 5 for user view
      const limit = 5;
      const response = await fetch(`${API_URL}/bookings?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
        setTotalPages(data.pages);
        setCurrentPage(data.page);
      } else {
        if (response.status === 401) {
             navigate("/login");
        } else {
             toast.error("Failed to load bookings");
        }
      }
    } catch (error) {
      console.error("Bookings fetch error:", error);
      toast.error("Error loading bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "pending": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "cancelled": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "cancellation_requested": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "completed": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusIcon = (status) => {
      switch (status) {
          case "confirmed": return <CheckCircle2 className="w-3 h-3" />;
          case "cancelled": return <XCircle className="w-3 h-3" />;
          case "cancellation_requested": return <Clock className="w-3 h-3" />;
          default: return <Clock className="w-3 h-3" />;
      }
  }

  const getStatusLabel = (status) => {
    if (status === 'cancellation_requested') return 'Cancel Requested';
    return status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <main className="pt-24 md:pt-36 pb-12 min-h-screen bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8"
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">My Bookings</h1>
                <p className="text-muted-foreground">View and manage your travel bookings</p>
              </div>
              <Link to="/packages">
                <Button variant="outline" size="sm">Book New Trip</Button>
              </Link>
            </motion.div>

            {bookings.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl p-12 text-center border border-border shadow-sm flex flex-col items-center justify-center min-h-[400px]"
              >
                 <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <PackageX className="w-10 h-10 text-muted-foreground" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">No bookings found</h3>
                 <p className="text-muted-foreground mb-8 max-w-md">
                   You haven't made any bookings yet. Explore our curated packages and start your journey today!
                 </p>
                 <Link to="/packages">
                   <Button variant="hero" size="lg">Explore Packages</Button>
                 </Link>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image Thumbnail */}
                      <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                        <img 
                          src={booking.packageImage || "/placeholder-image.jpg"} 
                          alt={booking.packageName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5 border border-white/10">
                           <MapPin className="w-3 h-3" />
                           {booking.packageName}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                                    {getStatusIcon(booking.status)}
                                    {getStatusLabel(booking.status)}
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                    {booking.packageName}
                                </h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>Trip Date: {new Date(booking.tripDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">Booking ID:</span>
                                        <span className="font-mono text-xs opacity-70">#{booking._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                                <p className="text-2xl font-bold font-serif text-primary">₹{booking.totalPrice.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-border mt-auto gap-4">
                            <span className="text-[10px] sm:text-sm text-muted-foreground">
                                Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                              {['confirmed', 'completed'].includes(booking.status) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1 px-2 h-8 sm:h-9 text-[10px] sm:text-sm text-primary border-primary/30 hover:bg-primary hover:text-white shrink-0"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    try {
                                      await generateInvoicePdf(booking);
                                      toast.success("Invoice downloaded!");
                                    } catch {
                                      toast.error("Failed to generate invoice");
                                    }
                                  }}
                                >
                                  <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  Invoice
                                </Button>
                              )}
                              <Link to={`/bookings/${booking._id}`} className="shrink-0">
                                  <Button variant="outline" size="sm" className="group/btn h-8 sm:h-9 px-2 sm:px-4 text-[10px] sm:text-sm">
                                      View Details
                                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                  </Button>
                              </Link>
                            </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;
