import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

  const [selectedStay, setSelectedStay] = useState<number | null>(null);
  const [selectedTravelType, setSelectedTravelType] = useState<'flight' | 'train' | 'cab' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [bookingDialog, setBookingDialog] = useState<{ open: boolean; data: any; type: 'stay' | 'travel' }>({ 
    open: false, 
    data: null, 
    type: 'stay' 
  });

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
      <div className="bg-gradient-hero p-4 sm:p-6 pb-6 sm:pb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Book Your Journey</h1>
            <p className="text-white/80 text-xs sm:text-sm">Safe accommodations & transport for solo travelers</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToAccount}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary/90 text-foreground hover:bg-secondary border-secondary"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="space-y-2 sm:space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input 
              placeholder="Delhi to Hyderabad"
              value="Delhi to Hyderabad"
              className="pl-9 sm:pl-10 text-sm bg-white/95 backdrop-blur border-0 shadow-medium h-9 sm:h-10"
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
                      className="flex-1 justify-start text-left font-normal bg-white/95 backdrop-blur border-0 shadow-medium h-9 sm:h-10 text-xs sm:text-sm"
                    >
                      <CalendarIcon className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                      className="flex-1 justify-start text-left font-normal bg-white/95 backdrop-blur border-0 shadow-medium h-9 sm:h-10 text-xs sm:text-sm"
                    >
                      <CalendarIcon className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                    className="flex-1 justify-start text-left font-normal bg-white/95 backdrop-blur border-0 shadow-medium h-9 sm:h-10 text-xs sm:text-sm"
                  >
                    <CalendarIcon className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          <TabsList className="grid w-full grid-cols-2 mx-4 sm:mx-6 mt-4">
            <TabsTrigger value="stay" className="text-xs sm:text-sm">Stay</TabsTrigger>
            <TabsTrigger value="transport" className="text-xs sm:text-sm">Travel</TabsTrigger>
          </TabsList>

          {/* Stay Tab */}
          <TabsContent value="stay" className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4">
            {/* Stay Filters */}
            <div className="flex gap-1.5 sm:gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              <Button 
                variant={stayFilters.type === "all" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, type: "all"})}
                className="whitespace-nowrap text-xs h-8"
              >
                All Types
              </Button>
              <Button 
                variant={stayFilters.type === "hostel" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, type: "hostel"})}
                className="whitespace-nowrap text-xs h-8"
              >
                Hostels
              </Button>
              <Button 
                variant={stayFilters.type === "hotel" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, type: "hotel"})}
                className="whitespace-nowrap text-xs h-8"
              >
                Hotels
              </Button>
              <Button 
                variant={stayFilters.type === "coliving" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, type: "coliving"})}
                className="whitespace-nowrap text-xs h-8"
              >
                Co-living
              </Button>
              <Button 
                variant={stayFilters.priceRange === "budget" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, priceRange: "budget"})}
                className="whitespace-nowrap text-xs h-8"
              >
                Budget
              </Button>
              <Button 
                variant={stayFilters.rating === "4+" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStayFilters({...stayFilters, rating: "4+"})}
                className="whitespace-nowrap text-xs h-8"
              >
                4+ Rating
              </Button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {stayOptions.map((stay) => (
                <Card key={stay.id} className="p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1">
                      <div className="text-2xl sm:text-3xl mt-1">{stay.image}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm sm:text-base">{stay.name}</h3>
                          {stay.verified && (
                            <Badge className="bg-success text-success-foreground text-[10px] sm:text-xs py-0 px-1.5">
                              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{stay.location}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            <span className="text-xs">{stay.rating}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize">
                            {stay.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:text-right items-center sm:items-end">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedStay(selectedStay === stay.id ? null : stay.id)}
                        className="text-xs h-8 px-3"
                      >
                        Compare
                      </Button>
                    </div>
                  </div>
                  
                   <div className="flex flex-wrap gap-1.5">
                     {stay.amenities.map((amenity) => (
                       <Badge key={amenity} variant="outline" className="text-[10px] sm:text-xs py-0.5 px-2">
                         {amenity.includes("WiFi") && <Wifi className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />}
                         {amenity.includes("Kitchen") && <Coffee className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />}
                         {amenity}
                       </Badge>
                     ))}
                   </div>
                   
                   {selectedStay === stay.id && (
                     <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                       <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Price Comparison</h4>
                       <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
                         {Object.entries(stayComparisons[stay.id as keyof typeof stayComparisons] || {}).map(([platform, price]) => {
                           if (platform === 'features') return null;
                           return (
                             <div key={platform} className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                               <span className="font-medium capitalize truncate">{platform}</span>
                               <span className="font-bold text-primary whitespace-nowrap ml-2">{price as string}</span>
                             </div>
                           );
                         })}
                       </div>
                       <div className="mb-3">
                         <p className="text-xs sm:text-sm font-medium mb-2">Solo Traveler Features:</p>
                         <div className="flex flex-wrap gap-1">
                           {stayComparisons[stay.id as keyof typeof stayComparisons]?.features?.map((feature) => (
                             <Badge key={feature} variant="secondary" className="text-[10px] sm:text-xs">
                               {feature}
                             </Badge>
                           ))}
                         </div>
                       </div>
                        <div className="flex gap-2 items-center">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-primary text-white text-xs sm:text-sm h-8 sm:h-9"
                            onClick={() => {
                              const prices = Object.entries(stayComparisons[stay.id as keyof typeof stayComparisons] || {})
                                .filter(([platform]) => platform !== 'features')
                                .map(([, price]) => parseInt((price as string).replace(/[₹,]/g, '')));
                              const minPrice = Math.min(...prices);
                              const platform = Object.entries(stayComparisons[stay.id as keyof typeof stayComparisons] || {})
                                .find(([platform, price]) => platform !== 'features' && parseInt((price as string).replace(/[₹,]/g, '')) === minPrice)?.[0];
                              setBookingDialog({ 
                                open: true, 
                                data: { stay, platform, price: minPrice, comparison: stayComparisons[stay.id as keyof typeof stayComparisons] }, 
                                type: 'stay' 
                              });
                            }}
                          >
                            Book ₹{Math.min(...Object.entries(stayComparisons[stay.id as keyof typeof stayComparisons] || {})
                              .filter(([platform]) => platform !== 'features')
                              .map(([, price]) => parseInt((price as string).replace(/[₹,]/g, ''))))}
                          </Button>
                          <Badge className="bg-primary/10 text-primary px-2 sm:px-3 py-1 text-[10px] sm:text-xs whitespace-nowrap">
                            Best
                          </Badge>
                        </div>
                     </div>
                   )}
                 </Card>
              ))}
            </div>
          </TabsContent>

          {/* Travel Tab */}
          <TabsContent value="transport" className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4">
            {/* Travel Type Selection */}
            <div className="flex gap-1.5 sm:gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              <Button 
                variant={selectedTravelType === "flight" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setSelectedTravelType(selectedTravelType === "flight" ? null : "flight")}
                className="whitespace-nowrap text-xs h-8"
              >
                <Plane className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Flight
              </Button>
              <Button 
                variant={selectedTravelType === "train" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setSelectedTravelType(selectedTravelType === "train" ? null : "train")}
                className="whitespace-nowrap text-xs h-8"
              >
                <Train className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Train
              </Button>
              <Button 
                variant={selectedTravelType === "cab" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setSelectedTravelType(selectedTravelType === "cab" ? null : "cab")}
                className="whitespace-nowrap text-xs h-8"
              >
                <Car className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Cab
              </Button>
            </div>
            
            {/* Flight Options */}
            {selectedTravelType === "flight" && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Delhi to Hyderabad Flights</h3>
                {flightOptions.map((flight) => (
                  <Card key={flight.id} className="p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <div className="text-xl sm:text-2xl mt-0.5">✈️</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base">{flight.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                            <span className="whitespace-nowrap">{flight.departure} → {flight.arrival}</span>
                            <span className="whitespace-nowrap">{flight.duration}</span>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">{flight.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:text-right gap-2">
                        <div className="text-base sm:text-lg font-bold text-primary">{flight.price}</div>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedOption(selectedOption === flight.id ? null : flight.id)}
                          className="text-xs h-8 px-3"
                        >
                          Compare
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {flight.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-[10px] sm:text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {selectedOption === flight.id && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <h5 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Price Comparison</h5>
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">MakeMyTrip</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹4,200</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">Goibibo</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹4,150</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">Cleartrip</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹4,300</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">Ixigo</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹4,180</span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-primary text-white text-xs sm:text-sm h-8 sm:h-9"
                            onClick={() => setBookingDialog({ 
                              open: true, 
                              data: { flight, platform: 'Goibibo', price: 4150, options: { makemytrip: 4200, goibibo: 4150, cleartrip: 4300, ixigo: 4180 } }, 
                              type: 'travel' 
                            })}
                          >
                            Book ₹4,150
                          </Button>
                          <Badge className="bg-primary/10 text-primary px-2 sm:px-3 py-1 text-[10px] sm:text-xs whitespace-nowrap">
                            Best
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
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Delhi to Hyderabad Trains</h3>
                {trainOptions.map((train) => (
                  <Card key={train.id} className="p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <div className="text-xl sm:text-2xl mt-0.5">🚆</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base">{train.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                            <span className="whitespace-nowrap">{train.departure} → {train.arrival}</span>
                            <span className="whitespace-nowrap">{train.duration}</span>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">{train.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:text-right gap-2">
                        <div className="text-base sm:text-lg font-bold text-primary">{train.price}</div>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedOption(selectedOption === train.id + 100 ? null : train.id + 100)}
                          className="text-xs h-8 px-3"
                        >
                          Compare
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {train.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-[10px] sm:text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {selectedOption === train.id + 100 && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <h5 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Price Comparison</h5>
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">IRCTC</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">{train.price}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">MakeMyTrip</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹{parseInt(train.price.replace(/[₹,]/g, '')) + 30}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">Goibibo</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹{parseInt(train.price.replace(/[₹,]/g, '')) + 20}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">RedBus</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹{parseInt(train.price.replace(/[₹,]/g, '')) + 10}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-primary text-white text-xs sm:text-sm h-8 sm:h-9"
                            onClick={() => {
                              const basePrice = parseInt(train.price.replace(/[₹,]/g, ''));
                              setBookingDialog({ 
                                open: true, 
                                data: { 
                                  train, 
                                  platform: 'IRCTC', 
                                  price: basePrice,
                                  options: { irctc: basePrice, makemytrip: basePrice + 30, goibibo: basePrice + 20, redbus: basePrice + 10 }
                                }, 
                                type: 'travel' 
                              });
                            }}
                          >
                            Book {train.price}
                          </Button>
                          <Badge className="bg-primary/10 text-primary px-2 sm:px-3 py-1 text-[10px] sm:text-xs whitespace-nowrap">
                            Best
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
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Delhi to Hyderabad Cabs</h3>
                {cabOptions.map((cab) => (
                  <Card key={cab.id} className="p-3 sm:p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <div className="text-xl sm:text-2xl mt-0.5">🚗</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base">{cab.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                            <span className="whitespace-nowrap">{cab.type}</span>
                            <span className="whitespace-nowrap">{cab.duration}</span>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">{cab.service}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:text-right gap-2">
                        <div className="text-base sm:text-lg font-bold text-primary">{cab.price}</div>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedOption(selectedOption === cab.id + 200 ? null : cab.id + 200)}
                          className="text-xs h-8 px-3"
                        >
                          Compare
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {cab.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-[10px] sm:text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {selectedOption === cab.id + 200 && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <h5 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Price Comparison</h5>
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">Ola</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">{cab.price}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">Uber</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹{parseInt(cab.price.replace(/[₹,]/g, '')) + 500}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">Rapido</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹{parseInt(cab.price.replace(/[₹,]/g, '')) - 300}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-background rounded text-xs sm:text-sm">
                            <span className="font-medium truncate">BlaBlaCar</span>
                            <span className="font-bold text-primary whitespace-nowrap ml-2">₹{parseInt(cab.price.replace(/[₹,]/g, '')) - 800}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-primary text-white text-xs sm:text-sm h-8 sm:h-9"
                            onClick={() => {
                              const basePrice = parseInt(cab.price.replace(/[₹,]/g, ''));
                              setBookingDialog({ 
                                open: true, 
                                data: { 
                                  cab, 
                                  platform: 'BlaBlaCar', 
                                  price: basePrice - 800,
                                  options: { ola: basePrice, uber: basePrice + 500, rapido: basePrice - 300, blablacar: basePrice - 800 }
                                }, 
                                type: 'travel' 
                              });
                            }}
                          >
                            Book ₹{parseInt(cab.price.replace(/[₹,]/g, '')) - 800}
                          </Button>
                          <Badge className="bg-primary/10 text-primary px-2 sm:px-3 py-1 text-[10px] sm:text-xs whitespace-nowrap">
                            Best
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
              <div className="text-center py-8 px-4">
                <p className="text-muted-foreground text-sm">Select a travel type to view available options from Delhi to Hyderabad</p>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog.open} onOpenChange={(open) => setBookingDialog({ ...bookingDialog, open })}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Complete Your Booking</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Review the best price and choose your preferred platform
            </DialogDescription>
          </DialogHeader>
          
          {bookingDialog.data && (
            <div className="space-y-4">
              {/* Item Details */}
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm sm:text-base mb-2">
                  {bookingDialog.type === 'stay' 
                    ? bookingDialog.data.stay?.name 
                    : bookingDialog.data.flight?.name || bookingDialog.data.train?.name || bookingDialog.data.cab?.name}
                </h4>
                {bookingDialog.type === 'stay' && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {bookingDialog.data.stay?.location}
                  </p>
                )}
              </div>

              {/* Best Price */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Best Price on</p>
                  <p className="font-semibold text-sm sm:text-base capitalize">{bookingDialog.data.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold text-primary">₹{bookingDialog.data.price}</p>
                  <Badge className="bg-primary/10 text-primary text-[10px] sm:text-xs mt-1">
                    Best Deal
                  </Badge>
                </div>
              </div>

              {/* All Platform Options */}
              <div>
                <p className="text-xs sm:text-sm font-medium mb-2">All Platform Prices:</p>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {Object.entries(bookingDialog.data.comparison || bookingDialog.data.options || {}).map(([platform, price]: [string, any]) => {
                    if (platform === 'features') return null;
                    const numPrice = typeof price === 'number' ? price : parseInt((price as string).replace(/[₹,]/g, ''));
                    return (
                      <div 
                        key={platform} 
                        className={cn(
                          "flex justify-between items-center p-2 rounded text-xs sm:text-sm",
                          numPrice === bookingDialog.data.price 
                            ? "bg-primary/10 border border-primary/30" 
                            : "bg-muted"
                        )}
                      >
                        <span className="font-medium capitalize truncate">{platform}</span>
                        <span className="font-bold whitespace-nowrap ml-2">
                          {typeof price === 'number' ? `₹${price}` : price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setBookingDialog({ ...bookingDialog, open: false })}
                  className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-gradient-primary text-white text-xs sm:text-sm h-9 sm:h-10"
                  onClick={() => {
                    console.log('Proceeding to booking on', bookingDialog.data.platform);
                    setBookingDialog({ ...bookingDialog, open: false });
                  }}
                >
                  Proceed to Book
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPage;
