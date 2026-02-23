import { Toaster, SonnerToaster as Sonner } from "@/components/ui/feedback";
import { TooltipProvider } from "@/components/ui/overlay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import Experiences from "./pages/Experiences";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import BookingDetail from "./pages/BookingDetail";
import HotelSelection from './pages/HotelSelection';
import BookingSuccess from "./pages/BookingSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";

import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

import { useSettings, SettingsProvider } from "./context/SettingsContext";
import Maintenance from "./pages/Maintenance";
import { Loader2 } from "lucide-react";

const AppRoutes = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow access to login/admin even in maintenance mode if needed, but for now strict maintenance
  // You might want to allow a specific query param or route to bypass, but keeping it simple
  if (settings?.website?.maintenance) {
    return <Maintenance />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/packages" element={<Packages />} />
      <Route path="/packages/:id" element={<PackageDetail />} />
      <Route path="/experiences" element={<Experiences />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/bookings/:id" element={<BookingDetail />} />
      <Route path="/bookings/:bookingId/select-hotels" element={<HotelSelection />} />
      <Route path="/packages/:packageId/hotels" element={<HotelSelection />} />
      <Route path="/booking-success" element={<BookingSuccess />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/refund" element={<RefundPolicy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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

export default App;