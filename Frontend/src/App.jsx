import { lazy, Suspense } from "react";
import { Toaster, SonnerToaster as Sonner } from "@/components/ui/feedback";
import { TooltipProvider } from "@/components/ui/overlay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";

import ScrollToTop from "@/components/ScrollToTop";
import { useSettings, SettingsProvider } from "./context/SettingsContext";
import IntroAnimation from "./components/common/IntroAnimation";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Lazy-loaded pages — each becomes a separate chunk for faster initial load
const Index = lazy(() => import("./pages/Index"));
const Destinations = lazy(() => import("./pages/Destinations"));
const Packages = lazy(() => import("./pages/Packages"));
const PackageDetail = lazy(() => import("./pages/PackageDetail"));
const Experiences = lazy(() => import("./pages/Experiences"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const Bookings = lazy(() => import("./pages/Bookings"));
const BookingDetail = lazy(() => import("./pages/BookingDetail"));

const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const DownloadInvoice = lazy(() => import("./pages/DownloadInvoice"));
const BookingForm = lazy(() => import("./pages/BookingForm"));
const Maintenance = lazy(() => import("./pages/Maintenance"));

const queryClient = new QueryClient();

// Shared loading spinner — same visual as before
const PageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AppRoutes = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return <PageLoader />;
  }

  if (settings?.website?.maintenance) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Maintenance />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/package" element={<Navigate to="/packages?state=odisha" replace />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:id" element={<PackageDetail />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />

        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/booking-form" element={<BookingForm />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/download-invoice/:bookingId" element={<DownloadInvoice />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch(`${API_URL}/api/admin/dashboard/track-visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            path: window.location.pathname,
            userAgent: navigator.userAgent
          })
        });
      } catch (err) {
        // Silently fail for tracking
      }
    };
    
    trackVisit();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
          <Toaster />
          <Sonner position="top-center" />
          <SettingsProvider>
            <BrowserRouter>
              <ScrollToTop />
              <AppRoutes />
            </BrowserRouter>
          </SettingsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;