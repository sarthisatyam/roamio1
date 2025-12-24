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
  Radio,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import BookingDialog from "@/components/dialogs/BookingDialog";
import DestinationDialog from "@/components/dialogs/DestinationDialog";
import { useAISearch, AIDestination } from "@/hooks/useAISearch";
import AISearchResults from "@/components/AISearchResults";

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
      price: "₹800",
      bookingUrl: "#",
      icon: Music,
      isLive: true,
      fillingFast: false
    },
    { 
      name: "Stand-up Comedy Show", 
      type: "Entertainment", 
      distance: "4.2 km", 
      date: "Tomorrow, 7:30 PM",
      duration: "2 hours",
      rating: 4.3, 
      reviews: "8.5k",
      price: "₹500",
      bookingUrl: "#",
      icon: Laugh,
      isLive: false,
      fillingFast: true
    },
    { 
      name: "Food Festival at Kingdom of Dreams", 
      type: "Food & Culture", 
      distance: "8.5 km", 
      date: "Mar 25-26",
      duration: "All Day",
      rating: 4.6, 
      reviews: "15k",
      price: "₹1,200",
      bookingUrl: "#",
      icon: UtensilsCrossed,
      isLive: true,
      fillingFast: true
    },
    { 
      name: "Art Exhibition - Modern India", 
      type: "Art & Culture", 
      distance: "3.1 km", 
      date: "This Week",
      duration: "4 hours",
      rating: 4.4, 
      reviews: "20k",
      price: "₹350",
      bookingUrl: "#",
      icon: Palette,
      isLive: false,
      fillingFast: false
    }
  ];

  // AI Search hook
  const { results: aiResults, isLoading: aiLoading, error: aiError } = useAISearch(searchQuery, {
    pageContext: 'home'
  });

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

  // Check if we should show AI results (no static matches and search is active)
  const showAIResults = searchQuery.length >= 2 && filteredDestinations.length === 0;

  const handleAIDestinationSelect = (dest: AIDestination) => {
    setSelectedDestination(dest);
    setDestinationDialogOpen(true);
  };

  const getHotspotPlatforms = (spot: typeof hotspots[0]) => [
    { name: "BookMyShow", price: "₹800", savings: "₹100", url: "https://bookmyshow.com", icon: "🎬" },
    { name: "Paytm", price: "₹850", savings: "₹50", url: "https://paytm.com", icon: "💳" },
    { name: "MakeMyTrip", price: "₹900", savings: "₹0", url: "https://makemytrip.com", icon: "🔵" }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Search */}
      <div className="bg-gradient-hero px-4 py-3 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white mb-0.5 truncate">
              Good morning{userData?.name ? `, ${userData.name}` : ''}! 👋
            </h1>
            <p className="text-white/80 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {userData?.locationEnabled ? "Delhi" : "Enable location"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToAccount}
            className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 flex-shrink-0"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search destinations, activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs bg-white/95 backdrop-blur border-0 shadow-medium rounded-xl"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Access */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-4 gap-2">
            {quickAccess.map((item) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.label} 
                  className="p-3 text-center shadow-soft hover:shadow-medium transition-shadow cursor-pointer rounded-2xl border-0"
                  onClick={item.onClick}
                >
                  <div className={cn("w-10 h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center", item.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-medium leading-tight">{item.label}</p>
                </Card>
              );
            })}
          </div>
          
          {/* Additional Categories */}
          {showMoreCategories && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {moreCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.label} className="p-3 text-center shadow-soft hover:shadow-medium transition-shadow cursor-pointer rounded-2xl border-0">
                    <div className={cn("w-10 h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center", item.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-medium leading-tight">{item.label}</p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Safe Destinations */}
        <section className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">Safe Destinations</h2>
              <p className="text-[10px] text-muted-foreground">Verified solo-friendly places</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary text-xs h-8 px-2">
              See all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          {filteredDestinations.length > 0 ? (
            <div className="space-y-3">
              {filteredDestinations.map((dest) => (
                <Card 
                  key={dest.id} 
                  className="p-3 shadow-soft hover:shadow-medium transition-all cursor-pointer rounded-2xl border-0"
                  onClick={() => {
                    setSelectedDestination(dest);
                    setDestinationDialogOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">{dest.image}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{dest.name}</h3>
                        <Badge variant="outline" className="text-[10px] mt-1 py-0.5 px-2 rounded-lg bg-success/10 text-success border-success/30">
                          <Shield className="w-2.5 h-2.5 mr-0.5" />
                          {dest.safety}% Safe
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <Bookmark 
                        className={cn(
                          "w-4 h-4 cursor-pointer transition-colors",
                          bookmarkedPlaces.find(p => p.id === dest.id)
                            ? "text-primary fill-current"
                            : "text-muted-foreground hover:text-primary"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark?.({ id: dest.id, name: dest.name, image: dest.image });
                        }}
                      />
                      <p className="font-bold text-sm text-primary mt-1">{dest.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dest.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">
                        {tag}
                      </Badge>
                    ))}
                    {dest.tags.length > 2 && (
                      <Badge variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">
                        +{dest.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : showAIResults && (
            <AISearchResults
              results={aiResults}
              isLoading={aiLoading}
              error={aiError}
              searchQuery={searchQuery}
              onSelectDestination={handleAIDestinationSelect}
              showDestinations={true}
              showStays={true}
              showTravel={true}
              bookmarkedIds={bookmarkedPlaces.map(p => p.id)}
            />
          )}
        </section>

        {/* Hotspots - Live Events */}
        <section className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Hotspots</h2>
          </div>
          
          {filteredHotspots.length > 0 ? (
            <div className="space-y-3">
              {filteredHotspots.map((spot, index) => {
                const IconComponent = spot.icon;
                return (
                  <Card 
                    key={index} 
                    className="p-3 shadow-soft hover:shadow-medium transition-all rounded-2xl border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        spot.isLive ? "bg-warning/10" : "bg-primary/10"
                      )}>
                        <IconComponent className={cn(
                          "w-4 h-4",
                          spot.isLive ? "text-warning" : "text-primary"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm leading-tight line-clamp-2">{spot.name}</h3>
                          <div className="flex flex-col gap-0.5 items-end flex-shrink-0">
                            {spot.isLive && (
                              <Badge className="bg-warning text-warning-foreground text-[9px] px-1.5 py-0 flex items-center gap-0.5">
                                <Radio className="w-2 h-2" />
                                Live
                              </Badge>
                            )}
                            {spot.fillingFast && (
                              <Badge className="bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0">
                                Filling Fast
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {spot.date}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {spot.duration}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {spot.distance}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/50">
                          <div className="text-sm font-bold text-primary">{spot.price}</div>
                          <Button 
                            size="sm"
                            className="text-xs h-8 rounded-xl px-4 bg-gradient-primary text-white"
                            onClick={() => {
                              setSelectedHotspot(spot);
                              setBookingDialogOpen(true);
                            }}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : null}
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