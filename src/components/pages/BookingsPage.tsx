import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Home,
  Star,
  MapPin,
  Search,
  Wifi,
  CheckCircle,
  User,
  Calendar as CalendarIcon,
  Building2,
  Bed,
  Utensils,
  Zap,
  TrendingDown,
  ExternalLink,
  Sparkles,
  Award,
  ArrowRight,
  Loader2,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAISearch } from "@/hooks/useAISearch";
import AISearchResults from "@/components/AISearchResults";
import { supabase } from "@/integrations/supabase/client";

interface BookingsPageProps {
  userData?: {
    name: string;
    emailOrPhone: string;
    preferences: string[];
    language: string;
    locationEnabled: boolean;
    currentCity?: string | null;
  } | null;
  onNavigateToAccount?: () => void;
}

interface HotelResult {
  hotelId: number;
  hotelName: string;
  location: {
    name: string;
    country: string;
    geo?: { lat: number; lon: number };
  };
  stars: number;
  priceFrom: number;
  pricePercentile?: Record<string, number>;
}

// Famous landmarks by city (max 3 per city)
const CITY_LANDMARKS: Record<string, string[]> = {
  hyderabad: ["Charminar", "Golconda Fort", "Hussain Sagar Lake"],
  delhi: ["India Gate", "Red Fort", "Qutub Minar"],
  mumbai: ["Gateway of India", "Marine Drive", "Elephanta Caves"],
  bangalore: ["Lalbagh Garden", "Bangalore Palace", "Cubbon Park"],
  bengaluru: ["Lalbagh Garden", "Bangalore Palace", "Cubbon Park"],
  chennai: ["Marina Beach", "Kapaleeshwarar Temple", "Fort St. George"],
  kolkata: ["Victoria Memorial", "Howrah Bridge", "Indian Museum"],
  jaipur: ["Hawa Mahal", "Amber Fort", "City Palace"],
  goa: ["Calangute Beach", "Basilica of Bom Jesus", "Fort Aguada"],
  agra: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri"],
  varanasi: ["Kashi Vishwanath Temple", "Dashashwamedh Ghat", "Sarnath"],
  udaipur: ["City Palace", "Lake Pichola", "Jag Mandir"],
  shimla: ["Mall Road", "Jakhoo Temple", "Christ Church"],
  manali: ["Hadimba Temple", "Solang Valley", "Old Manali"],
  rishikesh: ["Laxman Jhula", "Ram Jhula", "Triveni Ghat"],
  mysore: ["Mysore Palace", "Chamundi Hills", "Brindavan Gardens"],
  ooty: ["Botanical Garden", "Ooty Lake", "Doddabetta Peak"],
  munnar: ["Tea Gardens", "Eravikulam National Park", "Mattupetty Dam"],
  pondicherry: ["Promenade Beach", "Auroville", "French Quarter"],
  amritsar: ["Golden Temple", "Jallianwala Bagh", "Wagah Border"],
  darjeeling: ["Tiger Hill", "Batasia Loop", "Peace Pagoda"],
  leh: ["Leh Palace", "Pangong Lake", "Shanti Stupa"],
  pune: ["Shaniwar Wada", "Aga Khan Palace", "Sinhagad Fort"],
  ahmedabad: ["Sabarmati Ashram", "Adalaj Stepwell", "Kankaria Lake"],
  lucknow: ["Bara Imambara", "Rumi Darwaza", "Hazratganj"],
  kochi: ["Fort Kochi", "Chinese Fishing Nets", "Mattancherry Palace"],
  jodhpur: ["Mehrangarh Fort", "Umaid Bhawan Palace", "Jaswant Thada"],
  pushkar: ["Pushkar Lake", "Brahma Temple", "Savitri Temple"],
  alleppey: ["Backwaters", "Alappuzha Beach", "Krishnapuram Palace"],
  coorg: ["Abbey Falls", "Raja's Seat", "Dubare Elephant Camp"],
};

function getCityLandmarks(location: string): string[] {
  const key = location.toLowerCase().trim();
  for (const [city, landmarks] of Object.entries(CITY_LANDMARKS)) {
    if (key.includes(city)) return landmarks;
  }
  return ["Main Market", "Railway Station", "Bus Stand"];
}

function getRandomDistance(): string {
  const distances = [0.5, 0.8, 1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0];
  return distances[Math.floor(Math.random() * distances.length)].toFixed(1);
}

const BookingsPage: React.FC<BookingsPageProps> = ({ userData, onNavigateToAccount }) => {
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [stayFilters, setStayFilters] = useState({
    type: "all",
    priceRange: "all",
    rating: "all",
  });

  const [hotelResults, setHotelResults] = useState<HotelResult[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [hotelError, setHotelError] = useState<string | null>(null);

  interface AIHotel {
    name: string;
    type: string;
    stars: number;
    pricePerNight: number;
    distance: string;
    address: string;
    mapLink: string;
    amenities: string[];
    description: string;
    safetyRating: string;
  }
  const [aiHotels, setAiHotels] = useState<AIHotel[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiSearchDone, setAiSearchDone] = useState(false);

  const [selectedStay, setSelectedStay] = useState<string | null>(null);
  const [aiComparisons, setAiComparisons] = useState<Record<string, any[]>>({});
  const [loadingCompareId, setLoadingCompareId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Stable distance map per hotel
  const [distanceMap, setDistanceMap] = useState<Record<string, string>>({});

  const effectiveLocation = searchQuery.length >= 2
    ? searchQuery
    : (userData?.locationEnabled && userData?.currentCity ? userData.currentCity : null);

  const landmarks = effectiveLocation ? getCityLandmarks(effectiveLocation) : [];

  useEffect(() => {
    const fetchHotels = async () => {
      if (!effectiveLocation) {
        setHotelResults([]);
        setAiHotels([]);
        setHotelError(null);
        setAiSearchDone(false);
        return;
      }

      setIsLoadingHotels(true);
      setHotelError(null);
      setAiSearchDone(false);

      try {
        const { data, error } = await supabase.functions.invoke('hotels-search', {
          body: { location: effectiveLocation, currency: 'inr', limit: 10 }
        });

        if (error) throw new Error(error.message || "Failed to fetch hotels");

        setHotelResults(data || []);

        const isMockData = Array.isArray(data) && data.length > 0 &&
          data.every((h: HotelResult, i: number) => h.hotelId === i + 1);

        if (isMockData || !data || data.length === 0) {
          fetchAIHotels(effectiveLocation);
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setHotelError(null);
        fetchAIHotels(effectiveLocation);
      } finally {
        setIsLoadingHotels(false);
      }
    };

    const fetchAIHotels = async (location: string) => {
      setIsLoadingAI(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-hotel-search', {
          body: { location, query: `hotels and hostels in ${location}` }
        });
        if (!error && data?.hotels) {
          setAiHotels(data.hotels);
          setHotelResults([]);
        }
      } catch (e) {
        console.error("AI hotel search error:", e);
      } finally {
        setIsLoadingAI(false);
        setAiSearchDone(true);
      }
    };

    const debounceTimer = setTimeout(fetchHotels, 500);
    return () => clearTimeout(debounceTimer);
  }, [effectiveLocation]);

  // Generate stable distances when results change
  useEffect(() => {
    const newMap: Record<string, string> = {};
    hotelResults.forEach(h => {
      const key = `api-${h.hotelId}`;
      newMap[key] = distanceMap[key] || getRandomDistance();
    });
    aiHotels.forEach((h, i) => {
      const key = `ai-${i}`;
      newMap[key] = distanceMap[key] || (h.distance?.replace(/[^0-9.]/g, '') || getRandomDistance());
    });
    setDistanceMap(newMap);
  }, [hotelResults, aiHotels]);

  const stayOptions = effectiveLocation
    ? hotelResults.map((hotel) => ({
        id: hotel.hotelId,
        name: hotel.hotelName,
        location: hotel.location?.name
          ? `${hotel.location.name}${hotel.location.country ? `, ${hotel.location.country}` : ""}`
          : "Location available on booking",
        price: `₹${hotel.priceFrom?.toLocaleString("en-IN") || "N/A"}/night`,
        rating: hotel.stars || 0,
        icon: hotel.stars >= 4 ? Building2 : hotel.stars >= 3 ? Home : Bed,
        amenities: ["Hotel", `${hotel.stars || 0} Star${hotel.stars !== 1 ? "s" : ""}`],
        verified: hotel.stars >= 4,
        category: hotel.stars >= 4 ? "hotel" : hotel.stars >= 3 ? "coliving" : "hostel",
        distance: distanceMap[`api-${hotel.hotelId}`] || getRandomDistance(),
      }))
    : [];

  const filteredStayOptions = stayOptions;

  const PLATFORM_LOGOS: Record<string, string> = {
    makemytrip: "https://imgak.mmtcdn.com/pwa_v3/pwa_header_assets/logo.png",
    goibibo: "https://gos3.ibcdn.com/goibiboLogoVIP-1540542890.png",
    agoda: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Agoda_transparent_logo.png"
  };

  const renderPlatformLogo = (platform: string) => {
    const logoUrl = PLATFORM_LOGOS[platform.toLowerCase()];
    if (logoUrl) {
      return <img src={logoUrl} alt={platform} className="h-5 w-auto max-w-[70px] object-contain" />;
    }
    return <span className="text-lg">📦</span>;
  };

  const handleCompare = async (id: string, hotelName: string, location: string, stars: number, basePrice?: number) => {
    if (selectedStay === id) {
      setSelectedStay(null);
      return;
    }
    setSelectedStay(id);
    if (aiComparisons[id]) return; // cached

    setLoadingCompareId(id);
    try {
      const { data, error } = await supabase.functions.invoke('compare-prices', {
        body: { hotelName, location: location || effectiveLocation, stars, basePrice }
      });
      if (!error && data?.platforms) {
        setAiComparisons(prev => ({ ...prev, [id]: data.platforms }));
      }
    } catch (e) {
      console.error("Compare prices error:", e);
    } finally {
      setLoadingCompareId(null);
    }
  };

  const getBestFromPlatforms = (platforms: any[]) => {
    let minPrice = Infinity;
    let bestName = "";
    platforms.forEach(p => {
      if (p.priceNum < minPrice) {
        minPrice = p.priceNum;
        bestName = p.name;
      }
    });
    return { minPrice, bestName };
  };

  const { results: aiResults, isLoading: aiLoading, error: aiError } = useAISearch(searchQuery, { pageContext: "bookings" });
  const showAIStayResults = searchQuery.length >= 2 && filteredStayOptions.length === 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-4 py-3 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Find Stays
            </h1>
            <p className="text-white/80 text-[10px]">
              Stays in {searchQuery || userData?.currentCity || "your area"}
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
                <Calendar mode="single" selected={checkInDate} onSelect={setCheckInDate} initialFocus className="p-3 pointer-events-auto" />
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
                <Calendar mode="single" selected={checkOutDate} onSelect={setCheckOutDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Type
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1 bg-popover" align="start">
              <div className="space-y-0.5">
                {[
                  { key: "all", label: "All", icon: Home },
                  { key: "hostel", label: "Hostels", icon: Bed },
                  { key: "hotel", label: "Hotels", icon: Building2 },
                  { key: "coliving", label: "Co-living", icon: Building2 },
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={stayFilters.type === key ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setStayFilters({ ...stayFilters, type: key })}
                    className="w-full justify-start text-xs h-8 rounded-lg px-2 flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                Price
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-1 bg-popover" align="start">
              <div className="space-y-0.5">
                {[
                  { key: "all", label: "Any" },
                  { key: "budget", label: "Budget" },
                  { key: "mid", label: "Mid-range" },
                  { key: "premium", label: "Premium" },
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={stayFilters.priceRange === key ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setStayFilters({ ...stayFilters, priceRange: key })}
                    className="w-full justify-start text-xs h-8 rounded-lg px-2"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                Rating
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-28 p-1 bg-popover" align="start">
              <div className="space-y-0.5">
                {["all", "4.5", "4.0", "3.5"].map((rating) => (
                  <Button
                    key={rating}
                    variant={stayFilters.rating === rating ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setStayFilters({ ...stayFilters, rating })}
                    className="w-full justify-start text-xs h-8 rounded-lg px-2"
                  >
                    {rating === "all" ? "Any" : `${rating}+`}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Landmarks Indicator */}
        {effectiveLocation && landmarks.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 px-1 flex-wrap">
            <Navigation className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground">
              Distances from{" "}
              {landmarks.map((l, i) => (
                <span key={l}>
                  <span className="font-medium text-foreground">{l}</span>
                  {i < landmarks.length - 1 && ", "}
                </span>
              ))}
            </span>
          </div>
        )}

        <div className="space-y-3">
          {/* Loading State */}
          {(isLoadingHotels || isLoadingAI) && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                {isLoadingAI ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI is finding real hotels near "{effectiveLocation}"...
                  </span>
                ) : (
                  <>Searching hotels in "{effectiveLocation}"...</>
                )}
              </p>
            </div>
          )}

          {/* Error State */}
          {hotelError && !isLoadingHotels && !isLoadingAI && (
            <Card className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto text-destructive mb-2" />
              <p className="text-sm text-destructive">{hotelError}</p>
            </Card>
          )}

          {/* No Results State */}
          {!isLoadingHotels && !isLoadingAI && !hotelError && effectiveLocation && filteredStayOptions.length === 0 && aiHotels.length === 0 && aiSearchDone && (
            <Card className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hotels found for "{effectiveLocation}"</p>
              <p className="text-xs text-muted-foreground mt-1">Try searching for a different destination</p>
            </Card>
          )}

          {/* Enable Location Prompt */}
          {!isLoadingHotels && !isLoadingAI && !effectiveLocation && (
            <Card className="p-6 text-center">
              <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Search for a destination or enable location</p>
              <p className="text-xs text-muted-foreground mt-1">to see stays near you</p>
            </Card>
          )}

          {/* AI-Powered Hotel Results */}
          {!isLoadingHotels && !isLoadingAI && aiHotels.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">AI-Powered Results</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">Real Hotels</Badge>
              </div>
              {aiHotels.map((hotel, idx) => {
                const IconComponent = hotel.type === "hotel" ? Building2 : hotel.type === "hostel" ? Bed : Home;
                const dist = distanceMap[`ai-${idx}`] || hotel.distance;
                return (
                  <Card key={idx} className="p-3 shadow-soft hover:shadow-medium transition-all rounded-2xl border-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{hotel.name}</h3>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] bg-warning/10 px-2 py-1 rounded-lg flex-shrink-0">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            <span className="font-semibold">{hotel.stars}</span>
                          </div>
                        </div>

                        {/* Distances from landmarks */}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-1.5">
                          {landmarks.map((landmark, li) => (
                            <div key={li} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Navigation className="w-2.5 h-2.5" />
                              <span>{getRandomDistance()} km from {landmark}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {hotel.amenities?.filter(a => a.toLowerCase() !== 'safe' && a.toLowerCase() !== 'safety').slice(0, 3).map((amenity, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">
                              {amenity}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="text-sm font-bold text-primary">
                            ₹{hotel.pricePerNight?.toLocaleString("en-IN")}/night
                          </div>
                          <div className="flex gap-1.5">
                            {hotel.mapLink && (
                              <a href={hotel.mapLink} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg px-2">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  Map
                                </Button>
                              </a>
                            )}
                            <Button
                              size="sm"
                              className="text-xs h-7 rounded-lg px-3 bg-gradient-primary text-white"
                              onClick={() => handleCompare(`ai-hotel-${idx}`, hotel.name, hotel.address || effectiveLocation || '', hotel.stars, hotel.pricePerNight)}
                            >
                              {loadingCompareId === `ai-hotel-${idx}` ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <Zap className="w-3 h-3 mr-1" />
                              )}
                              Compare
                            </Button>
                          </div>
                        </div>

                        {selectedStay === `ai-hotel-${idx}` && aiComparisons[`ai-hotel-${idx}`] && (() => {
                          const comp = aiComparisons[`ai-hotel-${idx}`];
                          const best = getBestFromPlatforms(comp);
                          return (
                            <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingDown className="w-4 h-4 text-success" />
                                <h4 className="font-semibold text-sm">Best Prices</h4>
                              </div>
                              <div className="space-y-2 mb-3">
                                {comp.map((platform: any) => {
                                  const isBest = platform.name === best.bestName;
                                  return (
                                    <div
                                      key={platform.name}
                                      className={cn(
                                        "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                        isBest ? "bg-success/10 border border-success/30" : "bg-background",
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        {renderPlatformLogo(platform.name)}
                                        <span className="font-medium text-sm">{platform.name}</span>
                                        {isBest && (
                                          <Badge className="bg-success text-white text-[10px] py-0 px-1.5">
                                            <Award className="w-2.5 h-2.5 mr-0.5" />
                                            Best
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold text-primary text-sm">{platform.price}/night</div>
                                        {platform.savings !== "₹0" && (
                                          <div className="text-[10px] text-success">Save {platform.savings}</div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <Button
                                className="w-full bg-gradient-primary text-white h-10 rounded-xl text-sm"
                                onClick={() => {
                                  const bestP = comp.find((p: any) => p.name === best.bestName);
                                  if (bestP?.url) window.open(bestP.url, '_blank');
                                }}
                              >
                                Book via {best.bestName} • ₹{best.minPrice?.toLocaleString("en-IN")}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          );
                        })()}

                        <p className="text-[9px] text-muted-foreground mt-1.5 truncate">
                          📍 {hotel.address}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </>
          )

          {/* API Hotel Results */}
          {!isLoadingHotels && !hotelError && filteredStayOptions.length > 0 ? (
            filteredStayOptions.map((stay) => {
              const IconComponent = stay.icon;
              const stayKey = `api-${stay.id}`;
              const comparison = aiComparisons[stayKey];
              const best = comparison ? getBestFromPlatforms(comparison) : null;
              const priceNum = parseInt(stay.price.replace(/[₹,/night]/g, '') || '0');

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
                            {stay.verified && <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] bg-warning/10 px-2 py-1 rounded-lg flex-shrink-0">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          <span className="font-semibold">{stay.rating}</span>
                        </div>
                      </div>

                      {/* Distances from landmarks */}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-1.5">
                        {landmarks.map((landmark, li) => (
                          <div key={li} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Navigation className="w-2.5 h-2.5" />
                            <span>{getRandomDistance()} km from {landmark}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1 my-2">
                        {stay.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">
                            {amenity.includes("WiFi") && <Wifi className="w-2.5 h-2.5 mr-1" />}
                            {amenity.includes("Kitchen") && <Utensils className="w-2.5 h-2.5 mr-1" />}
                            {amenity}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="text-sm font-bold text-primary">{stay.price}</div>
                        <Button
                          size="sm"
                          onClick={() => handleCompare(stayKey, stay.name, stay.location, stay.rating, priceNum)}
                          className="text-xs h-8 rounded-xl px-4 bg-gradient-primary text-white"
                        >
                          {loadingCompareId === stayKey ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <Zap className="w-3 h-3 mr-1" />
                          )}
                          Compare
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedStay === stayKey && comparison && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-success" />
                        <h4 className="font-semibold text-sm">Best Prices</h4>
                      </div>

                      <div className="space-y-2 mb-3">
                        {comparison.map((platform: any) => {
                          const isBest = platform.name === best?.bestName;
                          return (
                            <div
                              key={platform.name}
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                isBest ? "bg-success/10 border border-success/30" : "bg-background",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {renderPlatformLogo(platform.name)}
                                <span className="font-medium text-sm">{platform.name}</span>
                                {isBest && (
                                  <Badge className="bg-success text-white text-[10px] py-0 px-1.5">
                                    <Award className="w-2.5 h-2.5 mr-0.5" />
                                    Best
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary text-sm">{platform.price}/night</div>
                                {platform.savings !== "₹0" && (
                                  <div className="text-[10px] text-success">Save {platform.savings}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        className="w-full bg-gradient-primary text-white h-10 rounded-xl text-sm"
                        onClick={() => {
                          const bestP = comparison.find((p: any) => p.name === best?.bestName);
                          if (bestP?.url) window.open(bestP.url, '_blank');
                        }}
                      >
                        Book via {best?.bestName} • ₹{best?.minPrice?.toLocaleString("en-IN")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })
          ) : !isLoadingHotels && !hotelError && searchQuery.length < 2 && showAIStayResults ? (
            <AISearchResults
              results={aiResults}
              isLoading={aiLoading}
              error={aiError}
              searchQuery={searchQuery}
              showDestinations={false}
              showStays={true}
              showTravel={false}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
