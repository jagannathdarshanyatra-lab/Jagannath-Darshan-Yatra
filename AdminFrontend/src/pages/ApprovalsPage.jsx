import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Building2, Check, X, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import approvalService from '../services/approvalService';
import adminAuthService from '../services/adminAuthService';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState('packages');
  const [pendingPackages, setPendingPackages] = useState([]);
  const [pendingHotels, setPendingHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  // Check if user is SuperAdmin
  useEffect(() => {
    if (!adminAuthService.isSuperAdmin()) {
      toast.error('Access Denied', {
        description: 'Only Super Admin can access this page.',
      });
      navigate('/');
    }
  }, [navigate]);

  const fetchPendingItems = async () => {
    setIsLoading(true);
    try {
      const [packages, hotels] = await Promise.all([
        approvalService.getPendingPackages(),
        approvalService.getPendingHotels(),
      ]);
      setPendingPackages(packages);
      setPendingHotels(hotels);
    } catch (error) {
      console.error('Error fetching pending items:', error);
      toast.error('Failed to load pending items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminAuthService.isSuperAdmin()) {
      fetchPendingItems();
    }
  }, []);

  const handleApprovePackage = async (id) => {
    setActionLoading(id);
    try {
      await approvalService.approvePackage(id);
      setPendingPackages((prev) => prev.filter((p) => p._id !== id));
      toast.success('Package approved and is now live on the website!');
    } catch (error) {
      toast.error('Failed to approve package');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPackage = async (id) => {
    setActionLoading(id);
    try {
      await approvalService.rejectPackage(id);
      setPendingPackages((prev) => prev.filter((p) => p._id !== id));
      toast.success('Package rejected');
    } catch (error) {
      toast.error('Failed to reject package');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveHotel = async (id) => {
    setActionLoading(id);
    try {
      await approvalService.approveHotel(id);
      setPendingHotels((prev) => prev.filter((h) => h._id !== id));
      toast.success('Hotel approved and is now live on the website!');
    } catch (error) {
      toast.error('Failed to approve hotel');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectHotel = async (id) => {
    setActionLoading(id);
    try {
      await approvalService.rejectHotel(id);
      setPendingHotels((prev) => prev.filter((h) => h._id !== id));
      toast.success('Hotel rejected');
    } catch (error) {
      toast.error('Failed to reject hotel');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPending = pendingPackages.length + pendingHotels.length;

  const tabs = [
    { id: 'packages', label: 'Packages', icon: Package, count: pendingPackages.length },
    { id: 'hotels', label: 'Hotels', icon: Building2, count: pendingHotels.length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve content created by admins before it goes live.
        </p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalPending}</p>
            <p className="text-sm text-muted-foreground">Total Pending</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Package className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pendingPackages.length}</p>
            <p className="text-sm text-muted-foreground">Pending Packages</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pendingHotels.length}</p>
            <p className="text-sm text-muted-foreground">Pending Hotels</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-3 text-muted-foreground">Loading pending items...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'packages' && (
                <motion.div
                  key="packages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {pendingPackages.length === 0 ? (
                    <div className="text-center py-12">
                      <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <p className="text-lg font-medium text-foreground">All caught up!</p>
                      <p className="text-muted-foreground">No pending packages to review.</p>
                    </div>
                  ) : (
                    pendingPackages.map((pkg) => (
                      <motion.div
                        key={pkg._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {/* Package Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                            {pkg.image ? (
                              <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Package Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-foreground truncate">{pkg.name}</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {pkg.primaryDestination} • {pkg.type} • {pkg.duration}
                                </p>
                                <p className="text-sm font-medium text-primary mt-1">₹{pkg.price?.toLocaleString()}</p>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleApprovePackage(pkg._id)}
                                  disabled={actionLoading === pkg._id}
                                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectPackage(pkg._id)}
                                  disabled={actionLoading === pkg._id}
                                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created: {new Date(pkg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'hotels' && (
                <motion.div
                  key="hotels"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {pendingHotels.length === 0 ? (
                    <div className="text-center py-12">
                      <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <p className="text-lg font-medium text-foreground">All caught up!</p>
                      <p className="text-muted-foreground">No pending hotels to review.</p>
                    </div>
                  ) : (
                    pendingHotels.map((hotel) => (
                      <motion.div
                        key={hotel._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {/* Hotel Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                            {hotel.images && hotel.images.length > 0 ? (
                              <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Hotel Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-foreground truncate">{hotel.name}</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {hotel.destination} • Rating: {hotel.rating}/5
                                </p>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {hotel.packageType?.join(', ')}
                                </p>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleApproveHotel(hotel._id)}
                                  disabled={actionLoading === hotel._id}
                                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectHotel(hotel._id)}
                                  disabled={actionLoading === hotel._id}
                                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created: {new Date(hotel.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
