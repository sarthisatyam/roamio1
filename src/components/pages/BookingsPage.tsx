import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Home,
  Star,
  MapPin,
  Search,
  Building2,
  Bed,
  Sparkles,
  ExternalLink,
  Loader2,
  Navigation,
  User,
  TrendingDown,
} from "lucide-react";
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

interface AIHotel {
  name: string;
  type: string;
  stars: number;
  pricePerNight: number;
  distance: string;
  address: string;
  mapLink: string;
  amenities: string[];
  imageSearchUrl?: string;
  landmarkDistances?: Record<string, number>;
}

interface AILandmark {
  name: string;
}


const TYPE_TABS = [
  { key: "all", label: "All", icon: Home },
  { key: "hotel", label: "Hotels", icon: Building2 },
  { key: "hostel", label: "Hostels", icon: Bed },
  { key: "guesthouse", label: "Guesthouses", icon: Home },
  { key: "resort", label: "Resorts", icon: Building2 },
];

const BookingsPage: React.FC<BookingsPageProps> = ({ userData, onNavigateToAccount }) => {
  const [activeType, setActiveType] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiHotels, setAiHotels] = useState<AIHotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [cityLandmarks, setCityLandmarks] = useState<string[]>([]);

  const effectiveLocation = searchQuery.length >= 2
    ? searchQuery
    : (userData?.locationEnabled && userData?.currentCity ? userData.currentCity : null);

  const landmarks = cityLandmarks;

  useEffect(() => {
    if (!effectiveLocation) {
      setAiHotels([]);
      setSearchDone(false);
      return;
    }

    setIsLoading(true);
    setSearchDone(false);

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('ai-hotel-search', {
          body: { location: effectiveLocation, query: `hotels, hostels, guesthouses and resorts in ${effectiveLocation}` }
        });
        if (!error && data?.hotels) {
          setAiHotels(data.hotels);
          if (data.landmarks && Array.isArray(data.landmarks)) {
            setCityLandmarks(data.landmarks.map((l: AILandmark) => l.name));
          }
        }
      } catch (e) {
        console.error("AI hotel search error:", e);
      } finally {
        setIsLoading(false);
        setSearchDone(true);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [effectiveLocation]);

  const filteredHotels = aiHotels.filter((h) => {
    if (activeType !== "all" && h.type?.toLowerCase() !== activeType) return false;
    if (priceFilter !== "all") {
      const price = h.pricePerNight || 0;
      if (priceFilter === "budget" && price > 1500) return false;
      if (priceFilter === "mid" && (price <= 1500 || price > 4000)) return false;
      if (priceFilter === "premium" && price <= 4000) return false;
    }
    if (ratingFilter !== "all") {
      const minRating = parseFloat(ratingFilter);
      if ((h.stars || 0) < minRating) return false;
    }
    return true;
  });

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "hotel": return Building2;
      case "hostel": return Bed;
      case "resort": return Building2;
      default: return Home;
    }
  };

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
              AI finds the best stays in {searchQuery || userData?.currentCity || "your area"}
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs bg-white/95 backdrop-blur border-0 shadow-medium h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                {activeType === "all" ? "Type" : TYPE_TABS.find(t => t.key === activeType)?.label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1 bg-popover" align="start">
              <div className="space-y-0.5">
                {TYPE_TABS.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={activeType === key ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveType(key)}
                    className="w-full justify-start text-xs h-8 rounded-lg px-2 flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Price Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                {priceFilter === "all" ? "Price" : priceFilter === "budget" ? "Budget" : priceFilter === "mid" ? "Mid-range" : "Premium"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-1 bg-popover" align="start">
              <div className="space-y-0.5">
                {[
                  { key: "all", label: "Any" },
                  { key: "budget", label: "Budget (< ₹1.5k)" },
                  { key: "mid", label: "Mid (₹1.5k–4k)" },
                  { key: "premium", label: "Premium (₹4k+)" },
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={priceFilter === key ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setPriceFilter(key)}
                    className="w-full justify-start text-xs h-8 rounded-lg px-2"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Rating Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                {ratingFilter === "all" ? "Rating" : `${ratingFilter}+`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-28 p-1 bg-popover" align="start">
              <div className="space-y-0.5">
                {["all", "4", "3", "2"].map((rating) => (
                  <Button
                    key={rating}
                    variant={ratingFilter === rating ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setRatingFilter(rating)}
                    className="w-full justify-start text-xs h-8 rounded-lg px-2"
                  >
                    {rating === "all" ? "Any" : `${rating}+ Stars`}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-20">
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
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI is finding stays near "{effectiveLocation}"...
              </p>
            </div>
          )}

          {/* No location */}
          {!isLoading && !effectiveLocation && (
            <Card className="p-6 text-center">
              <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Search for a destination or enable location</p>
              <p className="text-xs text-muted-foreground mt-1">to see stays near you</p>
            </Card>
          )}

          {/* No results */}
          {!isLoading && searchDone && effectiveLocation && filteredHotels.length === 0 && (
            <Card className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {aiHotels.length > 0
                  ? `No ${activeType}s found — try "All"`
                  : `No stays found for "${effectiveLocation}"`}
              </p>
            </Card>
          )}

          {/* AI Results */}
          {!isLoading && filteredHotels.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">AI-Powered Results</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">Real Hotels</Badge>
              </div>
              {filteredHotels.map((hotel, idx) => {
                const IconComponent = getIcon(hotel.type);
                const originalIdx = aiHotels.indexOf(hotel);
                const distances = landmarkDistances[`${originalIdx}`] || {};
                return (
                  <Card key={idx} className="p-3 shadow-soft hover:shadow-medium transition-all rounded-2xl border-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate flex-1">{hotel.name}</h3>
                          <div className="flex items-center gap-1 text-[10px] bg-warning/10 px-2 py-1 rounded-lg flex-shrink-0">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            <span className="font-semibold">{hotel.stars}</span>
                          </div>
                        </div>

                        {/* Landmark distances */}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-1.5">
                          {landmarks.map((landmark) => (
                            <div key={landmark} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Navigation className="w-2.5 h-2.5" />
                              <span>{distances[landmark] || getRandomDistance()} km from {landmark}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {hotel.amenities?.slice(0, 3).map((amenity, i) => (
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
                              onClick={() => {
                                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(hotel.name + ' ' + (hotel.address || effectiveLocation) + ' book hotel')}`;
                                window.open(searchUrl, '_blank');
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Book
                            </Button>
                          </div>
                        </div>

                        <p className="text-[9px] text-muted-foreground mt-1.5 truncate">
                          📍 {hotel.address}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
