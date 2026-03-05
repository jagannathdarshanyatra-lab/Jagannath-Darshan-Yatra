import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Clock,
  Users,
  IndianRupee,
  Check,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Primitives';
import { Input } from '@/components/ui/Primitives';
import { Badge } from '@/components/ui/Primitives';
import { Separator } from '@/components/ui/Primitives';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Interactive';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/Interactive';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Layout';
import { PackageForm } from '@/components/admin/forms/PackageForm';
import { fetchAllPackages, deletePackage } from '@/services/packageService';

const tierColors = {
  Lite: 'bg-[#22c55e] text-white',
  Standard: 'bg-[#3b82f6] text-white',
  Pro: 'bg-[#f97316] text-white',
  Premium: 'bg-[#f97316] text-white',
  Elite: 'bg-[#1a1a2e] text-[#f59e0b]',
};

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // State for View and Edit dialogs
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch packages from API
  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllPackages();
      setPackages(data);
    } catch (err) {
      console.error('Error loading packages:', err);
      setError(err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  // Filter packages based on search and filters
  const filteredPackages = packages.filter((pkg) => {
    const searchableDestination = pkg.primaryDestination || pkg.stateName || '';
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchableDestination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || pkg.type === tierFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && pkg.isActive) ||
      (statusFilter === 'inactive' && !pkg.isActive);
    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleView = (pkg) => {
    setSelectedPackage(pkg);
    setIsViewOpen(true);
  };

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setIsEditOpen(true);
  };

  const handleDelete = async (pkg) => {
    if (!confirm(`Are you sure you want to permanently delete "${pkg.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      // Use hardDelete=true to permanently remove from database
      await deletePackage(pkg._id, true);
      await loadPackages(); // Refresh the list
    } catch (err) {
      console.error('Error deleting package:', err);
      alert('Failed to delete package: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setIsEditOpen(false);
    setSelectedPackage(null);
    loadPackages(); // Refresh after create/edit
  };

  // Map database fields to display format
  const getDisplayData = (pkg) => ({
    ...pkg,
    id: pkg._id,
    tier: pkg.type,
    destination: pkg.primaryDestination || pkg.stateName || 'Unknown',
    images: [pkg.image || '/placeholder.svg', ...(pkg.images || [])].filter(Boolean),
    pricing: {
      pro: pkg.price,
      premium: Math.round(pkg.price * 1.5),
      elite: Math.round(pkg.price * 2.2),
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading packages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={loadPackages} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Packages</h1>
          <p className="text-muted-foreground mt-1">Manage your travel packages ({packages.length} total)</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Create New Package</DialogTitle>
                <DialogDescription>Add a new travel package to your catalog</DialogDescription>
              </DialogHeader>
              <PackageForm onClose={handleFormClose} />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="Lite">Lite</SelectItem>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Pro">Pro</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
            <SelectItem value="Elite">Elite</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Packages Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredPackages.map((pkg, index) => {
          const displayData = getDisplayData(pkg);
          return (
            <motion.div
              key={pkg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-40 bg-muted overflow-hidden">
                <img
                  src={displayData.images[0] || '/placeholder.svg'}
                  alt={pkg.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={tierColors[displayData.tier] || tierColors.Pro}>{displayData.tier}</Badge>
                  {!pkg.isActive && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                  {pkg.approvalStatus && pkg.approvalStatus !== 'approved' && (
                    <Badge className={pkg.approvalStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}>
                      {pkg.approvalStatus === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-[#f97316] text-white hover:bg-[#ea580c]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleView(displayData)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(pkg)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer text-destructive"
                        onClick={() => handleDelete(pkg)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground font-display text-lg line-clamp-1">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{displayData.destination}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium text-foreground">{pkg.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Starting from</p>
                    <p className="text-sm font-semibold text-primary">
                      ₹{pkg.price?.toLocaleString('en-IN') || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-muted-foreground">
                    Group: {pkg.groupSize} | Rating: {pkg.rating || 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredPackages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No packages found matching your criteria.</p>
        </motion.div>
      )}

      {/* View Package Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPackage && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Badge className={tierColors[selectedPackage.tier] || tierColors.Pro}>{selectedPackage.tier}</Badge>
                  <Badge variant={selectedPackage.isActive ? "default" : "secondary"} className={selectedPackage.isActive ? "bg-green-500 text-white" : ""}>
                    {selectedPackage.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {selectedPackage.approvalStatus && (
                    <Badge className={
                      selectedPackage.approvalStatus === 'approved' ? 'bg-emerald-500 text-white' :
                      selectedPackage.approvalStatus === 'pending' ? 'bg-amber-500 text-white' :
                      'bg-red-500 text-white'
                    }>
                      {selectedPackage.approvalStatus === 'approved' ? '✅ Approved' :
                       selectedPackage.approvalStatus === 'pending' ? '⏳ Pending Approval' :
                       '❌ Rejected'}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="font-display text-2xl mt-2">{selectedPackage.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  {selectedPackage.destination}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Quick Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Clock className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium">{selectedPackage.duration}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Users className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium">{selectedPackage.groupSize}</p>
                    <p className="text-xs text-muted-foreground">Group Size</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <IndianRupee className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium">₹{selectedPackage.pricing?.pro?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">Starting From</p>
                  </div>
                </div>

                <Separator />

                {/* Pricing Tiers */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Pricing by Tier</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Pro</p>
                      <p className="text-lg font-bold text-primary">₹{selectedPackage.pricing?.pro?.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Premium</p>
                      <p className="text-lg font-bold text-primary">₹{selectedPackage.pricing?.premium?.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Elite</p>
                      <p className="text-lg font-bold text-primary">₹{selectedPackage.pricing?.elite?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Itinerary */}
                {selectedPackage.itinerary && selectedPackage.itinerary.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Itinerary</h4>
                      <div className="space-y-2">
                        {selectedPackage.itinerary.map((day, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm">
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded shrink-0">
                              Day {typeof day === 'object' ? day.day : idx + 1}
                            </span>
                            <span className="text-muted-foreground">
                              {typeof day === 'object' ? day.title : day.replace(/^Day \d+:\s*/, '')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Highlights */}
                {selectedPackage.highlights && selectedPackage.highlights.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Highlights</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPackage.highlights.map((highlight, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Included & Excluded */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedPackage.included && selectedPackage.included.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Included
                      </h4>
                      <ul className="space-y-1">
                        {selectedPackage.included.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedPackage.excluded && selectedPackage.excluded.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500" />
                        Excluded
                      </h4>
                      <ul className="space-y-1">
                        {selectedPackage.excluded.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <X className="h-3 w-3 text-red-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                    onClick={() => {
                      setIsViewOpen(false);
                      // Find the original package data for editing
                      const originalPkg = packages.find(p => p._id === selectedPackage.id);
                      if (originalPkg) {
                        handleEdit(originalPkg);
                      }
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Package
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Package</DialogTitle>
            <DialogDescription>Update the package details below</DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <PackageForm 
              onClose={handleFormClose} 
              initialData={selectedPackage}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
