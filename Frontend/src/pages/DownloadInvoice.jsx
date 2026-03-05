import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateInvoicePdf } from '@/utils/InvoicePdf';
import { Loader2, Download, CheckCircle, AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/forms';
import { toast } from 'sonner';

const DownloadInvoice = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const fetchBookingAndDownload = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');

        if (!token) {
          toast.error('Please login to download your invoice');
          navigate('/login', { state: { from: `/download-invoice/${bookingId}` } });
          return;
        }

        const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setBooking(data.booking);
          // Automatically trigger download
          await generateInvoicePdf(data.booking);
          setDownloaded(true);
          toast.success('Invoice downloaded successfully!');
        } else {
          setError(data.error || 'Failed to fetch booking details');
        }
      } catch (err) {
        console.error('Download error:', err);
        setError('An error occurred while preparing your download.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndDownload();
  }, [bookingId, navigate]);

  const handleManualDownload = async () => {
    if (booking) {
      try {
        await generateInvoicePdf(booking);
        toast.success('Invoice downloaded successfully!');
      } catch (err) {
        toast.error('Failed to generate PDF');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            {loading ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : error ? (
              <AlertCircle className="w-10 h-10 text-red-500" />
            ) : (
              <Download className="w-10 h-10" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {loading ? 'Preparing download...' : error ? 'Oops!' : 'Your Invoice is Ready'}
        </h1>

        <p className="text-slate-600 mb-8">
          {loading
            ? 'We are generating your invoice. Please wait a moment.'
            : error
            ? error
            : 'Your invoice has been generated and the download should start automatically.'}
        </p>

        {!loading && !error && (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-sm mb-6">
              <CheckCircle className="w-4 h-4" />
              <span>Download should have started automatically</span>
            </div>
            
            <Button 
              onClick={handleManualDownload}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg font-medium"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Again
            </Button>
          </div>
        )}

        {error && (
          <Button 
            onClick={() => navigate('/bookings')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg font-medium"
          >
            Go to My Bookings
          </Button>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 text-slate-500 hover:text-orange-600 transition-colors mx-auto"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Return to Home</span>
          </button>
        </div>
      </div>
      
      <p className="mt-6 text-slate-400 text-xs text-center max-w-xs">
        &copy; 2026 Jagannath Darshan Yatra. If you have any trouble downloading, please contact our support team.
      </p>
    </div>
  );
};

export default DownloadInvoice;
