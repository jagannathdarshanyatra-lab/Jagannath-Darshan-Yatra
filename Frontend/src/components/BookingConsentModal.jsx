import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Shield, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/forms';

const BookingConsentModal = ({ isOpen, onClose, onAccept, packageName }) => {
  const [agreedToDate, setAgreedToDate] = useState(false);
  const [agreedToRefund, setAgreedToRefund] = useState(false);

  if (!isOpen) return null;

  // Calculate the 7-day restriction date for the example message
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-orange-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-gray-900">Booking Terms & Consent</h2>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{packageName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {/* 7-Day Booking Rule */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-orange-700 font-bold">
                <Calendar className="w-5 h-5" />
                <h3>7-Day Advance Booking Required</h3>
              </div>
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex gap-4">
                <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  To ensure the best experience and confirmed arrangements, all bookings must be made at least <strong>7 days in advance</strong>.
                  <br />
                  <span className="text-gray-500 italic mt-2 block">
                    Example: If today is {formatDate(today)}, you can only book for <strong>{formatDate(nextWeek)}</strong> onwards.
                  </span>
                </p>
              </div>
            </section>

            {/* Refund Policy */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3>Cancellation & Refund Policy</h3>
              </div>
              <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Time Before Trip</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">20 Days or more</td>
                      <td className="px-4 py-3 text-green-600 font-bold">100% Refund*</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">15 - 20 Days</td>
                      <td className="px-4 py-3 text-gray-700">85% Refund</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">7 - 15 Days</td>
                      <td className="px-4 py-3 text-gray-700">70% Refund</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">2 - 7 Days</td>
                      <td className="px-4 py-3 text-gray-700">50% Refund</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900 underline decoration-red-200 underline-offset-4">Less than 2 Days</td>
                      <td className="px-4 py-3 text-red-600 font-bold uppercase">No Refund</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 italic">
                * Excluding any non-refundable booking fees or taxes already remitted.
              </p>
            </section>

            {/* Consent Checklist */}
            <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
              <h4 className="font-bold text-gray-900">Please confirm to proceed:</h4>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreedToDate}
                    onChange={(e) => setAgreedToDate(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    I understand that I can only book for dates starting 7 days from today.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreedToRefund}
                    onChange={(e) => setAgreedToRefund(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    I have read and agree to the cancellation and refund policy mentioned above.
                  </span>
                </label>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <Button
              onClick={onAccept}
              disabled={!agreedToDate || !agreedToRefund}
              className="w-full h-14 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-orange-100 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Accept & Continue to Hotel Selection
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-center text-[10px] text-gray-400 mt-3 uppercase tracking-widest font-bold">
              Secure Booking Experience by Jagannath Darshan Yatra
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingConsentModal;
