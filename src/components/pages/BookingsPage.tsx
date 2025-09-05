import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, 
  Car, 
  Train, 
  Bike, 
  Star, 
  MapPin, 
  Search,
  Filter,
  Clock,
  Users,
  Wifi,
  Coffee,
  CheckCircle,
  User,
  Bed
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingsPageProps {
  onNavigateToAccount?: () => void;
}

const BookingsPage: React.FC<BookingsPageProps> = ({ onNavigateToAccount }) => {
  const [activeTab, setActiveTab] = useState("stay");
  const [stayFilters, setStayFilters] = useState({
    type: "all",
    priceRange: "all",
    rating: "all"
  });
  const [travelFilters, setTravelFilters] = useState({
    type: "all",
    priceRange: "all",
    features: "all"
  });

  const stayOptions = [
    {
      id: 1,
      name: "Hyderabad Backpackers Hub",
      location: "Banjara Hills, Hyderabad",
      price: "₹800/night",
      rating: 4.7,
      image: "🏨",
      amenities: ["Free WiFi", "AC", "Lockers", "Common Kitchen"],
      verified: true,
      category: "hostel"
    },
    {
      id: 2,
      name: "Gachibowli Tech Stays",
      location: "Gachibowli, Hyderabad", 
      price: "₹1,200/night",
      rating: 4.8,
      image: "🏢",
      amenities: ["Co-working space", "Gym", "Rooftop", "24/7 security"],
      verified: true,
      category: "coliving"
    },
    {
      id: 3,
      name: "Jubilee Hills Heritage Hotel",
      location: "Jubilee Hills, Hyderabad",
      price: "₹2,500/night", 
      rating: 4.9,
      image: "🏰",
      amenities: ["Heritage rooms", "Pool", "Spa", "Restaurant"],
      verified: true,
      category: "hotel"
    }
  ];

  const transportOptions = [
    {
      id: 1,
      name: "Hyderabad Metro Rail",
      type: "Public transport",
      price: "₹20-60",
      route: "Covers major areas in Hyderabad",
      features: ["Air conditioned", "Safe", "Frequent services"],
      available: true
    },
    {
      id: 2,
      name: "Ola/Uber Rides", 
      type: "Ride sharing",
      price: "₹150-400",
      route: "Door to door service",
      features: ["Live tracking", "Multiple vehicle options", "Cashless"],
      available: true
    },
    {
      id: 3,
      name: "TSRTC Bus Services",
      type: "Public transport",
      price: "₹15-50",
      route: "City and intercity routes",
      features: ["Economic", "Frequent", "Wide network"],
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
            placeholder="Hyderabad"
            value="Hyderabad"
            className="pl-10 bg-white/95 backdrop-blur border-0 shadow-medium"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-6 mt-4">
            <TabsTrigger value="stay">Stay</TabsTrigger>
            <TabsTrigger value="transport">Travel</TabsTrigger>
          </TabsList>

          {/* Stay Tab */}
          <TabsContent value="stay" className="flex-1 overflow-y-auto p-6 pt-4">
            {/* Stay Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button 
                variant={stayFilters.type === "all" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, type: "all"})}
                className="whitespace-nowrap"
              >
                All Types
              </Button>
              <Button 
                variant={stayFilters.type === "hostel" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, type: "hostel"})}
                className="whitespace-nowrap"
              >
                Hostels
              </Button>
              <Button 
                variant={stayFilters.type === "hotel" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, type: "hotel"})}
                className="whitespace-nowrap"
              >
                Hotels
              </Button>
              <Button 
                variant={stayFilters.type === "coliving" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, type: "coliving"})}
                className="whitespace-nowrap"
              >
                Co-living
              </Button>
              <Button 
                variant={stayFilters.priceRange === "budget" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, priceRange: "budget"})}
                className="whitespace-nowrap"
              >
                Budget
              </Button>
              <Button 
                variant={stayFilters.rating === "4+" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, rating: "4+"})}
                className="whitespace-nowrap"
              >
                4+ Rating
              </Button>
            </div>
            
            <div className="space-y-4">
              {stayOptions.map((stay) => (
                <Card key={stay.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{stay.image}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{stay.name}</h3>
                          {stay.verified && (
                            <Badge className="bg-success text-success-foreground text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{stay.location}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            <span className="text-xs">{stay.rating}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {stay.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">{stay.price}</p>
                      <Button size="sm" className="mt-2 bg-gradient-primary text-white border-0">
                        Book Now
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {stay.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity.includes("WiFi") && <Wifi className="w-3 h-3 mr-1" />}
                        {amenity.includes("Kitchen") && <Coffee className="w-3 h-3 mr-1" />}
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Travel Tab */}
          <TabsContent value="transport" className="flex-1 overflow-y-auto p-6 pt-4">
            {/* Travel Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button 
                variant={travelFilters.type === "all" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setTravelFilters({...travelFilters, type: "all"})}
                className="whitespace-nowrap"
              >
                All Types
              </Button>
              <Button 
                variant={travelFilters.type === "public" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setTravelFilters({...travelFilters, type: "public"})}
                className="whitespace-nowrap"
              >
                Public Transport
              </Button>
              <Button 
                variant={travelFilters.type === "ride" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setTravelFilters({...travelFilters, type: "ride"})}
                className="whitespace-nowrap"
              >
                Ride Sharing
              </Button>
              <Button 
                variant={travelFilters.priceRange === "budget" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setTravelFilters({...travelFilters, priceRange: "budget"})}
                className="whitespace-nowrap"
              >
                Budget
              </Button>
              <Button 
                variant={travelFilters.features === "fast" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setTravelFilters({...travelFilters, features: "fast"})}
                className="whitespace-nowrap"
              >
                Fast
              </Button>
              <Button 
                variant={travelFilters.features === "comfort" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setTravelFilters({...travelFilters, features: "comfort"})}
                className="whitespace-nowrap"
              >
                Comfort
              </Button>
            </div>
            
            <div className="space-y-4">
              {transportOptions.map((transport) => (
                <Card key={transport.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{transport.name}</h3>
                      <p className="text-sm text-muted-foreground">{transport.type}</p>
                      <p className="text-sm text-muted-foreground mt-1">{transport.route}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{transport.price}</p>
                      <Button size="sm" className="mt-2 bg-gradient-primary text-white border-0">
                        Book
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Features:</p>
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
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default BookingsPage;
