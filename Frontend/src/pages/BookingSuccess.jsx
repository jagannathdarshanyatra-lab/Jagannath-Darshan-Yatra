import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Calendar, Users, Phone, ArrowRight, Home, Download } from 'lucide-react';
import { FaHotel } from 'react-icons/fa';
import { Button } from '@/components/ui/forms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setBooking(data.booking);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            {/* Success Animation */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-14 h-14 text-green-500" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              >
                Booking Confirmed!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-lg"
              >
                Your spiritual journey awaits. We'll contact you shortly with more details.
              </motion.p>
            </div>

            {/* Booking Details Card */}
            {booking && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
              >
                {/* Package Header */}
                <div className="relative h-48">
                  <img
                    src={booking.packageImage || '/assets/hero1.webp'}
                    alt={booking.packageName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="font-serif text-2xl font-bold">{booking.packageName}</h2>
                    <p className="text-white/80 text-sm mt-1">Booking ID: {booking._id?.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-orange-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Trip Date</span>
                      </div>
                      <p className="font-bold text-gray-900">
                        {new Date(booking.tripDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Travelers</span>
                      </div>
                      <p className="font-bold text-gray-900">{booking.travelers} People</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">Contact Phone</span>
                    </div>
                    <p className="font-bold text-gray-900">{booking.contactPhone}</p>
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Amount Paid</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{booking.totalPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`rounded-2xl p-4 text-center ${
                    booking.status === 'confirmed' ? 'bg-green-100' :
                    booking.status === 'pending' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    <span className={`font-bold uppercase text-sm ${
                      booking.status === 'confirmed' ? 'text-green-700' :
                      booking.status === 'pending' ? 'text-yellow-700' :
                      'text-gray-700'
                    }`}>
                      Status: {booking.status || 'Processing'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* What's Next Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
            >
              <h3 className="font-serif text-xl font-bold mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmation Email</p>
                    <p className="text-sm text-gray-500">You'll receive a detailed confirmation email shortly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Our Team Will Call</p>
                    <p className="text-sm text-gray-500">We'll contact you within 24 hours to finalize details.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                  <div>
                    <p className="font-medium text-gray-900">Get Ready!</p>
                    <p className="text-sm text-gray-500">Pack your bags for an unforgettable spiritual journey.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link to="/bookings" className="flex-1">
                <Button className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-lg">
                  <Package className="w-5 h-5 mr-2" />
                  View My Bookings
                </Button>
              </Link>
              
              {/* Show Select Hotels button if not yet selected (and booking is confirmed/paid ideally, but for now just show it) */}

              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full h-14 border-gray-200 hover:bg-gray-50 rounded-xl text-lg">
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingSuccess;
