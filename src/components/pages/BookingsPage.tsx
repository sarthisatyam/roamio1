import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bed, 
  Car, 
  Train, 
  Plane, 
  Shield, 
  Star, 
  MapPin, 
  Search,
  Filter,
  Clock,
  Users,
  Wifi,
  Coffee,
  CheckCircle,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingsPageProps {
  onNavigateToAccount?: () => void;
}

const BookingsPage: React.FC<BookingsPageProps> = ({ onNavigateToAccount }) => {
  const [activeCategory, setActiveCategory] = useState("hostels");

  const categories = [
    { id: "hostels", name: "Hostels", icon: Bed },
    { id: "hotels", name: "Hotels", icon: Bed },
    { id: "transport", name: "Transport", icon: Car },
    { id: "flights", name: "Flights", icon: Plane }
  ];

  const hostels = [
    {
      id: 1,
      name: "Zostel Goa",
      location: "Anjuna, Goa",
      price: "₹1,200/night",
      rating: 4.8,
      safety: 96,
      image: "🏨",
      amenities: ["Free WiFi", "Female dorms", "24/7 security", "Beach access"],
      verified: true,
      soloFriendly: true
    },
    {
      id: 2,
      name: "Backpacker Panda",
      location: "Manali, Himachal Pradesh", 
      price: "₹800/night",
      rating: 4.7,
      safety: 98,
      image: "🏔️",
      amenities: ["Mountain view", "Lockers", "Trek bookings", "Bonfire area"],
      verified: true,
      soloFriendly: true
    },
    {
      id: 3,
      name: "Mad Packer Hostel",
      location: "Udaipur, Rajasthan",
      price: "₹1,000/night", 
      rating: 4.6,
      safety: 94,
      image: "🏰",
      amenities: ["Lake view", "Heritage walk", "Rooftop café", "Female only floors"],
      verified: true,
      soloFriendly: true
    }
  ];

  const transports = [
    {
      id: 1,
      name: "Ola Prime",
      type: "Ride sharing",
      price: "₹200-300",
      safety: 94,
      features: ["Female driver option", "Live tracking", "Emergency button"],
      available: true
    },
    {
      id: 2,
      name: "Uber Women",
      type: "Ride sharing", 
      price: "₹150-250",
      safety: 92,
      features: ["Women drivers only", "Share trip", "Audio recording"],
      available: true
    },
    {
      id: 3,
      name: "Delhi Metro",
      type: "Public transport",
      price: "₹60",
      safety: 88,
      features: ["Ladies coach", "CCTV monitoring", "Help points"],
      available: true
    }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Book Your Journey</h1>
            <p className="text-white/80 text-sm">Safe accommodations & transport for solo travelers</p>
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
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search Indian destinations or dates..."
            className="pl-10 bg-white/95 backdrop-blur border-0 shadow-medium"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Categories */}
        <div className="px-6 py-4">

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex-shrink-0 gap-2",
                    activeCategory === category.id && "bg-gradient-primary text-white border-0"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <Shield className="w-3 h-3" />
              Solo-friendly only
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              Female dorms
            </Badge>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Hostels Content */}
        {activeCategory === "hostels" && (
          <div className="space-y-4">
            {hostels.map((hostel) => (
              <Card key={hostel.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{hostel.image}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{hostel.name}</h3>
                        {hostel.verified && (
                          <Badge className="bg-success text-success-foreground text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{hostel.location}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span className="text-xs">{hostel.rating}</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success">
                          {hostel.safety}% Safe
                        </Badge>
                        {hostel.soloFriendly && (
                          <Badge variant="secondary" className="text-xs">
                            Solo-friendly
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">{hostel.price}</p>
                    <Button size="sm" className="mt-2 bg-gradient-primary text-white border-0">
                      Book Now
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {hostel.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity.includes("WiFi") && <Wifi className="w-3 h-3 mr-1" />}
                      {amenity.includes("Common") && <Coffee className="w-3 h-3 mr-1" />}
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Transport Content */}
        {activeCategory === "transport" && (
          <div className="space-y-4">
            {transports.map((transport) => (
              <Card key={transport.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{transport.name}</h3>
                    <p className="text-sm text-muted-foreground">{transport.type}</p>
                    <Badge variant="outline" className="text-xs mt-1 bg-success/10 text-success border-success">
                      {transport.safety}% Safety Rating
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{transport.price}</p>
                    <Button size="sm" className="mt-2 bg-gradient-primary text-white border-0">
                      Book
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Safety Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {transport.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Other categories placeholder */}
        {(activeCategory === "hotels" || activeCategory === "flights") && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              {activeCategory === "hotels" ? <Bed className="w-8 h-8 text-muted-foreground" /> : <Plane className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {activeCategory === "hotels" ? "Hotels" : "Flights"} Coming Soon
            </h3>
            <p className="text-muted-foreground">
              We're working on bringing you the best {activeCategory} with safety-first approach.
            </p>
          </div>
        )}

          {/* Trust Signals */}
          <Card className="mt-8 p-4 bg-gradient-card">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Safety Guarantee</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Verified hosts only</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>24/7 support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Full refund protection</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
