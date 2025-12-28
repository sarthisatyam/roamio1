import React, { useState, useEffect } from "react";
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
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAISearch } from "@/hooks/useAISearch";
import AISearchResults from "@/components/AISearchResults";

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

const BookingsPage: React.FC<BookingsPageProps> = ({ userData, onNavigateToAccount }) => {
  // --- Dynamic Data State ---
  const [stayOptions, setStayOptions] = useState<any[]>([]);
  const [flightOptions, setFlightOptions] = useState<any[]>([]);
  const [trainOptions, setTrainOptions] = useState<any[]>([]);
  const [cabOptions, setCabOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("stay");
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [departureDate, setDepartureDate] = useState<Date>();
  const [origin, setOrigin] = useState(userData?.locationEnabled && userData?.currentCity ? userData.currentCity : "");
  const [destination, setDestination] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stayFilters, setStayFilters] = useState({ type: "all", priceRange: "all", rating: "all" });

  const [selectedStay, setSelectedStay] = useState<number | null>(null);
  const [selectedTravelType, setSelectedTravelType] = useState<"all" | "flight" | "train" | "cab" | null>("all");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [bookingDialog, setBookingDialog] = useState<{ open: boolean; data: any; type: "stay" | "travel" }>({
    open: false,
    data: null,
    type: "stay",
  });

  // --- API Fetch Logic ---
  useEffect(() => {
    const fetchTravelData = async () => {
      setIsLoading(true);
      try {
        // REPLACE THIS URL with your actual Travel API Endpoint
        // Example: const response = await fetch('https://api.traveloptions.com/v1/search?city=' + destination);

        // Mocking an API call for demonstration:
        const response = await fetch("https://api.jsonbin.io/v3/b/658af0711f567741cce54f3b"); // Placeholder
        const data = await response.json();

        // In a real scenario, you would map your API response to match your component keys
        setStayOptions(data.record.stays || []);
        setFlightOptions(data.record.flights || []);
        setTrainOptions(data.record.trains || []);
        setCabOptions(data.record.cabs || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTravelData();
  }, [destination]); // Re-fetches when destination changes

  // --- Icon Mapping Helper ---
  const getStayIcon = (category: string) => {
    switch (category) {
      case "hostel":
        return Bed;
      case "hotel":
        return Building2;
      case "coliving":
        return Home;
      default:
        return Home;
    }
  };

  // --- Filtering Logic (Dynamic) ---
  const filteredStayOptions = stayOptions.filter(
    (stay) =>
      stay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stay.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredFlightOptions = flightOptions.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredTrainOptions = trainOptions.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCabOptions = cabOptions.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // AI Search Hook
  const {
    results: aiResults,
    isLoading: aiLoading,
    error: aiError,
  } = useAISearch(searchQuery, { pageContext: "bookings" });

  const platformIcons: Record<string, React.ReactNode> = {
    makemytrip: <span>🔵</span>,
    booking: <span>🔷</span>,
    goibibo: <span>🟢</span>,
    agoda: <span>🟣</span>,
    zolo: <span>🟡</span>,
    irctc: <span>🚆</span>,
    cleartrip: <span>✈️</span>,
    ixigo: <span>🎯</span>,
    redbus: <span>🚌</span>,
    ola: <span>🚕</span>,
    uber: <span>🚗</span>,
  };

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
            <p className="text-white/80 text-[10px]">
              {activeTab === "stay"
                ? `Stays in ${destination || "Your Area"}`
                : `${origin || "Origin"} → ${destination || "Destination"}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToAccount}
            className="rounded-full bg-white/20 text-white"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/95 border-0 h-10 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="stay">Stays</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
              <p className="text-sm">Fetching dynamic deals...</p>
            </div>
          ) : (
            <>
              {/* STAYS CONTENT */}
              <TabsContent value="stay" className="px-4 pt-3 pb-20">
                <div className="space-y-3">
                  {filteredStayOptions.map((stay) => {
                    const IconComponent = getStayIcon(stay.category);
                    return (
                      <Card key={stay.id} className="p-3 shadow-soft rounded-2xl border-0">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{stay.name}</h3>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {stay.location}
                            </div>
                            <div className="flex items-center justify-between pt-2 mt-2 border-t">
                              <div className="text-sm font-bold text-primary">{stay.price}</div>
                              <Button size="sm" className="h-8 rounded-xl bg-gradient-primary text-white">
                                Book
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TRANSPORT CONTENT */}
              <TabsContent value="transport" className="px-4 pt-3 pb-20">
                <div className="space-y-3">
                  {filteredFlightOptions.map((flight) => (
                    <Card key={flight.id} className="p-3 shadow-soft rounded-2xl border-0">
                      <div className="flex gap-3">
                        <Plane className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{flight.name}</h4>
                          <p className="text-[10px] text-muted-foreground">
                            {flight.departure} - {flight.arrival}
                          </p>
                          <div className="font-bold text-primary mt-1">{flight.price}</div>
                        </div>
                        <Button size="sm" className="h-8 rounded-xl">
                          View
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Booking Dialog remains similar to your original code */}
    </div>
  );
};

export default BookingsPage;
