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
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HomePageProps {
  userData?: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean } | null;
  onNavigateToAccount?: () => void;
  bookmarkedPlaces?: { id: number; name: string; image: string }[];
  onToggleBookmark?: (place: { id: number; name: string; image: string }) => void;
}

const HomePage: React.FC<HomePageProps> = ({ userData, onNavigateToAccount, bookmarkedPlaces = [], onToggleBookmark }) => {
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  const destinations = [
    {
      id: 1,
      name: "Goa, India",
      image: "🏖️",
      rating: 4.8,
      price: "₹1,500/day",
      safety: 92,
      tags: ["Solo-friendly", "Beach vibes", "Safe transport"]
    },
    {
      id: 2,
      name: "Manali, Himachal Pradesh",
      image: "🏔️",
      rating: 4.9,
      price: "₹1,200/day",
      safety: 95,
      tags: ["Women-safe", "Adventure hub", "Mountain retreat"]
    },
    {
      id: 3,
      name: "Udaipur, Rajasthan",
      image: "🏰",
      rating: 4.7,
      price: "₹2,000/day",
      safety: 94,
      tags: ["Heritage city", "Solo traveler friendly", "Palace stays"]
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
      bookingUrl: "#"
    },
    { 
      name: "Stand-up Comedy Show", 
      type: "Entertainment", 
      distance: "4.2 km", 
      date: "Tomorrow, 7:30 PM",
      duration: "2 hours",
      rating: 4.3, 
      reviews: "8.5k",
      bookingUrl: "#"
    },
    { 
      name: "Food Festival at Kingdom of Dreams", 
      type: "Food & Culture", 
      distance: "8.5 km", 
      date: "Mar 25-26",
      duration: "All Day",
      rating: 4.6, 
      reviews: "15k",
      bookingUrl: "#"
    },
    { 
      name: "Art Exhibition - Modern India", 
      type: "Art & Culture", 
      distance: "3.1 km", 
      date: "This Week",
      duration: "4 hours",
      rating: 4.4, 
      reviews: "20k",
      bookingUrl: "#"
    }
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
            {destinations.map((dest) => (
              <Card key={dest.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
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
            {hotspots.map((spot, index) => (
              <Card key={index} className="p-4 shadow-soft hover:shadow-medium transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2 text-sm sm:text-base">{spot.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-2">
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
                  onClick={() => window.open(spot.bookingUrl, '_blank')}
                >
                  Book Now
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;