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
  Star, 
  MapPin, 
  Search,
  Clock,
  Wifi,
  Coffee,
  CheckCircle,
  User,
  Calendar as CalendarIcon,
  Plane,
  Building2,
  Bed,
  Shield,
  Utensils,
  Zap,
  TrendingDown,
  ExternalLink,
  Sparkles,
  Award,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAISearch } from "@/hooks/useAISearch";
import AISearchResults from "@/components/AISearchResults";

interface BookingsPageProps {
  userData?: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean; currentCity?: string | null } | null;
  onNavigateToAccount?: () => void;
}

const BookingsPage: React.FC<BookingsPageProps> = ({ userData, onNavigateToAccount }) => {
  const [activeTab, setActiveTab] = useState("stay");
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [departureDate, setDepartureDate] = useState<Date>();
  const [origin, setOrigin] = useState(userData?.locationEnabled && userData?.currentCity ? userData.currentCity : "");
  const [destination, setDestination] = useState("");
  const [stayFilters, setStayFilters] = useState({
    type: "all",
    priceRange: "all",
    rating: "all"
  });

  const stayOptions = [
    {
      id: 1,
      name: "Hyderabad Backpackers Hub",
      location: "Banjara Hills, Hyderabad",
      price: "₹800/night",
      rating: 4.7,
      icon: Bed,
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
      icon: Building2,
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
      icon: Home,
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
  const [selectedTravelType, setSelectedTravelType] = useState<'all' | 'flight' | 'train' | 'cab' | null>('all');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [bookingDialog, setBookingDialog] = useState<{ open: boolean; data: any; type: 'stay' | 'travel' }>({ 
    open: false, 
    data: null, 
    type: 'stay' 
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Filter stays based on search
  const filteredStayOptions = stayOptions.filter(stay =>
    stay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stay.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stay.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter flights based on search
  const filteredFlightOptions = flightOptions.filter(flight =>
    flight.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flight.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter trains based on search
  const filteredTrainOptions = trainOptions.filter(train =>
    train.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter cabs based on search
  const filteredCabOptions = cabOptions.filter(cab =>
    cab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cab.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cab.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const platformIcons: Record<string, React.ReactNode> = {
    makemytrip: <span className="text-lg">🔵</span>,
    booking: <span className="text-lg">🔷</span>,
    goibibo: <span className="text-lg">🟢</span>,
    agoda: <span className="text-lg">🟣</span>,
    zolo: <span className="text-lg">🟡</span>,
    irctc: <span className="text-lg">🚆</span>,
    cleartrip: <span className="text-lg">✈️</span>,
    ixigo: <span className="text-lg">🎯</span>,
    redbus: <span className="text-lg">🚌</span>,
    ola: <span className="text-lg">🚕</span>,
    uber: <span className="text-lg">🚗</span>,
    rapido: <span className="text-lg">🏍️</span>,
    blablacar: <span className="text-lg">🤝</span>,
    abhibus: <span className="text-lg">🚐</span>
  };

  const stayComparisons = {
    1: {
      makemytrip: { price: "₹750/night", savings: "₹50" },
      booking: { price: "₹820/night", savings: "₹0" }, 
      goibibo: { price: "₹780/night", savings: "₹20" },
      agoda: { price: "₹800/night", savings: "₹0" },
      features: ["Solo female friendly", "24/7 security", "Common areas"]
    },
    2: {
      makemytrip: { price: "₹1,150/night", savings: "₹50" },
      booking: { price: "₹1,200/night", savings: "₹0" },
      goibibo: { price: "₹1,180/night", savings: "₹20" }, 
      zolo: { price: "₹1,100/night", savings: "₹100" },
      features: ["Co-working space", "Solo events", "Networking"]
    },
    3: {
      makemytrip: { price: "₹2,300/night", savings: "₹200" },
      booking: { price: "₹2,500/night", savings: "₹0" },
      goibibo: { price: "₹2,400/night", savings: "₹100" },
      agoda: { price: "₹2,450/night", savings: "₹50" }, 
      features: ["Heritage experience", "Solo dining", "Guided tours"]
    }
  };

  const getBestPrice = (comparison: Record<string, any>) => {
    let minPrice = Infinity;
    let bestPlatform = '';
    
    Object.entries(comparison).forEach(([platform, data]) => {
      if (platform === 'features') return;
      const priceNum = parseInt((data as any).price?.replace(/[₹,]/g, '') || '0');
      if (priceNum < minPrice) {
        minPrice = priceNum;
        bestPlatform = platform;
      }
    });
    
    return { minPrice, bestPlatform };
  };

  // AI Search hook
  const { results: aiResults, isLoading: aiLoading, error: aiError } = useAISearch(searchQuery, {
    pageContext: 'bookings'
  });

  // Check if we should show AI results
  const showAIStayResults = searchQuery.length >= 2 && filteredStayOptions.length === 0;
  const showAITravelResults = searchQuery.length >= 2 && 
    filteredFlightOptions.length === 0 && 
    filteredTrainOptions.length === 0 && 
    filteredCabOptions.length === 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-4 py-3 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Book Journey
            </h1>
            <p className="text-white/80 text-[10px] flex items-center gap-1">
              {activeTab === "stay" ? (
                <>Stays in {destination}</>
              ) : (
                <>{origin || "Select origin"} → {destination}</>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToAccount}
            className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs bg-white/95 backdrop-blur border-0 shadow-medium h-10 rounded-xl"
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
                      className="flex-1 justify-start text-left font-normal bg-white/95 backdrop-blur border-0 shadow-medium h-10 text-xs rounded-xl"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
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
                      className="flex-1 justify-start text-left font-normal bg-white/95 backdrop-blur border-0 shadow-medium h-10 text-xs rounded-xl"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
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
                    className="flex-1 justify-start text-left font-normal bg-white/95 backdrop-blur border-0 shadow-medium h-10 text-xs rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {departureDate ? format(departureDate, "MMM dd") : "Departure Date"}
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
        {/* Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">

          <TabsContent value="stay" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
            {/* Stay Filter Bar */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                <Badge 
                  variant={stayFilters.type === "all" ? "default" : "secondary"} 
                  className="gap-1 text-[10px] whitespace-nowrap py-1 px-2.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setStayFilters({...stayFilters, type: "all"})}
                >
                  <Home className="w-3 h-3" />
                  {stayFilters.type === "all" ? "All Types" : 
                   stayFilters.type === "hostel" ? "Hostels" :
                   stayFilters.type === "hotel" ? "Hotels" : "Co-living"}
                </Badge>
                <Badge 
                  variant={stayFilters.priceRange !== "all" ? "default" : "secondary"} 
                  className="gap-1 text-[10px] whitespace-nowrap py-1 px-2.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <TrendingDown className="w-3 h-3" />
                  {stayFilters.priceRange === "all" ? "Any Price" : stayFilters.priceRange}
                </Badge>
                <Badge 
                  variant={stayFilters.rating !== "all" ? "default" : "secondary"} 
                  className="gap-1 text-[10px] whitespace-nowrap py-1 px-2.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Star className="w-3 h-3" />
                  {stayFilters.rating === "all" ? "Any Rating" : `${stayFilters.rating}+`}
                </Badge>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3 flex-shrink-0 border-dashed">
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 rounded-xl bg-popover" align="end">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Filter Stays
                    </h4>
                    
                    {/* Type Filter */}
                    <div>
                      <label className="text-xs font-medium mb-2 block text-muted-foreground">Accommodation Type</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { key: "all", label: "All", icon: Home },
                          { key: "hostel", label: "Hostels", icon: Bed },
                          { key: "hotel", label: "Hotels", icon: Building2 },
                          { key: "coliving", label: "Co-living", icon: Building2 },
                        ].map(({ key, label, icon: Icon }) => (
                          <Button 
                            key={key}
                            variant={stayFilters.type === key ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setStayFilters({...stayFilters, type: key})}
                            className={cn(
                              "text-xs h-8 rounded-lg px-2 flex items-center gap-1.5 justify-start",
                              stayFilters.type === key && "bg-gradient-primary text-white border-0"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Price Filter */}
                    <div>
                      <label className="text-xs font-medium mb-2 block text-muted-foreground">Price Range</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { key: "all", label: "Any" },
                          { key: "budget", label: "Budget" },
                          { key: "mid", label: "Mid-range" },
                          { key: "premium", label: "Premium" },
                        ].map(({ key, label }) => (
                          <Button 
                            key={key}
                            variant={stayFilters.priceRange === key ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setStayFilters({...stayFilters, priceRange: key})}
                            className={cn(
                              "text-xs h-8 rounded-lg px-2",
                              stayFilters.priceRange === key && "bg-gradient-primary text-white border-0"
                            )}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Rating Filter */}
                    <div>
                      <label className="text-xs font-medium mb-2 block text-muted-foreground">Minimum Rating</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {["all", "4.5", "4.0", "3.5"].map((rating) => (
                          <Button 
                            key={rating}
                            variant={stayFilters.rating === rating ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setStayFilters({...stayFilters, rating})}
                            className={cn(
                              "text-xs h-8 rounded-lg px-2",
                              stayFilters.rating === rating && "bg-gradient-primary text-white border-0"
                            )}
                          >
                            {rating === "all" ? "Any" : `${rating}+`}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Reset */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStayFilters({ type: "all", priceRange: "all", rating: "all" })}
                      className="w-full text-xs h-9 rounded-lg"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-3">
              {filteredStayOptions.length > 0 ? filteredStayOptions.map((stay) => {
                const IconComponent = stay.icon;
                const comparison = stayComparisons[stay.id as keyof typeof stayComparisons];
                const { minPrice, bestPlatform } = getBestPrice(comparison || {});
                
                return (
                  <Card key={stay.id} className="p-3 shadow-soft hover:shadow-medium transition-all rounded-2xl border-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h3 className="font-semibold text-sm truncate">{stay.name}</h3>
                              {stay.verified && (
                                <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{stay.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] bg-warning/10 px-2 py-1 rounded-lg flex-shrink-0">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            <span className="font-semibold">{stay.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 my-2">
                          {stay.amenities.slice(0, 3).map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">
                              {amenity.includes("WiFi") && <Wifi className="w-2.5 h-2.5 mr-1" />}
                              {amenity.includes("Kitchen") && <Utensils className="w-2.5 h-2.5 mr-1" />}
                              {amenity.includes("security") && <Shield className="w-2.5 h-2.5 mr-1" />}
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="text-sm font-bold text-primary">{stay.price}</div>
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedStay(selectedStay === stay.id ? null : stay.id)}
                            className="text-xs h-8 rounded-xl px-4 bg-gradient-primary text-white"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {selectedStay === stay.id && comparison && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingDown className="w-4 h-4 text-success" />
                          <h4 className="font-semibold text-sm">Best Prices</h4>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {Object.entries(comparison).map(([platform, data]) => {
                            if (platform === 'features') return null;
                            const isBest = platform === bestPlatform;
                            return (
                              <div 
                                key={platform} 
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                  isBest ? "bg-success/10 border border-success/30" : "bg-background"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {platformIcons[platform] || <span>📦</span>}
                                  <span className="font-medium text-sm capitalize">{platform}</span>
                                  {isBest && (
                                    <Badge className="bg-success text-white text-[10px] py-0 px-1.5">
                                      <Award className="w-2.5 h-2.5 mr-0.5" />
                                      Best
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary text-sm">{(data as any).price}</div>
                                  {(data as any).savings !== "₹0" && (
                                    <div className="text-[10px] text-success">Save {(data as any).savings}</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-primary text-white h-10 rounded-xl text-sm"
                          onClick={() => setBookingDialog({ 
                            open: true, 
                            data: { stay, platform: bestPlatform, price: minPrice, comparison }, 
                            type: 'stay' 
                          })}
                        >
                          Book via {bestPlatform} • ₹{minPrice}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              }) : showAIStayResults ? (
                <AISearchResults
                  results={aiResults}
                  isLoading={aiLoading}
                  error={aiError}
                  searchQuery={searchQuery}
                  showDestinations={false}
                  showStays={true}
                  showTravel={true}
                />
              ) : searchQuery ? (
                <Card className="p-6 text-center">
                  <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No stays found for "{searchQuery}"</p>
                </Card>
              ) : null}
            </div>
          </TabsContent>

          {/* Travel Tab */}
          <TabsContent value="transport" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
            {/* Travel Type Selection */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {[
                { key: "all", label: "All", icon: Sparkles },
                { key: "flight", label: "Flight", icon: Plane },
                { key: "train", label: "Train", icon: Train },
                { key: "cab", label: "Cab", icon: Car },
              ].map(({ key, label, icon: Icon }) => (
                <Button 
                  key={key}
                  variant={selectedTravelType === key ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedTravelType(selectedTravelType === key ? null : key as any)}
                  className="whitespace-nowrap text-xs h-9 rounded-xl px-3 flex items-center gap-1.5"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              ))}
            </div>
            
            {!selectedTravelType && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base mb-1">Select Transport Type</h3>
                <p className="text-xs text-muted-foreground">Choose between all, flight, train or cab</p>
              </div>
            )}
            
            {/* All Options */}
            {selectedTravelType === "all" && (
              <div className="space-y-4">
                {/* Flights Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Flights</h3>
                  </div>
                  {filteredFlightOptions.map((flight) => (
                    <Card key={`all-flight-${flight.id}`} className="p-3 shadow-soft rounded-2xl border-0">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Plane className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h4 className="font-semibold text-sm">{flight.name}</h4>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{flight.departure} → {flight.arrival}</span>
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 rounded-lg">{flight.duration}</Badge>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">{flight.type}</Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 my-2">
                            {flight.features.slice(0, 2).map((feature) => (
                              <Badge key={feature} variant="outline" className="text-[10px] py-0.5 px-2 rounded-lg">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="text-sm font-bold text-primary">{flight.price}</div>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedOption(selectedOption === flight.id ? null : flight.id)}
                              className="text-xs h-8 rounded-xl px-4 bg-gradient-primary text-white"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Compare
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {selectedOption === flight.id && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="w-4 h-4 text-success" />
                            <h5 className="font-semibold text-sm">Platform Comparison</h5>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            {[
                              { name: "goibibo", price: "₹4,150", savings: "₹50", best: true },
                              { name: "ixigo", price: "₹4,180", savings: "₹20", best: false },
                              { name: "makemytrip", price: "₹4,200", savings: "₹0", best: false },
                              { name: "cleartrip", price: "₹4,300", savings: "₹0", best: false },
                            ].map((platform) => (
                              <div 
                                key={platform.name} 
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                  platform.best ? "bg-success/10 border border-success/30" : "bg-background"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {platformIcons[platform.name]}
                                  <span className="font-medium text-sm capitalize">{platform.name}</span>
                                  {platform.best && (
                                    <Badge className="bg-success text-white text-[10px] py-0 px-1.5">
                                      <Award className="w-2.5 h-2.5 mr-0.5" />
                                      Best
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary text-sm">{platform.price}</div>
                                  {platform.savings !== "₹0" && (
                                    <div className="text-[10px] text-success">Save {platform.savings}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-primary text-white h-10 rounded-xl text-sm"
                            onClick={() => setBookingDialog({ 
                              open: true, 
                              data: { flight, platform: 'Goibibo', price: 4150 }, 
                              type: 'travel' 
                            })}
                          >
                            Book via Goibibo • ₹4,150
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                  {filteredFlightOptions.length === 0 && searchQuery && (
                    <Card className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">No flights found for "{searchQuery}"</p>
                    </Card>
                  )}
                </div>
                
                {/* Trains Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Trains</h3>
                  </div>
                  {filteredTrainOptions.map((train) => (
                    <Card key={`all-train-${train.id}`} className="p-3 shadow-soft rounded-2xl border-0">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Train className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h4 className="font-semibold text-sm">{train.name}</h4>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{train.departure} → {train.arrival}</span>
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 rounded-lg">{train.duration}</Badge>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">{train.type}</Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 my-2">
                            {train.features.slice(0, 2).map((feature) => (
                              <Badge key={feature} variant="outline" className="text-[10px] py-0.5 px-2 rounded-lg">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="text-sm font-bold text-primary">{train.price}</div>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedOption(selectedOption === train.id + 100 ? null : train.id + 100)}
                              className="text-xs h-8 rounded-xl px-4 bg-gradient-primary text-white"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Compare
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {selectedOption === train.id + 100 && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="w-4 h-4 text-success" />
                            <h5 className="font-semibold text-sm">Platform Comparison</h5>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            {[
                              { name: "irctc", price: train.price, savings: "₹0", best: true },
                              { name: "ixigo", price: `₹${parseInt(train.price.replace(/[₹,]/g, '')) + 50}`, savings: "₹0", best: false },
                              { name: "makemytrip", price: `₹${parseInt(train.price.replace(/[₹,]/g, '')) + 80}`, savings: "₹0", best: false },
                            ].map((platform) => (
                              <div 
                                key={platform.name} 
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                  platform.best ? "bg-success/10 border border-success/30" : "bg-background"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {platformIcons[platform.name]}
                                  <span className="font-medium text-sm capitalize">{platform.name}</span>
                                  {platform.best && (
                                    <Badge className="bg-success text-white text-[10px] py-0 px-1.5">
                                      <Award className="w-2.5 h-2.5 mr-0.5" />
                                      Best
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary text-sm">{platform.price}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-primary text-white h-10 rounded-xl text-sm"
                            onClick={() => setBookingDialog({ 
                              open: true, 
                              data: { train, platform: 'IRCTC', price: train.price }, 
                              type: 'travel' 
                            })}
                          >
                            Book via IRCTC • {train.price}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                  {filteredTrainOptions.length === 0 && searchQuery && (
                    <Card className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">No trains found for "{searchQuery}"</p>
                    </Card>
                  )}
                </div>
                
                {/* Cabs Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Cabs</h3>
                  </div>
                  {filteredCabOptions.map((cab) => (
                    <Card key={`all-cab-${cab.id}`} className="p-3 shadow-soft rounded-2xl border-0">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Car className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h4 className="font-semibold text-sm">{cab.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{cab.duration}</span>
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5">{cab.type}</Badge>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">{cab.service}</Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 my-2">
                            {cab.features.slice(0, 2).map((feature) => (
                              <Badge key={feature} variant="outline" className="text-[10px] py-0.5 px-2 rounded-lg">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="text-sm font-bold text-primary">{cab.price}</div>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedOption(selectedOption === cab.id + 200 ? null : cab.id + 200)}
                              className="text-xs h-8 rounded-xl px-4 bg-gradient-primary text-white"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Compare
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {selectedOption === cab.id + 200 && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="w-4 h-4 text-success" />
                            <h5 className="font-semibold text-sm">Platform Comparison</h5>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            {[
                              { name: "ola", price: cab.price, savings: "₹500", best: true },
                              { name: "uber", price: `₹${parseInt(cab.price.replace(/[₹,]/g, '')) + 300}`, savings: "₹200", best: false },
                              { name: "rapido", price: `₹${parseInt(cab.price.replace(/[₹,]/g, '')) + 500}`, savings: "₹0", best: false },
                            ].map((platform) => (
                              <div 
                                key={platform.name} 
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                  platform.best ? "bg-success/10 border border-success/30" : "bg-background"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {platformIcons[platform.name]}
                                  <span className="font-medium text-sm capitalize">{platform.name}</span>
                                  {platform.best && (
                                    <Badge className="bg-success text-white text-[10px] py-0 px-1.5">
                                      <Award className="w-2.5 h-2.5 mr-0.5" />
                                      Best
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary text-sm">{platform.price}</div>
                                  {platform.savings !== "₹0" && (
                                    <div className="text-[10px] text-success">Save {platform.savings}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-primary text-white h-10 rounded-xl text-sm"
                            onClick={() => setBookingDialog({ 
                              open: true, 
                              data: { cab, platform: 'Ola', price: cab.price }, 
                              type: 'travel' 
                            })}
                          >
                            Book via Ola • {cab.price}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                  {filteredCabOptions.length === 0 && searchQuery && (
                    <Card className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">No cabs found for "{searchQuery}"</p>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Flight Options */}
            {selectedTravelType === "flight" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Plane className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Delhi → Hyderabad</h3>
                </div>
                
                {filteredFlightOptions.map((flight) => (
                  <Card key={flight.id} className="p-3 shadow-soft rounded-2xl border-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Plane className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h4 className="font-semibold text-sm">{flight.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{flight.departure} → {flight.arrival}</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">{flight.duration}</Badge>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{flight.type}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 my-2">
                          {flight.features.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-[10px] py-0.5 px-2 rounded-lg">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="text-sm font-bold text-primary">{flight.price}</div>
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedOption(selectedOption === flight.id ? null : flight.id)}
                            className="text-xs h-8 rounded-xl px-4 bg-gradient-primary text-white"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {selectedOption === flight.id && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingDown className="w-4 h-4 text-success" />
                          <h5 className="font-semibold text-sm">Platform Comparison</h5>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {[
                            { name: "goibibo", price: "₹4,150", savings: "₹50", best: true },
                            { name: "ixigo", price: "₹4,180", savings: "₹20", best: false },
                            { name: "makemytrip", price: "₹4,200", savings: "₹0", best: false },
                            { name: "cleartrip", price: "₹4,300", savings: "₹0", best: false },
                          ].map((platform) => (
                            <div 
                              key={platform.name} 
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                platform.best ? "bg-success/10 border border-success/30" : "bg-background"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {platformIcons[platform.name]}
                                <span className="font-medium text-sm capitalize">{platform.name}</span>
                                {platform.best && (
                                  <Badge className="bg-success text-white text-[10px] py-0 px-1.5">
                                    <Award className="w-2.5 h-2.5 mr-0.5" />
                                    Best
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary text-sm">{platform.price}</div>
                                {platform.savings !== "₹0" && (
                                  <div className="text-[10px] text-success">Save {platform.savings}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-primary text-white h-10 rounded-xl text-sm"
                          onClick={() => setBookingDialog({ 
                            open: true, 
                            data: { flight, platform: 'Goibibo', price: 4150 }, 
                            type: 'travel' 
                          })}
                        >
                          Book via Goibibo • ₹4,150
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
                {filteredFlightOptions.length === 0 && searchQuery && (
                  <Card className="p-6 text-center">
                    <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No flights found for "{searchQuery}"</p>
                    <p className="text-xs text-muted-foreground mt-1">Try searching for "IndiGo", "Air India", or "Vistara"</p>
                  </Card>
                )}
              </div>
            )}
            
            {/* Train Options */}
            {selectedTravelType === "train" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Train className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Delhi → Hyderabad</h3>
                </div>
                
                {filteredTrainOptions.map((train) => (
                  <Card key={train.id} className="p-3 shadow-soft rounded-2xl border-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Train className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h4 className="font-semibold text-sm">{train.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{train.departure} → {train.arrival}</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">{train.duration}</Badge>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{train.type}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 my-2">
                          {train.features.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-[10px] py-0.5 px-2 rounded-lg">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="text-sm font-bold text-primary">{train.price}</div>
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedOption(selectedOption === train.id + 100 ? null : train.id + 100)}
                            className="text-xs h-8 rounded-xl px-4 bg-gradient-primary text-white"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {selectedOption === train.id + 100 && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingDown className="w-4 h-4 text-success" />
                          <h5 className="font-semibold text-sm">Platform Comparison</h5>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {[
                            { name: "irctc", price: train.price, savings: "₹30", best: true },
                            { name: "redbus", price: `₹${parseInt(train.price.replace(/[₹,]/g, '')) + 10}`, savings: "₹20", best: false },
                            { name: "goibibo", price: `₹${parseInt(train.price.replace(/[₹,]/g, '')) + 20}`, savings: "₹10", best: false },
                            { name: "makemytrip", price: `₹${parseInt(train.price.replace(/[₹,]/g, '')) + 30}`, savings: "₹0", best: false },
                          ].map((platform) => (
                            <div 
                              key={platform.name} 
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                platform.best ? "bg-success/10 border border-success/30" : "bg-background"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {platformIcons[platform.name]}
                                <span className="font-medium text-sm capitalize">{platform.name}</span>
                                {platform.best && (
                                  <Badge className="bg-success text-white text-[10px] py-0 px-1.5">
                                    <Award className="w-2.5 h-2.5 mr-0.5" />
                                    Best
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary text-sm">{platform.price}</div>
                                {platform.savings !== "₹0" && (
                                  <div className="text-[10px] text-success">Save {platform.savings}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-primary text-white h-10 rounded-xl text-sm"
                          onClick={() => setBookingDialog({ 
                            open: true, 
                            data: { train, platform: 'IRCTC', price: parseInt(train.price.replace(/[₹,]/g, '')) }, 
                            type: 'travel' 
                          })}
                        >
                          Book via IRCTC • {train.price}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
                {filteredTrainOptions.length === 0 && searchQuery && (
                  <Card className="p-6 text-center">
                    <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No trains found for "{searchQuery}"</p>
                    <p className="text-xs text-muted-foreground mt-1">Try searching for "Rajdhani", "Express", or "AC"</p>
                  </Card>
                )}
              </div>
            )}
            
            {/* Cab Options */}
            {selectedTravelType === "cab" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Delhi → Hyderabad</h3>
                </div>
                
                {filteredCabOptions.map((cab) => (
                  <Card key={cab.id} className="p-3 shadow-soft rounded-2xl border-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h4 className="font-semibold text-sm">{cab.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{cab.type}</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">{cab.duration}</Badge>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{cab.service}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 my-2">
                          {cab.features.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-[10px] py-0.5 px-2 rounded-lg">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="text-sm font-bold text-primary">{cab.price}</div>
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedOption(selectedOption === cab.id + 200 ? null : cab.id + 200)}
                            className="text-xs h-8 rounded-xl px-4 bg-gradient-primary text-white"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {selectedOption === cab.id + 200 && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingDown className="w-4 h-4 text-success" />
                          <h5 className="font-semibold text-sm">Platform Comparison</h5>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {[
                            { name: "ola", price: cab.price, savings: "₹500", best: true },
                            { name: "uber", price: `₹${parseInt(cab.price.replace(/[₹,]/g, '')) + 300}`, savings: "₹200", best: false },
                            { name: "rapido", price: `₹${parseInt(cab.price.replace(/[₹,]/g, '')) + 500}`, savings: "₹0", best: false },
                          ].map((platform) => (
                            <div 
                              key={platform.name} 
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                platform.best ? "bg-success/10 border border-success/30" : "bg-background"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {platformIcons[platform.name]}
                                <span className="font-medium text-sm capitalize">{platform.name}</span>
                                {platform.best && (
                                  <Badge className="bg-success text-white text-[10px] py-0 px-1.5">
                                    <Award className="w-2.5 h-2.5 mr-0.5" />
                                    Best
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary text-sm">{platform.price}</div>
                                {platform.savings !== "₹0" && (
                                  <div className="text-[10px] text-success">Save {platform.savings}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-primary text-white h-10 rounded-xl text-sm"
                          onClick={() => setBookingDialog({ 
                            open: true, 
                            data: { cab, platform: 'Ola', price: parseInt(cab.price.replace(/[₹,]/g, '')) }, 
                            type: 'travel' 
                          })}
                        >
                          Book via Ola • {cab.price}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
                {filteredCabOptions.length === 0 && searchQuery && (
                  <Card className="p-6 text-center">
                    <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No cabs found for "{searchQuery}"</p>
                    <p className="text-xs text-muted-foreground mt-1">Try searching for "Sedan", "SUV", or "Ola"</p>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog.open} onOpenChange={(open) => setBookingDialog({ ...bookingDialog, open })}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-hero p-4 text-white">
            <DialogHeader className="text-left">
              <DialogTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Confirm Booking
              </DialogTitle>
              <DialogDescription className="text-white/80 text-sm">
                You're booking the best available deal
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-4 space-y-4">
            {bookingDialog.data && (
              <>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      {bookingDialog.type === 'stay' ? (
                        <Bed className="w-6 h-6 text-primary" />
                      ) : (
                        <Plane className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {bookingDialog.data.stay?.name || 
                         bookingDialog.data.flight?.name || 
                         bookingDialog.data.train?.name || 
                         bookingDialog.data.cab?.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        via {bookingDialog.data.platform}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">₹{bookingDialog.data.price}</div>
                      <Badge className="bg-success/10 text-success text-[10px]">
                        Best Deal
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-success/5 rounded-xl border border-success/20">
                  <Shield className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-xs font-medium">Solo Traveler Verified</p>
                    <p className="text-[10px] text-muted-foreground">Safety certified booking</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-primary text-white h-12 rounded-xl text-sm font-semibold"
                  onClick={() => {
                    setBookingDialog({ open: false, data: null, type: 'stay' });
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Continue to {bookingDialog.data.platform}
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground">
                  You'll be redirected to complete your booking securely
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPage;
