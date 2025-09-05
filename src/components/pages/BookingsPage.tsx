import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
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
  Bed,
  Calendar as CalendarIcon,
  Plane
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingsPageProps {
  onNavigateToAccount?: () => void;
}

const BookingsPage: React.FC<BookingsPageProps> = ({ onNavigateToAccount }) => {
  const [activeTab, setActiveTab] = useState("stay");
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [departureDate, setDepartureDate] = useState<Date>();
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

  const flightOptions = [
    {
      id: 1,
      name: "IndiGo 6E-2134",
      departure: "06:30",
      arrival: "09:00",
      duration: "2h 30m",
      price: "₹4,200",
      features: ["Window seat", "Carry-on included", "Web check-in"],
      type: "Non-stop"
    },
    {
      id: 2,
      name: "Air India AI-505",
      departure: "14:15",
      arrival: "16:45",
      duration: "2h 30m",
      price: "₹3,850",
      features: ["Meal included", "Extra legroom", "Priority boarding"],
      type: "Non-stop"
    },
    {
      id: 3,
      name: "Vistara UK-873",
      departure: "20:30",
      arrival: "23:00",
      duration: "2h 30m",
      price: "₹4,500",
      features: ["Premium economy", "Entertainment", "Wifi"],
      type: "Non-stop"
    }
  ];

  const trainOptions = [
    {
      id: 1,
      name: "Rajdhani Express",
      departure: "17:05",
      arrival: "09:55+1",
      duration: "16h 50m",
      price: "₹2,540",
      features: ["AC 2 Tier", "Meals included", "Bedding"],
      type: "Express"
    },
    {
      id: 2,
      name: "AP Express",
      departure: "06:15",
      arrival: "21:20",
      duration: "15h 05m",
      price: "₹1,250",
      features: ["AC 3 Tier", "Pantry car", "Ladies coach"],
      type: "Express"
    },
    {
      id: 3,
      name: "Telangana Express",
      departure: "20:20",
      arrival: "11:05+1",
      duration: "14h 45m",
      price: "₹1,180",
      features: ["AC 3 Tier", "Catering", "E-catering"],
      type: "Express"
    }
  ];

  const cabOptions = [
    {
      id: 1,
      name: "Sedan Car",
      type: "AC Sedan",
      duration: "22h 30m",
      price: "₹12,500",
      features: ["AC", "GPS tracking", "Verified driver"],
      service: "Ola/Uber"
    },
    {
      id: 2,
      name: "SUV",
      type: "AC SUV",
      duration: "22h 30m",
      price: "₹15,800",
      features: ["Spacious", "Premium", "Highway permit"],
      service: "Private"
    }
  ];

  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedTravelType, setSelectedTravelType] = useState<'flight' | 'train' | 'cab' | null>(null);
  const [selectedOption, setSelectedOption] = useState(null);

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
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Delhi to Hyderabad"
              value="Delhi to Hyderabad"
              className="pl-10 bg-white/95 backdrop-blur border-0 shadow-medium"
            />
          </div>
          
          {/* Date Selection */}
          <div className="flex gap-2">
            {activeTab === "stay" ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal bg-white/95 backdrop-blur border-0 shadow-medium"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, "MMM dd") : "Check-in"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal bg-white/95 backdrop-blur border-0 shadow-medium"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, "MMM dd") : "Check-out"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal bg-white/95 backdrop-blur border-0 shadow-medium"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "MMM dd") : "Departure"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
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
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-primary text-white"
                            onClick={() => {
                              // Get the cheapest price
                              const prices = Object.entries(stayComparisons[stay.id as keyof typeof stayComparisons] || {})
                                .filter(([platform]) => platform !== 'features')
                                .map(([, price]) => parseInt((price as string).replace(/[₹,]/g, '')));
                              const minPrice = Math.min(...prices);
                              const platform = Object.entries(stayComparisons[stay.id as keyof typeof stayComparisons] || {})
                                .find(([platform, price]) => platform !== 'features' && parseInt((price as string).replace(/[₹,]/g, '')) === minPrice)?.[0];
                              console.log(`Booking ${stay.name} on ${platform} for ₹${minPrice}`);
                            }}
                          >
                            Book ₹{Math.min(...Object.entries(stayComparisons[stay.id as keyof typeof stayComparisons] || {})
                              .filter(([platform]) => platform !== 'features')
                              .map(([, price]) => parseInt((price as string).replace(/[₹,]/g, ''))))}
                          </Button>
                          <Badge className="bg-primary/10 text-primary px-3 py-1">
                            Recommended
                          </Badge>
                        </div>
                     </div>
                   )}
                 </Card>
              ))}
            </div>
          </TabsContent>

          {/* Travel Tab */}
          <TabsContent value="transport" className="flex-1 overflow-y-auto p-6 pt-4">
            {/* Travel Type Selection */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button 
                variant={selectedTravelType === "flight" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setSelectedTravelType(selectedTravelType === "flight" ? null : "flight")}
                className="whitespace-nowrap"
              >
                <Plane className="w-4 h-4 mr-2" />
                Flight
              </Button>
              <Button 
                variant={selectedTravelType === "train" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setSelectedTravelType(selectedTravelType === "train" ? null : "train")}
                className="whitespace-nowrap"
              >
                <Train className="w-4 h-4 mr-2" />
                Train
              </Button>
              <Button 
                variant={selectedTravelType === "cab" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setSelectedTravelType(selectedTravelType === "cab" ? null : "cab")}
                className="whitespace-nowrap"
              >
                <Car className="w-4 h-4 mr-2" />
                Cab
              </Button>
            </div>
            
            {/* Flight Options */}
            {selectedTravelType === "flight" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Delhi to Hyderabad Flights</h3>
                {flightOptions.map((flight) => (
                  <Card key={flight.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">✈️</div>
                        <div>
                          <h4 className="font-semibold">{flight.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{flight.departure} → {flight.arrival}</span>
                            <span>{flight.duration}</span>
                            <Badge variant="outline" className="text-xs">{flight.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{flight.price}</div>
                        <Button size="sm" onClick={() => setSelectedOption(selectedOption === flight.id ? null : flight.id)}>
                          Compare
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {flight.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {selectedOption === flight.id && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <h5 className="font-semibold mb-3">Price Comparison</h5>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">MakeMyTrip</span>
                            <span className="text-sm font-bold text-primary">₹4,200</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">Goibibo</span>
                            <span className="text-sm font-bold text-primary">₹4,150</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">Cleartrip</span>
                            <span className="text-sm font-bold text-primary">₹4,300</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">Ixigo</span>
                            <span className="text-sm font-bold text-primary">₹4,180</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-gradient-primary text-white">
                            Book ₹4,150
                          </Button>
                          <Badge className="bg-primary/10 text-primary px-3 py-1">
                            Recommended
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            
            {/* Train Options */}
            {selectedTravelType === "train" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Delhi to Hyderabad Trains</h3>
                {trainOptions.map((train) => (
                  <Card key={train.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🚆</div>
                        <div>
                          <h4 className="font-semibold">{train.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{train.departure} → {train.arrival}</span>
                            <span>{train.duration}</span>
                            <Badge variant="outline" className="text-xs">{train.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{train.price}</div>
                        <Button size="sm" onClick={() => setSelectedOption(selectedOption === train.id + 100 ? null : train.id + 100)}>
                          Compare
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {train.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {selectedOption === train.id + 100 && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <h5 className="font-semibold mb-3">Price Comparison</h5>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">IRCTC</span>
                            <span className="text-sm font-bold text-primary">{train.price}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">MakeMyTrip</span>
                            <span className="text-sm font-bold text-primary">₹{parseInt(train.price.replace(/[₹,]/g, '')) + 30}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">Goibibo</span>
                            <span className="text-sm font-bold text-primary">₹{parseInt(train.price.replace(/[₹,]/g, '')) + 20}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">RedBus</span>
                            <span className="text-sm font-bold text-primary">₹{parseInt(train.price.replace(/[₹,]/g, '')) + 10}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-gradient-primary text-white">
                            Book {train.price}
                          </Button>
                          <Badge className="bg-primary/10 text-primary px-3 py-1">
                            Recommended
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            
            {/* Cab Options */}
            {selectedTravelType === "cab" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Delhi to Hyderabad Cabs</h3>
                {cabOptions.map((cab) => (
                  <Card key={cab.id} className="p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🚗</div>
                        <div>
                          <h4 className="font-semibold">{cab.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{cab.type}</span>
                            <span>{cab.duration}</span>
                            <Badge variant="outline" className="text-xs">{cab.service}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{cab.price}</div>
                        <Button size="sm" onClick={() => setSelectedOption(selectedOption === cab.id + 200 ? null : cab.id + 200)}>
                          Compare
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {cab.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {selectedOption === cab.id + 200 && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <h5 className="font-semibold mb-3">Price Comparison</h5>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">Ola</span>
                            <span className="text-sm font-bold text-primary">{cab.price}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">Uber</span>
                            <span className="text-sm font-bold text-primary">₹{parseInt(cab.price.replace(/[₹,]/g, '')) + 500}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">Rapido</span>
                            <span className="text-sm font-bold text-primary">₹{parseInt(cab.price.replace(/[₹,]/g, '')) - 300}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded">
                            <span className="text-sm font-medium">BlaBlaCar</span>
                            <span className="text-sm font-bold text-primary">₹{parseInt(cab.price.replace(/[₹,]/g, '')) - 800}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-gradient-primary text-white">
                            Book ₹{parseInt(cab.price.replace(/[₹,]/g, '')) - 800}
                          </Button>
                          <Badge className="bg-primary/10 text-primary px-3 py-1">
                            Recommended
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            
            {/* Default view when no travel type is selected */}
            {!selectedTravelType && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select a travel type to view available options from Delhi to Hyderabad</p>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default BookingsPage;
