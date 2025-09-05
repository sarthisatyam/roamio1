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

  const travelOptions = [
    {
      id: 1,
      name: "Flight to Delhi",
      type: "flight",
      route: "HYD → DEL",
      duration: "2h 30m",
      features: ["Window seat preference", "Solo traveler deals", "Carry-on included"],
      icon: "✈️"
    },
    {
      id: 2,
      name: "Train to Bangalore", 
      type: "train",
      route: "HYD → BLR",
      duration: "12h 45m",
      features: ["AC 3 Tier", "Ladies compartment", "Meal included"],
      icon: "🚆"
    },
    {
      id: 3,
      name: "Bus to Goa",
      type: "bus",
      route: "HYD → GOA",
      duration: "14h 30m",
      features: ["Sleeper berth", "WiFi", "Rest stops"],
      icon: "🚌"
    },
    {
      id: 4,
      name: "Cab to Vijayawada",
      type: "cab",
      route: "HYD → VJA", 
      duration: "4h 20m",
      features: ["Solo ride sharing", "AC", "Verified drivers"],
      icon: "🚗"
    }
  ];

  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedTravel, setSelectedTravel] = useState(null);

  const stayComparisons = {
    1: {
      makemytrip: "₹750/night",
      booking: "₹820/night", 
      goibibo: "₹780/night",
      agoda: "₹800/night",
      features: ["Solo female friendly", "24/7 security", "Common areas"]
    },
    2: {
      makemytrip: "₹1,150/night",
      booking: "₹1,200/night",
      goibibo: "₹1,180/night", 
      zolo: "₹1,100/night",
      features: ["Co-working space", "Solo events", "Networking"]
    },
    3: {
      makemytrip: "₹2,300/night",
      booking: "₹2,500/night",
      goibibo: "₹2,400/night",
      agoda: "₹2,450/night", 
      features: ["Heritage experience", "Solo dining", "Guided tours"]
    }
  };

  const travelComparisons = {
    1: {
      makemytrip: "₹4,200",
      goibibo: "₹4,150",
      cleartrip: "₹4,300",
      ixigo: "₹4,180",
      features: ["Solo check-in", "Seat selection", "Flexible booking"]
    },
    2: {
      irctc: "₹1,250",
      makemytrip: "₹1,280", 
      goibibo: "₹1,260",
      redbus: "₹1,240",
      features: ["Tatkal booking", "Food delivery", "Travel insurance"]
    },
    3: {
      redbus: "₹1,800",
      makemytrip: "₹1,850",
      goibibo: "₹1,820",
      abhibus: "₹1,780",
      features: ["Live tracking", "Solo safety", "Rest stops"]
    },
    4: {
      ola: "₹2,800",
      uber: "₹2,900",
      rapido: "₹2,700", 
      blablacar: "₹2,200",
      features: ["Ride sharing", "Solo verification", "Split costs"]
    }
  };


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
                      <Button size="sm" onClick={() => setSelectedStay(selectedStay === stay.id ? null : stay.id)}>
                        Compare Prices
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
                   
                   {selectedStay === stay.id && (
                     <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                       <h4 className="font-semibold mb-3">Price Comparison</h4>
                       <div className="grid grid-cols-2 gap-2 mb-3">
                         {Object.entries(stayComparisons[stay.id as keyof typeof stayComparisons] || {}).map(([platform, price]) => {
                           if (platform === 'features') return null;
                           return (
                             <div key={platform} className="flex justify-between items-center p-2 bg-background rounded">
                               <span className="text-sm font-medium capitalize">{platform}</span>
                               <span className="text-sm font-bold text-primary">{price as string}</span>
                             </div>
                           );
                         })}
                       </div>
                       <div className="mb-3">
                         <p className="text-sm font-medium mb-2">Solo Traveler Features:</p>
                         <div className="flex flex-wrap gap-1">
                           {stayComparisons[stay.id as keyof typeof stayComparisons]?.features?.map((feature) => (
                             <Badge key={feature} variant="secondary" className="text-xs">
                               {feature}
                             </Badge>
                           ))}
                         </div>
                       </div>
                       <Button size="sm" className="w-full bg-gradient-primary text-white">
                         Book Best Deal
                       </Button>
                     </div>
                   )}
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
              {travelOptions.map((travel) => (
                <Card key={travel.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer"
                      onClick={() => setSelectedTravel(selectedTravel === travel.id ? null : travel.id)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{travel.icon}</div>
                      <div>
                        <h3 className="font-semibold">{travel.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{travel.type}</p>
                        <p className="text-sm text-muted-foreground mt-1">{travel.route} • {travel.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button size="sm">
                        Compare Prices
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {travel.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  {selectedTravel === travel.id && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-3">Price Comparison</h4>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {Object.entries(travelComparisons[travel.id as keyof typeof travelComparisons] || {}).map(([platform, price]) => {
                          if (platform === 'features') return null;
                          return (
                            <div key={platform} className="flex justify-between items-center p-2 bg-background rounded">
                              <span className="text-sm font-medium capitalize">{platform}</span>
                              <span className="text-sm font-bold text-primary">{price as string}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">Solo Traveler Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {travelComparisons[travel.id as keyof typeof travelComparisons]?.features?.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" className="w-full bg-gradient-primary text-white">
                        Book Best Deal
                      </Button>
                    </div>
                  )}
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
