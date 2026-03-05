import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Wifi,
  Car,
  UtensilsCrossed,
  Waves,
  MapPin, 
  ExternalLink, 
} from 'lucide-react';
import { Separator } from '@/components/ui/Primitives'; // Added Separator
import { Button } from '@/components/ui/Primitives';
import { Input } from '@/components/ui/Primitives';
import { Badge } from '@/components/ui/Primitives';
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
import { useEffect } from 'react';
import hotelService from '@/services/hotelService';
import { HotelForm } from '@/components/admin/forms/HotelForm';

const amenityIcons = {
  Pool: Waves,
  'Wifi': Wifi,
  'Fine Dining': UtensilsCrossed,
  'Restaurant': UtensilsCrossed,
  'Parking': Car,
};

const tierColors = {
  Lite: 'bg-green-500/15 text-green-600',
  Standard: 'bg-blue-500/15 text-blue-600',
  Pro: 'bg-info/15 text-info',
  Premium: 'bg-primary/15 text-primary',
  Elite: 'bg-accent/15 text-accent-foreground',
};

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // State for View and Edit dialogs
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setIsLoading(true);
      const data = await hotelService.getAllHotelsAdmin();
      setHotels(data);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setIsViewOpen(true);
  };

  const handleEdit = (hotel) => {
    setSelectedHotel(hotel);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await hotelService.deleteHotel(id);
        fetchHotels();
      } catch (error) {
        console.error('Failed to delete hotel:', error);
      }
    }
  };

  const destinations = [...new Set(hotels.map(h => h.destination))];

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDestination = destinationFilter === 'all' || hotel.destination === destinationFilter;
    return matchesSearch && matchesDestination;
  });


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Hotels</h1>
          <p className="text-muted-foreground mt-1">Manage partner hotels</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add New Hotel</DialogTitle>
              <DialogDescription>Register a new partner hotel</DialogDescription>
            </DialogHeader>
            <HotelForm onClose={() => {
              setIsFormOpen(false);
              fetchHotels();
            }} />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hotels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={destinationFilter} onValueChange={setDestinationFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Destinations</SelectItem>
            {destinations.map((dest) => (
              <SelectItem key={dest} value={dest}>{dest}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Hotels Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredHotels.map((hotel, index) => (
          <motion.div
            key={hotel._id || hotel.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image */}
            <div className="relative h-48 bg-muted overflow-hidden">
              <img
                src={hotel.images[0] || '/placeholder.svg'}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={hotel.isActive ? 'bg-primary/90 text-white' : 'bg-muted text-muted-foreground'}>
                  {hotel.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {hotel.approvalStatus && hotel.approvalStatus !== 'approved' && (
                  <Badge className={hotel.approvalStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}>
                    {hotel.approvalStatus === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                  </Badge>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-card/80 backdrop-blur-sm text-foreground hover:bg-card/90">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer text-foreground" onClick={() => handleView(hotel)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-foreground" onClick={() => handleEdit(hotel)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDelete(hotel._id || hotel.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Rating */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-card/80 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="h-4 w-4 text-accent fill-accent" />
                <span className="text-sm font-medium">{hotel.rating}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground font-display text-lg line-clamp-1">{hotel.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{hotel.location}, {hotel.destination}</p>
              
              {/* Tier Applicability */}
              <div className="flex flex-wrap gap-1 mt-3">
                {(Array.isArray(hotel.packageType) ? hotel.packageType : [hotel.packageType || 'Standard']).map((tier) => (
                  <Badge key={tier} className={tierColors[tier]} variant="secondary">
                    {tier}
                  </Badge>
                ))}
              </div>
              
              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mt-3">
                {hotel.amenities.slice(0, 4).map((amenity) => {
                  const IconComponent = amenityIcons[amenity] || Wifi;
                  return (
                    <Badge key={amenity} variant="outline" className="text-xs py-1">
                      <IconComponent className="h-3 w-3 mr-1" />
                      {amenity}
                    </Badge>
                  );
                })}
                {hotel.amenities.length > 4 && (
                  <Badge variant="outline" className="text-xs py-1">
                    +{hotel.amenities.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading hotels...</p>
        </div>
      ) : filteredHotels.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No hotels found.</p>
        </motion.div>
      )}


      {/* View Hotel Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedHotel && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Badge variant={selectedHotel.isActive ? "default" : "secondary"} className={selectedHotel.isActive ? "bg-green-500 text-white" : ""}>
                    {selectedHotel.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {selectedHotel.approvalStatus && (
                    <Badge className={
                      selectedHotel.approvalStatus === 'approved' ? 'bg-emerald-500 text-white' :
                      selectedHotel.approvalStatus === 'pending' ? 'bg-amber-500 text-white' :
                      'bg-red-500 text-white'
                    }>
                      {selectedHotel.approvalStatus === 'approved' ? '✅ Approved' :
                       selectedHotel.approvalStatus === 'pending' ? '⏳ Pending Approval' :
                       '❌ Rejected'}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 text-accent fill-accent" />
                    <span className="text-xs font-medium">{selectedHotel.rating} Star</span>
                  </div>
                </div>
                <DialogTitle className="font-display text-2xl mt-2">{selectedHotel.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  {selectedHotel.location}, {selectedHotel.destination}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Image */}
                <div className="relative h-64 bg-muted rounded-xl overflow-hidden">
                  <img
                    src={selectedHotel.images[0] || '/placeholder.svg'}
                    alt={selectedHotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">About</h4>
                  <p className="text-muted-foreground">{selectedHotel.description}</p>
                </div>

                <Separator />

                {/* Tier Applicability */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Available for Tiers</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedHotel.packageType) ? selectedHotel.packageType : [selectedHotel.packageType || 'Standard']).map((tier) => (
                      <Badge key={tier} className={tierColors[tier]} variant="secondary">
                        {tier}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHotel.amenities.map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || Wifi;
                      return (
                        <Badge key={amenity} variant="outline" className="px-3 py-1.5 flex items-center gap-2">
                          <IconComponent className="h-3 w-3" />
                          {amenity}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* OTA Configuration */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">OTA Configuration</h4>
                  {selectedHotel.otaApiLink ? (
                    <div className="bg-muted p-3 rounded-lg flex items-center justify-between">
                      <code className="text-xs text-muted-foreground break-all mr-2">
                        {selectedHotel.otaApiLink}
                      </code>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 shrink-0"
                        onClick={() => window.open(selectedHotel.otaApiLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No OTA link configured</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    className="bg-gradient-primary hover:opacity-90 text-white"
                    onClick={() => {
                      setIsViewOpen(false);
                      handleEdit(selectedHotel);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Hotel
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Hotel Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Hotel</DialogTitle>
            <DialogDescription>Update hotel details</DialogDescription>
          </DialogHeader>
          {selectedHotel && (
            <HotelForm 
              onClose={() => {
                setIsEditOpen(false);
                setSelectedHotel(null);
                fetchHotels();
              }} 
              initialData={selectedHotel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
