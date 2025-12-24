import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  User, 
  MapPin, 
  Star, 
  Shield, 
  Wifi, 
  Coffee, 
  ArrowRight,
  Compass,
  Bookmark,
  TrendingUp,
  ShoppingBag,
  Camera,
  MoreHorizontal,
  Fuel,
  Stethoscope,
  Building2,
  Utensils,
  Calendar,
  Clock,
  Music,
  Laugh,
  UtensilsCrossed,
  Palette,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import BookingDialog from "@/components/dialogs/BookingDialog";
import DestinationDialog from "@/components/dialogs/DestinationDialog";

interface HomePageProps {
  userData?: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean } | null;
  onNavigateToAccount?: () => void;
  bookmarkedPlaces?: { id: number; name: string; image: string }[];
  onToggleBookmark?: (place: { id: number; name: string; image: string }) => void;
  onAddToPlanner?: (activity: { title: string; location: string; type: string }) => void;
}

const HomePage: React.FC<HomePageProps> = ({ userData, onNavigateToAccount, bookmarkedPlaces = [], onToggleBookmark, onAddToPlanner }) => {
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [destinationDialogOpen, setDestinationDialogOpen] = useState(false);

  const destinations = [
    {
      id: 1,
      name: "Goa, India",
      image: "🏖️",
      rating: 4.8,
      price: "₹1,500/day",
      safety: 92,
      tags: ["Solo-friendly", "Beach vibes", "Safe transport"],
      itinerary: [
        {
          day: 1,
          title: "Beach & Chill",
          activities: [
            { time: "8:00 AM", activity: "Sunrise at Palolem Beach", type: "Scenic" },
            { time: "10:00 AM", activity: "Breakfast at Beach Shack", type: "Food" },
            { time: "2:00 PM", activity: "Water Sports at Baga Beach", type: "Adventure" },
            { time: "6:00 PM", activity: "Sunset at Vagator Beach", type: "Scenic" }
          ]
        },
        {
          day: 2,
          title: "Heritage & Culture",
          activities: [
            { time: "9:00 AM", activity: "Old Goa Churches Tour", type: "Heritage" },
            { time: "1:00 PM", activity: "Goan Thali Lunch", type: "Food" },
            { time: "4:00 PM", activity: "Fontainhas Latin Quarter Walk", type: "Heritage" }
          ]
        }
      ],
      eateries: [
        { name: "Gunpowder", type: "Goan Cuisine", rating: 4.6, priceRange: "₹₹", specialty: "Prawn Balchao" },
        { name: "Thalassa", type: "Greek-Goan", rating: 4.7, priceRange: "₹₹₹", specialty: "Seafood Platter" },
        { name: "Ritz Classic", type: "Local", rating: 4.5, priceRange: "₹", specialty: "Fish Curry Rice" }
      ]
    },
    {
      id: 2,
      name: "Manali, Himachal Pradesh",
      image: "🏔️",
      rating: 4.9,
      price: "₹1,200/day",
      safety: 95,
      tags: ["Women-safe", "Adventure hub", "Mountain retreat"],
      itinerary: [
        {
          day: 1,
          title: "Mountain Exploration",
          activities: [
            { time: "7:00 AM", activity: "Sunrise Trek to Jogini Falls", type: "Adventure" },
            { time: "11:00 AM", activity: "Visit Hadimba Temple", type: "Heritage" },
            { time: "3:00 PM", activity: "Mall Road Shopping", type: "Shopping" },
            { time: "6:00 PM", activity: "Cafe Hopping in Old Manali", type: "Food" }
          ]
        },
        {
          day: 2,
          title: "Solang Valley Day",
          activities: [
            { time: "8:00 AM", activity: "Paragliding at Solang Valley", type: "Adventure" },
            { time: "12:00 PM", activity: "Atal Tunnel Visit", type: "Scenic" },
            { time: "4:00 PM", activity: "Hot Springs at Vashisht", type: "Wellness" }
          ]
        }
      ],
      eateries: [
        { name: "Drifters' Cafe", type: "Continental", rating: 4.5, priceRange: "₹₹", specialty: "Wood-fired Pizza" },
        { name: "Johnson's Cafe", type: "Multi-cuisine", rating: 4.4, priceRange: "₹₹", specialty: "Trout Fish" },
        { name: "Lazy Dog", type: "Cafe", rating: 4.6, priceRange: "₹", specialty: "Pancakes & Coffee" }
      ]
    },
    {
      id: 3,
      name: "Udaipur, Rajasthan",
      image: "🏰",
      rating: 4.7,
      price: "₹2,000/day",
      safety: 94,
      tags: ["Heritage city", "Solo traveler friendly", "Palace stays"],
      itinerary: [
        {
          day: 1,
          title: "Royal Heritage",
          activities: [
            { time: "9:00 AM", activity: "City Palace Tour", type: "Heritage" },
            { time: "1:00 PM", activity: "Lunch at Ambrai Ghat", type: "Food" },
            { time: "4:00 PM", activity: "Boat Ride on Lake Pichola", type: "Scenic" },
            { time: "7:00 PM", activity: "Sunset at Sajjangarh", type: "Scenic" }
          ]
        },
        {
          day: 2,
          title: "Art & Culture",
          activities: [
            { time: "10:00 AM", activity: "Bagore Ki Haveli & Folk Dance", type: "Cultural" },
            { time: "2:00 PM", activity: "Hathi Pol Bazaar Shopping", type: "Shopping" },
            { time: "5:00 PM", activity: "High Tea at Taj Lake Palace", type: "Food" }
          ]
        }
      ],
      eateries: [
        { name: "Ambrai", type: "Rajasthani", rating: 4.7, priceRange: "₹₹₹", specialty: "Lake View Dining" },
        { name: "Savage Garden", type: "Fusion", rating: 4.5, priceRange: "₹₹", specialty: "Rooftop Ambiance" },
        { name: "Natraj Dining Hall", type: "Thali", rating: 4.4, priceRange: "₹", specialty: "Unlimited Rajasthani Thali" }
      ]
    }
  ];

  const quickAccess = [
    { icon: Coffee, label: "Cafes", color: "bg-amber-100 text-amber-700" },
    { icon: ShoppingBag, label: "Shopping", color: "bg-purple-100 text-purple-700" },
    { icon: Camera, label: "Attractions", color: "bg-green-100 text-green-700" },
    { icon: MoreHorizontal, label: "More", color: "bg-blue-100 text-blue-700", onClick: () => setShowMoreCategories(!showMoreCategories) }
  ];

  const moreCategories = [
    { icon: Fuel, label: "Petrol", color: "bg-red-100 text-red-700" },
    { icon: Stethoscope, label: "Clinics", color: "bg-pink-100 text-pink-700" },
    { icon: Building2, label: "Museums", color: "bg-indigo-100 text-indigo-700" },
    { icon: Utensils, label: "Restaurants", color: "bg-orange-100 text-orange-700" }
  ];

  const hotspots = [
    { 
      name: "Live Music Night at Hard Rock Cafe", 
      type: "Live Event", 
      distance: "2.5 km", 
      date: "Today, 8:00 PM",
      duration: "3 hours",
      rating: 4.5, 
      reviews: "12k",
      bookingUrl: "#",
      icon: Music,
      isLive: true
    },
    { 
      name: "Stand-up Comedy Show", 
      type: "Entertainment", 
      distance: "4.2 km", 
      date: "Tomorrow, 7:30 PM",
      duration: "2 hours",
      rating: 4.3, 
      reviews: "8.5k",
      bookingUrl: "#",
      icon: Laugh,
      isLive: false
    },
    { 
      name: "Food Festival at Kingdom of Dreams", 
      type: "Food & Culture", 
      distance: "8.5 km", 
      date: "Mar 25-26",
      duration: "All Day",
      rating: 4.6, 
      reviews: "15k",
      bookingUrl: "#",
      icon: UtensilsCrossed,
      isLive: true
    },
    { 
      name: "Art Exhibition - Modern India", 
      type: "Art & Culture", 
      distance: "3.1 km", 
      date: "This Week",
      duration: "4 hours",
      rating: 4.4, 
      reviews: "20k",
      bookingUrl: "#",
      icon: Palette,
      isLive: false
    }
  ];

  // Filter destinations based on search
  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter hotspots based on search
  const filteredHotspots = hotspots.filter(spot =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHotspotPlatforms = (spot: typeof hotspots[0]) => [
    { name: "BookMyShow", price: "₹800", savings: "₹100", url: "https://bookmyshow.com", icon: "🎬" },
    { name: "Paytm", price: "₹850", savings: "₹50", url: "https://paytm.com", icon: "💳" },
    { name: "MakeMyTrip", price: "₹900", savings: "₹0", url: "https://makemytrip.com", icon: "🔵" }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Search */}
      <div className="bg-gradient-hero p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Good morning{userData?.name ? `, ${userData.name}` : ''}! 👋
            </h1>
            <p className="text-white/80 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Delhi
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToAccount}
            className="w-10 h-10 rounded-full bg-secondary/90 text-foreground hover:bg-secondary border-secondary"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search destinations, stays, or activities in India..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/95 backdrop-blur border-0 shadow-medium"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Access */}
        <div className="px-4 pt-2 mb-6">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {quickAccess.map((item) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.label} 
                  className="p-3 sm:p-4 text-center shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
                  onClick={item.onClick}
                >
                  <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-xl mx-auto mb-2 flex items-center justify-center", item.color)}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <p className="text-xs font-medium leading-tight">{item.label}</p>
                </Card>
              );
            })}
          </div>
          
          {/* Additional Categories */}
          {showMoreCategories && (
            <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
              {moreCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.label} className="p-3 sm:p-4 text-center shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
                    <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-xl mx-auto mb-2 flex items-center justify-center", item.color)}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-xs font-medium leading-tight">{item.label}</p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Safe Destinations */}
        <section className="px-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Safe Destinations</h2>
              <p className="text-sm text-muted-foreground">Verified solo-friendly places</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              See all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {filteredDestinations.map((dest) => (
              <Card 
                key={dest.id} 
                className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer"
                onClick={() => {
                  setSelectedDestination(dest);
                  setDestinationDialogOpen(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{dest.image}</div>
                    <div>
                      <h3 className="font-semibold">{dest.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span className="text-xs">{dest.rating}</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success">
                          {dest.safety}% Safe
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{dest.price}</p>
                    <Bookmark 
                      className={cn(
                        "w-4 h-4 ml-auto mt-1 cursor-pointer transition-colors",
                        bookmarkedPlaces.find(p => p.id === dest.id)
                          ? "text-primary fill-current"
                          : "text-muted-foreground hover:text-primary"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark?.({ id: dest.id, name: dest.name, image: dest.image });
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {dest.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Hotspots - Live Events */}
        <section className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Hotspots</h2>
          </div>
          
          <div className="space-y-3">
            {filteredHotspots.map((spot, index) => {
              const IconComponent = spot.icon;
              return (
                <Card 
                  key={index} 
                  className={cn(
                    "p-4 shadow-soft hover:shadow-medium transition-all",
                    spot.isLive && "border-l-4 border-l-success"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        spot.isLive ? "bg-success/10" : "bg-primary/10"
                      )}>
                        <IconComponent className={cn(
                          "w-5 h-5",
                          spot.isLive ? "text-success" : "text-primary"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm sm:text-base truncate">{spot.name}</h3>
                          {spot.isLive && (
                            <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0 flex items-center gap-1">
                              <Radio className="w-2.5 h-2.5" />
                              Live
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {spot.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {spot.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {spot.distance}
                          </span>
                          <span>{spot.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {spot.rating}
                      </div>
                      <div className="text-xs text-muted-foreground">{spot.reviews}</div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-primary text-white border-0 hover:opacity-90"
                    onClick={() => {
                      setSelectedHotspot(spot);
                      setBookingDialogOpen(true);
                    }}
                  >
                    Book Now
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      {/* Booking Dialog */}
      {selectedHotspot && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          title={selectedHotspot.name}
          subtitle="Compare prices across platforms"
          platforms={getHotspotPlatforms(selectedHotspot)}
          eventDetails={{
            date: selectedHotspot.date,
            duration: selectedHotspot.duration,
            location: selectedHotspot.distance,
            rating: selectedHotspot.rating,
            reviews: selectedHotspot.reviews
          }}
        />
      )}
      {/* Destination Dialog */}
      <DestinationDialog
        open={destinationDialogOpen}
        onOpenChange={setDestinationDialogOpen}
        destination={selectedDestination}
        onAddToPlanner={onAddToPlanner}
      />
    </div>
  );
};

export default HomePage;