import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Primitives';
import { Input } from '@/components/ui/Primitives';
import { Label } from '@/components/ui/Primitives';
import { Textarea } from '@/components/ui/Primitives';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Interactive';
import { Separator } from '@/components/ui/Primitives';
import { ImagePlus, X, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { createPackage, updatePackage } from '@/services/packageService';

// Destination data with specific locations
const destinationsData = {
  'Odisha': ['Puri', 'Bhubaneswar', 'Chilika', 'Konark', 'Cuttack', 'Sambalpur'],
  'Kashmir': ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Dal Lake', 'Leh'],
  'Goa': ['North Goa', 'South Goa', 'Panjim', 'Calangute', 'Baga', 'Old Goa'],
  'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Pushkar', 'Mount Abu'],
  'Kerala': ['Munnar', 'Alleppey', 'Cochin', 'Thekkady', 'Kovalam', 'Wayanad'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Spiti', 'Kullu', 'Kasol'],
  'Tamil Nadu': ['Chennai', 'Madurai', 'Ooty', 'Kanyakumari', 'Mahabalipuram', 'Rameswaram'],
  'Uttarakhand': ['Rishikesh', 'Haridwar', 'Nainital', 'Mussoorie', 'Dehradun', 'Jim Corbett'],
};

// Image upload component with real file selection
function ImageUploader({ label, maxImages = 1, images, onImagesChange, required = false }) {
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      isNew: true,
    }));

    onImagesChange([...images, ...newImages]);
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    if (imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const acceptedFormats = ".png,.jpg,.jpeg,.webp,.svg";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <span className="text-xs text-muted-foreground">{images.length}/{maxImages}</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted group">
            <img 
              src={img.preview || img.url || img} 
              alt={`${label} ${idx + 1}`} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
              {img.name || 'Image'}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
            <input
              type="file"
              accept={acceptedFormats}
              multiple={maxImages > 1}
              onChange={handleFileSelect}
              className="hidden"
            />
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Select File{maxImages > 1 ? 's' : ''}</span>
          </label>
        )}
      </div>
    </div>
  );
}

export function PackageForm({ onClose, initialData }) {
  // Map initial data from API format
  const mapInitialData = (data) => {
    if (!data) return {};
    return {
      ...data,
      destination: data.stateName || '',
      specificDestination: data.primaryDestination || '',
      tier: data.type || '',
      itinerary: data.itinerary?.map(item => 
        typeof item === 'object' ? `Day ${item.day}: ${item.title}` : item
      ) || [],
      hotelDetails: Array.isArray(data.hotelDetails) ? data.hotelDetails : [],
      foodPlan: data.foodPlan || '',
      pickupDrop: data.pickupDrop || '',
    };
  };

  const mappedData = mapInitialData(initialData);

  // Core Information State
  const [destination, setDestination] = useState(mappedData.destination || '');
  const [specificDestination, setSpecificDestination] = useState(mappedData.specificDestination || '');
  const [packageName, setPackageName] = useState(mappedData.name || '');
  const [tier, setTier] = useState(mappedData.tier || '');
  const [price, setPrice] = useState(mappedData.price || '');
  const [originalPrice, setOriginalPrice] = useState(mappedData.originalPrice || '');
  const [duration, setDuration] = useState(mappedData.duration || '');
  const [groupSize, setGroupSize] = useState(mappedData.groupSize || '');

  // Content State - Itinerary as structured array
  const [itinerary, setItinerary] = useState(() => {
    if (initialData?.itinerary && Array.isArray(initialData.itinerary)) {
      return initialData.itinerary.map((item, idx) => ({
        day: item.day || idx + 1,
        title: item.title || '',
        activities: item.activities || [],
        isOpen: idx === 0, // First day expanded by default
      }));
    }
    // Default with one empty day
    return [{ day: 1, title: '', activities: [], isOpen: true }];
  });
  const [highlights, setHighlights] = useState(
    Array.isArray(mappedData.highlights) ? mappedData.highlights.join(', ') : ''
  );
  const [included, setIncluded] = useState(
    Array.isArray(mappedData.included) ? mappedData.included.join(', ') : ''
  );
  const [excluded, setExcluded] = useState(
    Array.isArray(mappedData.excluded) ? mappedData.excluded.join(', ') : ''
  );
  
  // Hotel Details State - Array of objects
  const [hotelDetails, setHotelDetails] = useState(() => {
    if (mappedData.hotelDetails && mappedData.hotelDetails.length > 0) {
      return mappedData.hotelDetails;
    }
    return [{ city: '', hotel: '', nights: '', roomType: '' }];
  });
  
  // Hotel Images State
  const [hotelImages, setHotelImages] = useState(() => {
    if (initialData?.hotelImages && initialData.hotelImages.length > 0) {
      return initialData.hotelImages.map((url, idx) => ({
        url,
        name: `Hotel ${idx + 1}`,
        isExisting: true,
      }));
    }
    return [];
  });

  const [foodPlan, setFoodPlan] = useState(mappedData.foodPlan || '');
  const [transportation, setTransportation] = useState(mappedData.pickupDrop || '');
  
  const [description, setDescription] = useState(mappedData.description || '');

  // Image State - for main package image
  const [packageImage, setPackageImage] = useState(() => {
    if (initialData?.image) {
      return [{ url: initialData.image, name: 'Current Image', isExisting: true }];
    }
    return [];
  });

  // Location image - represents the destination (used in About section)
  const [locationImage, setLocationImage] = useState(() => {
    if (initialData?.locationImage) {
      return [{ url: initialData.locationImage, name: 'Location Image', isExisting: true }];
    }
    return [];
  });

  // Hero images for destination page banner
  const [heroImages, setHeroImages] = useState(() => {
    if (initialData?.heroImages && initialData.heroImages.length > 0) {
      return initialData.heroImages.map((url, idx) => ({
        url,
        name: `Hero ${idx + 1}`,
        isExisting: true,
      }));
    }
    return [];
  });
  
  // Gallery images
  const [galleryImages, setGalleryImages] = useState(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.map((url, idx) => ({
        url,
        name: `Gallery ${idx + 1}`,
        isExisting: true,
      }));
    }
    return [];
  });

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset specific destination when destination changes
  useEffect(() => {
    if (!initialData) {
      setSpecificDestination('');
    }
  }, [destination, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!destination || !specificDestination || !packageName || !tier || !price || !duration || !groupSize) {
      setError('Please fill all required fields in Core Information');
      return;
    }
    // Check content fields (itinerary is now optional)
    if (!highlights || !included || !excluded) {
      setError('Please fill all required fields in Content section (Highlights, Included, Excluded)');
      return;
    }

    // For new packages, require at least one image
    if (!initialData && packageImage.length === 0) {
      setError('Please upload at least one package image');
      return;
    }

    try {
      setIsSubmitting(true);

      // Build FormData for multipart upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', packageName);
      formData.append('destination', destination);
      formData.append('specificDestination', specificDestination);
      formData.append('tier', tier);
      formData.append('price', price);
      if (originalPrice) formData.append('originalPrice', originalPrice);
      formData.append('duration', duration);
      formData.append('groupSize', groupSize);
      // Send itinerary as JSON string with structured data
      const itineraryData = itinerary.map(({ day, title, activities }) => ({
        day,
        title,
        activities: activities.filter(a => a.trim() !== '')
      }));
      formData.append('itinerary', JSON.stringify(itineraryData));
      formData.append('highlights', highlights);
      formData.append('included', included);
      formData.append('excluded', excluded);
      
      // Send hotel details as JSON string
      formData.append('hotelDetails', JSON.stringify(hotelDetails));
      formData.append('foodPlan', foodPlan);
      formData.append('pickupDrop', transportation);
      
      formData.append('description', description || `Experience the best of ${specificDestination}`);
      formData.append('isActive', 'true');

      // Add main image if it's a new file
      const newMainImage = packageImage.find(img => img.isNew && img.file);
      if (newMainImage) {
        formData.append('image', newMainImage.file);
      }

      // Add location image if it's a new file
      const newLocationImage = locationImage.find(img => img.isNew && img.file);
      if (newLocationImage) {
        formData.append('locationImage', newLocationImage.file);
      }

      // Add hero images if they're new files
      const newHeroImages = heroImages.filter(img => img.isNew && img.file);
      newHeroImages.forEach(img => {
        formData.append('heroImages', img.file);
      });

      // Add gallery images if they're new files
      const newGalleryImages = galleryImages.filter(img => img.isNew && img.file);
      newGalleryImages.forEach(img => {
        formData.append('images', img.file);
      });
      
      // Add hotel images if they're new files
      const newHotelImages = hotelImages.filter(img => img.isNew && img.file);
      newHotelImages.forEach(img => {
        formData.append('hotelImages', img.file);
      });

      if (initialData?._id) {
        // Update existing package
        await updatePackage(initialData._id, formData);
      } else {
        // Create new package
        await createPackage(formData);
      }

      onClose();
    } catch (err) {
      console.error('Error submitting package:', err);
      setError(err.message || 'Failed to save package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const specificDestinations = destination ? destinationsData[destination] || [] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Core Information */}
      <div className="form-section">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#f97316] text-white text-xs flex items-center justify-center">1</span>
          Core Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Destination Dropdown */}
          <div className="space-y-2">
            <Label>Select Destination *</Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination (e.g., Odisha, Kashmir)" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(destinationsData).map((dest) => (
                  <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specific Destination Dropdown */}
          <div className="space-y-2">
            <Label>Specific Location *</Label>
            <Select 
              value={specificDestination} 
              onValueChange={setSpecificDestination}
              disabled={!destination}
            >
              <SelectTrigger>
                <SelectValue placeholder={destination ? "Select specific location" : "Select destination first"} />
              </SelectTrigger>
              <SelectContent>
                {specificDestinations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Package Name */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="packageName">Package Name *</Label>
            <Input 
              id="packageName" 
              placeholder="e.g., Puri Beach Fun, Spiritual Puri Yatra" 
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
            />
          </div>

          {/* Tier Selection with Price */}
          <div className="space-y-2">
            <Label>Tier *</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lite">Lite</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Elite">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Original Price Input */}
             <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price (Optional)</Label>
              <Input 
                id="originalPrice" 
                type="number"
                placeholder="e.g., 9999"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <Label htmlFor="price">Sale Price (₹) {tier && `for ${tier}`} *</Label>
              <Input 
                id="price" 
                type=""
                placeholder={tier ? `Enter ${tier} price` : "Select tier first"}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={!tier}
                className={!tier ? 'opacity-50 cursor-not-allowed' : ''}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration *</Label>
            <Input 
              id="duration" 
              placeholder="e.g., 4 Days / 3 Nights" 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Group Size */}
          <div className="space-y-2">
            <Label htmlFor="groupSize">Group Size *</Label>
            <Input 
              id="groupSize" 
              placeholder="e.g., 2-15" 
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="form-section">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#f97316] text-white text-xs flex items-center justify-center">2</span>
          Content
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              rows={2} 
              placeholder="Brief description of the package..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {/* Itinerary Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Itinerary</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setItinerary(prev => [
                    ...prev,
                    { day: prev.length + 1, title: '', activities: [], isOpen: true }
                  ]);
                }}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Day
              </Button>
            </div>
            
            <div className="space-y-3">
              {itinerary.map((dayItem, dayIndex) => (
                <div 
                  key={dayIndex} 
                  className="border rounded-lg overflow-hidden bg-card"
                >
                  {/* Day Header */}
                  <div 
                    className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setItinerary(prev => prev.map((item, idx) => 
                        idx === dayIndex ? { ...item, isOpen: !item.isOpen } : item
                      ));
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">Day {dayItem.day}</span>
                      <Input
                        placeholder="Day Title (e.g., Beach & Temple)"
                        value={dayItem.title}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          setItinerary(prev => prev.map((item, idx) => 
                            idx === dayIndex ? { ...item, title: e.target.value } : item
                          ));
                        }}
                        className="w-64 h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {itinerary.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItinerary(prev => prev
                              .filter((_, idx) => idx !== dayIndex)
                              .map((item, idx) => ({ ...item, day: idx + 1 }))
                            );
                          }}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {dayItem.isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* Day Activities (Collapsible) */}
                  {dayItem.isOpen && (
                    <div className="p-3 space-y-2">
                      <Label className="text-xs text-muted-foreground">Activities</Label>
                      {dayItem.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                            •
                          </span>
                          <Input
                            value={activity}
                            onChange={(e) => {
                              setItinerary(prev => prev.map((item, idx) => {
                                if (idx === dayIndex) {
                                  const newActivities = [...item.activities];
                                  newActivities[actIndex] = e.target.value;
                                  return { ...item, activities: newActivities };
                                }
                                return item;
                              }));
                            }}
                            placeholder="Activity description"
                            className="flex-1 h-8 text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setItinerary(prev => prev.map((item, idx) => {
                                if (idx === dayIndex) {
                                  return {
                                    ...item,
                                    activities: item.activities.filter((_, i) => i !== actIndex)
                                  };
                                }
                                return item;
                              }));
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setItinerary(prev => prev.map((item, idx) => {
                            if (idx === dayIndex) {
                              return { ...item, activities: [...item.activities, ''] };
                            }
                            return item;
                          }));
                        }}
                        className="text-xs text-primary hover:text-primary"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Activity
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="highlights">Highlights (comma separated) *</Label>
            <Textarea 
              id="highlights" 
              rows={2} 
              placeholder="Jagannath Temple, Beach Resort, Konark Sun Temple"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="included">Included (comma separated) *</Label>
              <Textarea 
                id="included" 
                rows={3} 
                placeholder="Accommodation, Breakfast, Transport"
                value={included}
                onChange={(e) => setIncluded(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excluded">Excluded (comma separated) *</Label>
              <Textarea 
                id="excluded" 
                rows={3} 
                placeholder="Flights, Personal Expenses, Tips"
                value={excluded}
                onChange={(e) => setExcluded(e.target.value)}
              />
            </div>
          </div>
          {/* Hotel Details Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Where You'll Stay (Hotel Details)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setHotelDetails(prev => [
                    ...prev,
                    { city: '', hotel: '', nights: '', roomType: '' }
                  ]);
                }}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Hotel
              </Button>
            </div>
            
            <div className="space-y-3">
              {hotelDetails.map((hotel, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-start border p-3 rounded-lg bg-card">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                    <Input
                      placeholder="City (e.g., Puri)"
                      value={hotel.city}
                      onChange={(e) => {
                        const newDetails = [...hotelDetails];
                        newDetails[index].city = e.target.value;
                        setHotelDetails(newDetails);
                      }}
                      className="h-9 text-sm"
                    />
                    <Input
                      placeholder="Hotel Description (Hidden on Frontend)"
                      value={hotel.hotel}
                      onChange={(e) => {
                        const newDetails = [...hotelDetails];
                        newDetails[index].hotel = e.target.value;
                        setHotelDetails(newDetails);
                      }}
                      className="h-9 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Nights"
                      value={hotel.nights}
                      onChange={(e) => {
                        const newDetails = [...hotelDetails];
                        newDetails[index].nights = e.target.value;
                        setHotelDetails(newDetails);
                      }}
                      className="h-9 text-sm"
                    />
                    <Input
                      placeholder="Room Type"
                      value={hotel.roomType}
                      onChange={(e) => {
                        const newDetails = [...hotelDetails];
                        newDetails[index].roomType = e.target.value;
                        setHotelDetails(newDetails);
                      }}
                      className="h-9 text-sm"
                    />
                  </div>
                  {hotelDetails.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setHotelDetails(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-destructive hover:text-destructive h-9 w-9 p-0 bg-destructive/10 hover:bg-destructive/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-2" />
          
          <h5 className="font-medium text-sm text-foreground mb-2">Additional Info</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="foodPlan">Food Plan</Label>
              <Input
                id="foodPlan"
                placeholder="e.g., Breakfast & Dinner"
                value={foodPlan}
                onChange={(e) => setFoodPlan(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transportation">Transportation</Label>
              <Input
                id="transportation"
                placeholder="e.g., AC Sedan for transfers"
                value={transportation}
                onChange={(e) => setTransportation(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Images Section */}
      <div className="form-section">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#f97316] text-white text-xs flex items-center justify-center">3</span>
          Images
        </h4>
        <div className="space-y-6">
          {/* Row 1: Location Image and Hero Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              label="Location Image (About Section)"
              maxImages={1}
              images={locationImage}
              onImagesChange={setLocationImage}
            />
            <ImageUploader
              label="Hero Images (Banner, Max 3)"
              maxImages={3}
              images={heroImages}
              onImagesChange={setHeroImages}
            />
          </div>

          {/* Row 2: Package Image */}
          <ImageUploader
            label="Main Package Image"
            maxImages={1}
            images={packageImage}
            onImagesChange={setPackageImage}
            required={!initialData}
          />

          {/* Row 3: Gallery Images */}
          <ImageUploader
            label="Gallery Images (Max 10)"
            maxImages={10}
            images={galleryImages}
            onImagesChange={setGalleryImages}
          />

          {/* Row 4: Hotel Images */}
          <div className="pt-4 border-t border-border">
            <ImageUploader
              label="Hotel Images (Where You'll Stay Section, Max 10)"
              maxImages={10}
              images={hotelImages}
              onImagesChange={setHotelImages}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-[#f97316] hover:bg-[#ea580c] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            initialData ? 'Update Package' : 'Create Package'
          )}
        </Button>
      </div>
    </form>
  );
}
