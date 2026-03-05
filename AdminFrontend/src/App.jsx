import { Toaster, SonnerToaster as Sonner } from "@/components/ui/Interactive";
import { TooltipProvider } from "@/components/ui/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Dashboard from "./pages/Dashboard";
import PackagesPage from "./pages/PackagesPage";
import DestinationsPage from "./pages/DestinationsPage";
import HotelsPage from "./pages/HotelsPage";
import BookingsPage from "./pages/BookingsPage";
import InquiriesPage from "./pages/InquiriesPage";
import FAQPage from "./pages/FAQPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/packages/new" element={<PackagesPage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/new" element={<HotelsPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/inquiries" element={<InquiriesPage />} />
              <Route path="/faqs" element={<FAQPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
