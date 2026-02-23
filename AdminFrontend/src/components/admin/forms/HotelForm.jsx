import { useState, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Primitives';
import { Input } from '@/components/ui/Primitives';
import { Label } from '@/components/ui/Primitives';
import { Textarea } from '@/components/ui/Primitives';
import { Switch } from '@/components/ui/Primitives';
import { Checkbox } from '@/components/ui/Primitives';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Interactive';
import { Separator } from '@/components/ui/Primitives';
import destinationService from '@/services/destinationService';

const tiers = ['Lite', 'Standard', 'Pro', 'Premium', 'Elite'];

export function HotelForm({ onClose, initialData }) {
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [selectedTiers, setSelectedTiers] = useState(
    Array.isArray(initialData?.packageType) 
      ? initialData.packageType 
      : (initialData?.packageType ? [initialData.packageType] : ['Premium'])
  );
  const [selectedImages, setSelectedImages] = useState(initialData?.images ?? []);
  const [destinations, setDestinations] = useState([]);
  const [isDestinationsLoading, setIsDestinationsLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await destinationService.fetchAllDestinations();
        // Extract unique state names from destinations
        const uniqueStates = [...new Set((data || []).map(dest => dest.stateName))].filter(Boolean);
        setDestinations(uniqueStates);
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
      } finally {
        setIsDestinationsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handleTierChange = (tier, checked) => {
    if (checked) {
      setSelectedTiers([...selectedTiers, tier]);
    } else {
      setSelectedTiers(selectedTiers.filter(t => t !== tier));
    }
  };

  const [selectedDestination, setSelectedDestination] = useState(initialData?.destination || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      destination: selectedDestination,
      location: e.target.location.value,
      rating: e.target.rating ? e.target.rating.value : (initialData?.rating || 5),
      description: e.target.description.value,
      packageType: selectedTiers,
      amenities: e.target.amenities.value.split(',').map(a => a.trim()),
      images: selectedImages,
      isActive
    };
    console.log('Form submitted:', formData);
    // Handle form submission (e.g., call hotelService.createHotel(formData))
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="form-section">
        <h4 className="font-semibold text-foreground mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hotel Name *</Label>
            <Input id="name" placeholder="e.g., Taj Lake Palace" defaultValue={initialData?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination *</Label>
            <Select 
              value={selectedDestination} 
              onValueChange={setSelectedDestination}
            >
              <SelectTrigger>
                <SelectValue placeholder={isDestinationsLoading ? "Loading..." : "Select destination"} />
              </SelectTrigger>
              <SelectContent>
                {isDestinationsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : destinations.length > 0 ? (
                  destinations.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No destinations available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g., Udaipur" defaultValue={initialData?.location} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Star Rating</Label>
            <Select defaultValue={initialData?.rating?.toString() ?? '5'}>
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Star</SelectItem>
                <SelectItem value="4">4 Star</SelectItem>
                <SelectItem value="5">5 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            rows={3} 
            placeholder="Describe the hotel..."
            defaultValue={initialData?.description}
          />
        </div>
      </div>

      {/* Tier Applicability */}
      <div className="form-section">
        <h4 className="font-semibold text-foreground mb-4">Tier Applicability</h4>
        <div className="flex flex-wrap gap-4">
          {tiers.map((tier) => (
            <div key={tier} className="flex items-center gap-2">
              <Checkbox 
                id={`tier-${tier}`} 
                checked={selectedTiers.includes(tier)}
                onCheckedChange={(checked) => handleTierChange(tier, checked)}
              />
              <Label htmlFor={`tier-${tier}`} className="cursor-pointer">{tier}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="form-section">
        <h4 className="font-semibold text-foreground mb-4">Amenities</h4>
        <div className="space-y-2">
          <Label htmlFor="amenities">Amenities (comma separated)</Label>
          <Textarea 
            id="amenities" 
            rows={2} 
            placeholder="Pool, Spa, Restaurant, WiFi, Gym"
            defaultValue={initialData?.amenities?.join(', ')}
          />
        </div>
      </div>

      {/* Images */}
      <div className="form-section">
        <h4 className="font-semibold text-foreground mb-4">Images</h4>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors bg-card" 
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => {
                 e.preventDefault();
                 const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                 if (files.length > 0) {
                   // Mock adding files - in real app would upload or store File objects
                   const newImageUrls = files.map(file => URL.createObjectURL(file));
                   setSelectedImages([...selectedImages, ...newImageUrls]);
                 }
               }}>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Drag & drop images here</p>
            <p className="text-xs text-muted-foreground mt-1 mb-2">or click to browse from your computer</p>
            <Input 
              id="image-upload" 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                  const newImageUrls = files.map(file => URL.createObjectURL(file));
                  setSelectedImages([...selectedImages, ...newImageUrls]);
                }
              }}
            />
            <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('image-upload').click()}>
              Select Files
            </Button>
          </div>

          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedImages.map((img, index) => (
                <div key={index} className="relative group aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                  <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Publishing */}
      <div className="form-section">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <Label htmlFor="isActive" className="cursor-pointer">Active (available for booking)</Label>
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-primary hover:opacity-90 text-white">
          {initialData ? 'Update Hotel' : 'Add Hotel'}
        </Button>
      </div>
    </form>
  );
}
