import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, AlertCircle, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/forms';

const GuestRestrictionModal = ({ isOpen, onClose, maxGuests, packageTier }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-orange-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="font-serif text-xl font-bold text-gray-900">Guest Limit Reached</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-10 h-10 text-orange-600" />
            </div>
            
            <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">Maximum Guests: {maxGuests}</h3>
                <p className="text-gray-600 leading-relaxed">
                    This package is designed for a maximum of {maxGuests} guests. 
                    To accommodate a larger group, please book an additional <strong>{packageTier}</strong> separately.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <Button 
                    variant="outline" 
                    className="h-12 rounded-xl"
                    onClick={() => {
                        window.location.href = "tel:+919556006338";
                    }}
                >
                    <Phone className="w-4 h-4 mr-2" /> Call us
                </Button>
                <Button 
                    variant="outline" 
                    className="h-12 rounded-xl border-green-200 text-green-600 hover:bg-green-50"
                    onClick={() => window.open("https://wa.me/919556006338", "_blank")}
                >
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold"
            >
              Got it
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GuestRestrictionModal;
