import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, ArrowLeft, Loader2, Users, Phone, 
  MessageSquare, CreditCard, Clock, CheckCircle2, XCircle, Printer,
  AlertTriangle, RefreshCcw, Ban, Download
} from "lucide-react";
import { Button } from "@/components/ui/forms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getRefundPreview, requestCancellation } from "@/services/packageService";
import { generateInvoicePdf } from "@/utils/InvoicePdf";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = API_BASE.includes('/api') ? API_BASE : `${API_BASE.replace(/\/$/, "")}/api`;

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  // Cancellation state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [refundPreview, setRefundPreview] = useState(null);
  const [loadingRefund, setLoadingRefund] = useState(false);
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
      } else {
        toast.error("Failed to load booking details");
        navigate("/bookings");
      }
    } catch (error) {
      console.error("Booking fetch error:", error);
      toast.error("Error loading booking details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCancelDialog = async () => {
    setShowCancelDialog(true);
    setLoadingRefund(true);
    try {
      const token = localStorage.getItem("token");
      const preview = await getRefundPreview(id, token);
      setRefundPreview(preview);
    } catch (error) {
      toast.error(error.message || "Could not load refund details");
    } finally {
      setLoadingRefund(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setGeneratingPdf(true);
    try {
      await generateInvoicePdf(booking);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate invoice. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleSubmitCancellation = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    setSubmittingCancel(true);
    try {
      const token = localStorage.getItem("token");
      const result = await requestCancellation(id, cancelReason, token);
      toast.success(result.message || "Cancellation request submitted successfully!");
      setShowCancelDialog(false);
      setCancelReason("");
      fetchBooking(); // Refresh booking data
    } catch (error) {
      toast.error(error.message || "Failed to submit cancellation request");
    } finally {
      setSubmittingCancel(false);
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

  const getStatusLabel = (status) => {
    switch (status) {
      case "cancellation_requested": return "Cancellation Requested";
      default: return status?.charAt(0).toUpperCase() + status?.slice(1);
    }
  };

  const canCancel = booking && ['pending', 'confirmed'].includes(booking.status);
  const isCancellationRequested = booking?.status === 'cancellation_requested';
  const isCancelled = booking?.status === 'cancelled';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <main className="pt-24 md:pt-36 pb-12 min-h-screen bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link to="/bookings" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bookings
              </Link>
              <h1 className="text-3xl font-serif font-bold">Booking Details</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                ID: <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{booking._id}</span>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 space-y-6"
              >
                {/* Header Card */}
                <div className="bg-hero-gradient rounded-3xl p-6 md:p-8 text-primary-foreground relative overflow-hidden shadow-lg">
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-white/20 backdrop-blur-sm border border-white/20 uppercase tracking-wider`}>
                           {getStatusLabel(booking.status)}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">{booking.packageName}</h2>
                        <div className="flex items-center gap-4 text-primary-foreground/80 text-sm">
                            <span className="flex items-center gap-1.5 backdrop-blur-sm bg-black/10 px-2 py-1 rounded-md">
                                <Calendar className="w-4 h-4" />
                                {new Date(booking.tripDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                      </div>
                      <div className="text-left md:text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                         <p className="text-sm opacity-80 mb-1">Total Amount</p>
                         <p className="text-3xl font-serif font-bold">₹{booking.totalPrice.toLocaleString()}</p>
                      </div>
                   </div>
                   
                   {/* Background decoration */}
                   <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </div>

                {/* Details Card */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                        Trip Information
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Travelers</p>
                            <div className="flex items-center gap-2 font-medium">
                                <Users className="w-4 h-4 text-primary" />
                                {booking.travelers} People
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Contact Number</p>
                            <div className="flex items-center gap-2 font-medium">
                                <Phone className="w-4 h-4 text-primary" />
                                {booking.contactPhone || "N/A"}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Booking Date</p>
                            <div className="flex items-center gap-2 font-medium">
                                <Clock className="w-4 h-4 text-primary" />
                                {new Date(booking.createdAt).toLocaleString()}
                            </div>
                        </div>

                         <div>
                            <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                            <div className="flex items-center gap-2 font-medium capitalize">
                                <CreditCard className="w-4 h-4 text-primary" />
                                {booking.paymentStatus}
                            </div>
                        </div>
                    </div>

                    {booking.specialRequests && (
                        <div className="mt-8 pt-6 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-2">Special Requests</p>
                            <div className="bg-muted/30 p-4 rounded-xl text-sm italic border border-border">
                                "{booking.specialRequests}"
                            </div>
                        </div>
                    )}
                </div>

                {/* Traveller Details Card */}
                {booking.travellerDetails && booking.travellerDetails.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
                      <Users className="w-5 h-5 text-primary" />
                      Traveller Details
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">#</th>
                            <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Name</th>
                            <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Gender</th>
                            <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Age</th>
                            <th className="text-left py-3 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {booking.travellerDetails.map((t, i) => {
                            const isChild = t.isChild || (t.age != null && t.age < 10);
                            return (
                              <tr key={i} className={`border-b border-border/50 ${isChild ? 'bg-blue-50/50' : ''}`}>
                                <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                                <td className="py-3 px-2 font-medium">{t.name || '-'}</td>
                                <td className="py-3 px-2">{t.gender || '-'}</td>
                                <td className="py-3 px-2">{t.age != null ? t.age : '-'}</td>
                                <td className="py-3 px-2">
                                  {isChild ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                      Child
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                      Adult
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Summary */}
                    {(() => {
                      const adults = booking.travellerDetails.filter(t => !t.isChild && (t.age == null || t.age >= 10)).length;
                      const children = booking.travellerDetails.length - adults;
                      return (
                        <div className="mt-4 pt-3 border-t border-border flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-medium">{booking.travellerDetails.length} Traveller(s)</span>
                          <span>•</span>
                          <span>{adults} Adult(s)</span>
                          {children > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">{children} Child(ren) <span className="text-xs">(under 10, free)</span></span>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Cancellation Request Status Card */}
                {isCancellationRequested && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl border-2 border-orange-200 dark:border-orange-800 p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-orange-800 dark:text-orange-300">Cancellation Request Pending</h3>
                        <p className="text-sm text-orange-600 dark:text-orange-400">Your cancellation request is being reviewed by our team</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between bg-white/60 dark:bg-black/20 rounded-xl p-3">
                        <span className="text-muted-foreground">Requested On</span>
                        <span className="font-medium">{new Date(booking.cancellationRequestedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between bg-white/60 dark:bg-black/20 rounded-xl p-3">
                        <span className="text-muted-foreground">Reason</span>
                        <span className="font-medium text-right max-w-[200px]">{booking.cancellationReason}</span>
                      </div>
                      {booking.refundAmount > 0 && (
                        <div className="flex justify-between bg-white/60 dark:bg-black/20 rounded-xl p-3">
                          <span className="text-muted-foreground">Expected Refund</span>
                          <span className="font-bold text-green-600">₹{booking.refundAmount.toLocaleString()} ({booking.refundPercentage}%)</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Cancelled + Refund Info Card */}
                {isCancelled && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-200 dark:border-red-800 p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-800 dark:text-red-300">Booking Cancelled</h3>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {booking.cancelledAt 
                            ? `Cancelled on ${new Date(booking.cancelledAt).toLocaleDateString()}`
                            : "This booking has been cancelled"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      {booking.cancellationReason && (
                        <div className="flex justify-between bg-white/60 dark:bg-black/20 rounded-xl p-3">
                          <span className="text-muted-foreground">Reason</span>
                          <span className="font-medium text-right max-w-[200px]">{booking.cancellationReason}</span>
                        </div>
                      )}
                      {booking.refundAmount > 0 && (
                        <>
                          <div className="flex justify-between bg-white/60 dark:bg-black/20 rounded-xl p-3">
                            <span className="text-muted-foreground">Refund Amount</span>
                            <span className="font-bold text-green-600">₹{booking.refundAmount.toLocaleString()} ({booking.refundPercentage}%)</span>
                          </div>
                          <div className="flex justify-between bg-white/60 dark:bg-black/20 rounded-xl p-3">
                            <span className="text-muted-foreground">Refund Status</span>
                            <span className={`font-semibold capitalize ${
                              booking.refundStatus === 'completed' ? 'text-green-600' :
                              booking.refundStatus === 'processing' ? 'text-blue-600' :
                              booking.refundStatus === 'failed' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {booking.refundStatus === 'none' ? 'No refund' : booking.refundStatus}
                            </span>
                          </div>
                          {booking.refundProcessedAt && (
                            <div className="flex justify-between bg-white/60 dark:bg-black/20 rounded-xl p-3">
                              <span className="text-muted-foreground">Refund Processed</span>
                              <span className="font-medium">{new Date(booking.refundProcessedAt).toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      )}
                      {booking.refundAmount === 0 && (
                        <div className="bg-white/60 dark:bg-black/20 rounded-xl p-3 text-center">
                          <span className="text-red-600 font-medium">No refund applicable (booking cancelled within 2 days of trip)</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Sidebar */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                 <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <img 
                        src={booking.packageImage || "/placeholder-image.jpg"} 
                        alt={booking.packageName}
                        className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                        <h4 className="font-bold mb-2">Need Help?</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Have questions about your booking? Our support team is here to help.
                        </p>
                        <Link to="/contact">
                            <Button variant="outline" className="w-full">Contact Support</Button>
                        </Link>
                    </div>
                 </div>

                 {['confirmed', 'completed'].includes(booking.status) && (
                     <Button 
                       variant="hero" 
                       className="w-full gap-2" 
                       onClick={handleDownloadInvoice}
                       disabled={generatingPdf}
                     >
                         {generatingPdf ? (
                           <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                         ) : (
                           <><Download className="w-4 h-4" /> Download Invoice</>
                         )}
                     </Button>
                 )}

                 {/* Cancel Booking Button */}
                 {canCancel && (
                   <Button 
                     variant="outline" 
                     className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950/30"
                     onClick={handleOpenCancelDialog}
                   >
                     <Ban className="w-4 h-4" />
                     Cancel Booking
                   </Button>
                 )}

                 {/* Refund Policy Link */}
                 <div className="text-center">
                   <Link to="/refund" className="text-sm text-muted-foreground hover:text-primary transition-colors underline">
                     View Refund & Cancellation Policy
                   </Link>
                 </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Booking Confirmation Dialog */}
      <AnimatePresence>
        {showCancelDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !submittingCancel && setShowCancelDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-red-50 dark:bg-red-950/30 p-6 border-b border-red-100 dark:border-red-900">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Cancel Booking</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Refund Preview */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Refund Information
                  </h4>
                  {loadingRefund ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Calculating refund...</span>
                    </div>
                  ) : refundPreview ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Booking Amount</span>
                        <span className="font-medium">₹{refundPreview.totalPrice?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Days Until Trip</span>
                        <span className="font-medium">{refundPreview.daysUntilTrip} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Refund Percentage</span>
                        <span className={`font-bold ${refundPreview.refundPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {refundPreview.refundPercentage}%
                        </span>
                      </div>
                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                      <div className="flex justify-between text-base">
                        <span className="font-semibold">Refund Amount</span>
                        <span className={`font-bold ${refundPreview.refundAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {refundPreview.refundAmount > 0 
                            ? `₹${refundPreview.refundAmount.toLocaleString()}`
                            : 'No refund'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">Could not load refund details</p>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please tell us why you want to cancel..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none text-sm"
                  />
                </div>

                {/* Important note */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
                  <strong>Note:</strong> Your cancellation request will be reviewed by our team. The refund (if applicable) will be processed within 5-7 business days after approval.
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCancelDialog(false)}
                  disabled={submittingCancel}
                >
                  Keep Booking
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleSubmitCancellation}
                  disabled={submittingCancel || !cancelReason.trim()}
                >
                  {submittingCancel ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Cancellation"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default BookingDetail;
