import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  User,
  MapPin,
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
  Clock,
  Music,
  Laugh,
  UtensilsCrossed,
  Palette,
  Radio,
  Zap,
  CloudSun,
  Loader2,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  Plus,
} from "lucide-react";
import { useWeather, useMultipleWeather } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";
import BookingDialog from "@/components/dialogs/BookingDialog";
import DestinationDialog from "@/components/dialogs/DestinationDialog";
import { useAISearch, AIDestination } from "@/hooks/useAISearch";
import AISearchResults from "@/components/AISearchResults";
import { supabase } from "@/integrations/supabase/client";
import { usePlans, Plan } from "@/hooks/usePlans";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface HomePageProps {
  userData?: {
    name: string;
    emailOrPhone: string;
    preferences: string[];
    language: string;
    locationEnabled: boolean;
    currentCity?: string | null;
  } | null;
  onNavigateToAccount?: () => void;
  bookmarkedPlaces?: { id: number; name: string; image: string }[];
  onToggleBookmark?: (place: { id: number; name: string; image: string }) => void;
  onAddToPlanner?: (activity: { title: string; location: string; type: string }) => void;
  onLocationToggle?: (enabled: boolean) => void;
  onCreatePlan?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  userData,
  onNavigateToAccount,
  bookmarkedPlaces = [],
  onToggleBookmark,
  onAddToPlanner,
  onLocationToggle,
  onCreatePlan,
}) => {
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [destinationDialogOpen, setDestinationDialogOpen] = useState(false);

  // Explore plans state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { plans, isLoading: plansLoading, fetchPlans, requestToJoin } = usePlans(currentUserId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleJoinRequest = async () => {
    if (!selectedPlan) return;
    setIsJoining(true);
    try {
      await requestToJoin(selectedPlan.id, joinMessage || undefined);
      setSelectedPlan(null);
      setJoinMessage("");
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  const getGroupBadge = (type: string) => {
    switch (type) {
      case "males_only": return { label: "Males Only", color: "bg-blue-500/10 text-blue-600" };
      case "females_only": return { label: "Females Only", color: "bg-pink-500/10 text-pink-600" };
      default: return { label: "Everyone", color: "bg-green-500/10 text-green-600" };
    }
  };

  // Fetch weather for user's current location
  const { weather: currentLocationWeather, loading: currentWeatherLoading } = useWeather(
    userData?.currentCity || null,
    userData?.locationEnabled ?? false,
  );

  // Extract city names for weather fetching
  const destinationCities = useMemo(() => ["Goa, India", "Manali, Himachal Pradesh", "Udaipur, Rajasthan"], []);

  const { weatherMap, loading: weatherLoading } = useMultipleWeather(destinationCities);

  const destinations = [
    {
      id: 1,
      name: "Goa, India",
      image: "🏖️",
      rating: 4.8,
      price: "₹1,500/day",
      safety: 92,
      tags: ["Solo-friendly", "Beach vibes", "Safe transport"],
      itinerary: [
        {
          day: 1,
          title: "Beach & Chill",
          activities: [
            { time: "8:00 AM", activity: "Sunrise at Palolem Beach", type: "Scenic" },
            { time: "10:00 AM", activity: "Breakfast at Beach Shack", type: "Food" },
            { time: "2:00 PM", activity: "Water Sports at Baga Beach", type: "Adventure" },
            { time: "6:00 PM", activity: "Sunset at Vagator Beach", type: "Scenic" },
          ],
        },
        {
          day: 2,
          title: "Heritage & Culture",
          activities: [
            { time: "9:00 AM", activity: "Old Goa Churches Tour", type: "Heritage" },
            { time: "1:00 PM", activity: "Goan Thali Lunch", type: "Food" },
            { time: "4:00 PM", activity: "Fontainhas Latin Quarter Walk", type: "Heritage" },
          ],
        },
      ],
      eateries: [
        { name: "Gunpowder", type: "Goan Cuisine", rating: 4.6, priceRange: "₹₹", specialty: "Prawn Balchao" },
        { name: "Thalassa", type: "Greek-Goan", rating: 4.7, priceRange: "₹₹₹", specialty: "Seafood Platter" },
        { name: "Ritz Classic", type: "Local", rating: 4.5, priceRange: "₹", specialty: "Fish Curry Rice" },
      ],
    },
    {
      id: 2,
      name: "Manali, Himachal Pradesh",
      image: "🏔️",
      rating: 4.9,
      price: "₹1,200/day",
      safety: 95,
      tags: ["Women-safe", "Adventure hub", "Mountain retreat"],
      itinerary: [
        {
          day: 1,
          title: "Mountain Exploration",
          activities: [
            { time: "7:00 AM", activity: "Sunrise Trek to Jogini Falls", type: "Adventure" },
            { time: "11:00 AM", activity: "Visit Hadimba Temple", type: "Heritage" },
            { time: "3:00 PM", activity: "Mall Road Shopping", type: "Shopping" },
            { time: "6:00 PM", activity: "Cafe Hopping in Old Manali", type: "Food" },
          ],
        },
        {
          day: 2,
          title: "Solang Valley Day",
          activities: [
            { time: "8:00 AM", activity: "Paragliding at Solang Valley", type: "Adventure" },
            { time: "12:00 PM", activity: "Atal Tunnel Visit", type: "Scenic" },
            { time: "4:00 PM", activity: "Hot Springs at Vashisht", type: "Wellness" },
          ],
        },
      ],
      eateries: [
        { name: "Drifters' Cafe", type: "Continental", rating: 4.5, priceRange: "₹₹", specialty: "Wood-fired Pizza" },
        { name: "Johnson's Cafe", type: "Multi-cuisine", rating: 4.4, priceRange: "₹₹", specialty: "Trout Fish" },
        { name: "Lazy Dog", type: "Cafe", rating: 4.6, priceRange: "₹", specialty: "Pancakes & Coffee" },
      ],
    },
    {
      id: 3,
      name: "Udaipur, Rajasthan",
      image: "🏰",
      rating: 4.7,
      price: "₹2,000/day",
      safety: 94,
      tags: ["Heritage city", "Solo traveler friendly", "Palace stays"],
      itinerary: [
        {
          day: 1,
          title: "Royal Heritage",
          activities: [
            { time: "9:00 AM", activity: "City Palace Tour", type: "Heritage" },
            { time: "1:00 PM", activity: "Lunch at Ambrai Ghat", type: "Food" },
            { time: "4:00 PM", activity: "Boat Ride on Lake Pichola", type: "Scenic" },
            { time: "7:00 PM", activity: "Sunset at Sajjangarh", type: "Scenic" },
          ],
        },
        {
          day: 2,
          title: "Art & Culture",
          activities: [
            { time: "10:00 AM", activity: "Bagore Ki Haveli & Folk Dance", type: "Cultural" },
            { time: "2:00 PM", activity: "Hathi Pol Bazaar Shopping", type: "Shopping" },
            { time: "5:00 PM", activity: "High Tea at Taj Lake Palace", type: "Food" },
          ],
        },
      ],
      eateries: [
        { name: "Ambrai", type: "Rajasthani", rating: 4.7, priceRange: "₹₹₹", specialty: "Lake View Dining" },
        { name: "Savage Garden", type: "Fusion", rating: 4.5, priceRange: "₹₹", specialty: "Rooftop Ambiance" },
        {
          name: "Natraj Dining Hall",
          type: "Thali",
          rating: 4.4,
          priceRange: "₹",
          specialty: "Unlimited Rajasthani Thali",
        },
      ],
    },
  ];

  const quickAccess = [
    { icon: Coffee, label: "Cafes", color: "bg-amber-100 text-amber-700" },
    { icon: ShoppingBag, label: "Shopping", color: "bg-purple-100 text-purple-700" },
    { icon: Camera, label: "Attractions", color: "bg-accent text-secondary" },
    {
      icon: MoreHorizontal,
      label: "More",
      color: "bg-accent text-secondary",
      onClick: () => setShowMoreCategories(!showMoreCategories),
    },
  ];

  const moreCategories = [
    { icon: Fuel, label: "Petrol", color: "bg-red-100 text-red-700" },
    { icon: Stethoscope, label: "Clinics", color: "bg-pink-100 text-pink-700" },
    { icon: Building2, label: "Museums", color: "bg-indigo-100 text-indigo-700" },
    { icon: Utensils, label: "Restaurants", color: "bg-orange-100 text-orange-700" },
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
      price: "₹800",
      bookingUrl: "#",
      icon: Music,
      isLive: true,
      fillingFast: false,
    },
    {
      name: "Stand-up Comedy Show",
      type: "Entertainment",
      distance: "4.2 km",
      date: "Tomorrow, 7:30 PM",
      duration: "2 hours",
      rating: 4.3,
      reviews: "8.5k",
      price: "₹500",
      bookingUrl: "#",
      icon: Laugh,
      isLive: false,
      fillingFast: true,
    },
    {
      name: "Food Festival at Kingdom of Dreams",
      type: "Food & Culture",
      distance: "8.5 km",
      date: "Mar 25-26",
      duration: "All Day",
      rating: 4.6,
      reviews: "15k",
      price: "₹1,200",
      bookingUrl: "#",
      icon: UtensilsCrossed,
      isLive: true,
      fillingFast: true,
    },
    {
      name: "Art Exhibition - Modern India",
      type: "Art & Culture",
      distance: "3.1 km",
      date: "This Week",
      duration: "4 hours",
      rating: 4.4,
      reviews: "20k",
      price: "₹350",
      bookingUrl: "#",
      icon: Palette,
      isLive: false,
      fillingFast: false,
    },
  ];

  // AI Search hook
  const {
    results: aiResults,
    isLoading: aiLoading,
    error: aiError,
  } = useAISearch(searchQuery, {
    pageContext: "home",
  });

  // Filter destinations based on search
  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Filter hotspots based on search
  const filteredHotspots = hotspots.filter(
    (spot) =>
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Check if we should show AI results (no static matches and search is active)
  const showAIResults = searchQuery.length >= 2 && filteredDestinations.length === 0;

  const handleAIDestinationSelect = (dest: AIDestination) => {
    setSelectedDestination(dest);
    setDestinationDialogOpen(true);
  };

  const getHotspotPlatforms = (spot: (typeof hotspots)[0]) => [
    { name: "BookMyShow", price: "₹800", savings: "₹100", url: "https://bookmyshow.com", icon: "🎬" },
    { name: "Paytm", price: "₹850", savings: "₹50", url: "https://paytm.com", icon: "💳" },
    { name: "MakeMyTrip", price: "₹900", savings: "₹0", url: "https://makemytrip.com", icon: "🔵" },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Search */}
      <div className="bg-gradient-hero px-4 py-3 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white mb-0.5 truncate">
              Good morning{userData?.name ? `, ${userData.name}` : ""}! 👋
            </h1>
            <div className="flex items-center gap-2">
              <p
                className={`text-white/80 text-xs flex items-center gap-1 ${!userData?.locationEnabled ? "cursor-pointer hover:text-white transition-colors" : ""}`}
                onClick={() => {
                  if (!userData?.locationEnabled && onLocationToggle) {
                    onLocationToggle(true);
                  }
                }}
              >
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {userData?.locationEnabled ? userData?.currentCity || "Fetching..." : "Enable location"}
              </p>
              {/* Current Location Weather */}
              {userData?.locationEnabled && userData?.currentCity && (
                <span className="text-white/70 text-xs flex items-center gap-1">
                  <span className="text-white/50">•</span>
                  {currentWeatherLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : currentLocationWeather ? (
                    <>
                      <CloudSun className="w-3 h-3" />
                      <span>{currentLocationWeather}</span>
                    </>
                  ) : null}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToAccount}
            className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 flex-shrink-0"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search destinations, activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs bg-white/95 backdrop-blur border-0 shadow-medium rounded-xl"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Access */}
        <div className="px-4 py-3">
          {/* <div className="grid grid-cols-4 gap-2">
            {quickAccess.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className="p-3 text-center shadow-soft hover:shadow-medium transition-shadow cursor-pointer rounded-2xl border-0"
                  onClick={item.onClick}
                >
                  <div
                    className={cn("w-10 h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center", item.color)}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-medium leading-tight">{item.label}</p>
                </Card>
              );
            })}
          </div> */}

          {/* Additional Categories */}
          {/* {showMoreCategories && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {moreCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.label}
                    className="p-3 text-center shadow-soft hover:shadow-medium transition-shadow cursor-pointer rounded-2xl border-0"
                  >
                    <div
                      className={cn("w-10 h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center", item.color)}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-medium leading-tight">{item.label}</p>
                  </Card>
                );
              })}
            </div>
          )} */}
        </div>

        {/* Safe Destinations */}
        <section className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">Safe Destinations</h2>
              <p className="text-[10px] text-muted-foreground">Verified solo-friendly places</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary text-xs h-8 px-2">
              See all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {filteredDestinations.length > 0 ? (
            <div className="space-y-3">
              {filteredDestinations.map((dest) => (
                <Card
                  key={dest.id}
                  className="p-3 shadow-soft hover:shadow-medium transition-all cursor-pointer rounded-2xl border-0"
                  onClick={() => {
                    setSelectedDestination(dest);
                    setDestinationDialogOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                        {dest.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{dest.name}</h3>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {weatherLoading ? (
                            <span className="text-[10px] text-muted-foreground">...</span>
                          ) : weatherMap[dest.name] ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0.5 px-2 rounded-lg bg-sky-500/10 text-sky-600 border-sky-300"
                            >
                              <CloudSun className="w-2.5 h-2.5 mr-0.5" />
                              <span className="font-normal">{weatherMap[dest.name]}</span>
                            </Badge>
                          ) : null}
                          {dest.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] py-0.5 px-2 rounded-lg">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <Bookmark
                        className={cn(
                          "w-4 h-4 cursor-pointer transition-colors",
                          bookmarkedPlaces.find((p) => p.id === dest.id)
                            ? "text-primary fill-current"
                            : "text-muted-foreground hover:text-primary",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark?.({ id: dest.id, name: dest.name, image: dest.image });
                        }}
                      />
                      <p className="font-bold text-sm text-primary mt-1">{dest.price}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {dest.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">
                        {tag}
                      </Badge>
                    ))}
                    {dest.tags.length > 2 && (
                      <Badge variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">
                        +{dest.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            showAIResults && (
              <AISearchResults
                results={aiResults}
                isLoading={aiLoading}
                error={aiError}
                searchQuery={searchQuery}
                onSelectDestination={handleAIDestinationSelect}
                showDestinations={true}
                showStays={true}
                showTravel={true}
                bookmarkedIds={bookmarkedPlaces.map((p) => p.id)}
              />
            )
          )}
        </section>

        {/* Explore Plans Section */}
        <section className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">Explore Plans</h2>
              <p className="text-[10px] text-muted-foreground">Join trips created by travelers</p>
            </div>
            {onCreatePlan && (
              <Button size="sm" className="bg-gradient-primary text-white border-0 h-8 text-xs rounded-xl px-3" onClick={onCreatePlan}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Create
              </Button>
            )}
          </div>

          {plansLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <Card className="p-6 text-center rounded-2xl border-0 shadow-soft">
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No plans yet</p>
              <p className="text-[10px] text-muted-foreground mt-1">Be the first to create a plan!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {plans.map(plan => {
                const badge = getGroupBadge(plan.group_type);
                return (
                  <Card key={plan.id} className="overflow-hidden rounded-2xl border-0 shadow-soft">
                    {/* Cover */}
                    <div className="aspect-[2/1] relative bg-muted">
                      {plan.cover_image_url ? (
                        <img src={plan.cover_image_url} alt={plan.plan_name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <MapPin className="w-10 h-10 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <Badge className={cn("text-[10px]", badge.color)}>{badge.label}</Badge>
                        <Badge className={cn("text-[10px]", plan.plan_visibility === "public" ? "bg-accent/80 text-accent-foreground" : "bg-muted/80 text-muted-foreground")}>
                          {plan.plan_visibility === "public" ? <Eye className="w-2.5 h-2.5 mr-0.5" /> : <EyeOff className="w-2.5 h-2.5 mr-0.5" />}
                          {plan.plan_visibility === "public" ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3 space-y-2">
                      <h3 className="font-bold text-sm leading-tight">{plan.plan_name}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{plan.destination_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(plan.start_date), "MMM dd")} – {format(new Date(plan.end_date), "MMM dd")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{plan.member_count || 1}/{plan.max_members}</span>
                        </div>
                      </div>

                      {plan.interests && plan.interests.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {plan.interests.map(i => (
                            <Badge key={i} variant="secondary" className="text-[9px] py-0 px-1.5 rounded-md">{i}</Badge>
                          ))}
                        </div>
                      )}

                      {plan.is_owner ? (
                        <Badge className="bg-primary/10 text-primary text-[10px]">Your Plan</Badge>
                      ) : plan.is_member ? (
                        <Badge className="bg-green-500/10 text-green-600 text-[10px]">Joined</Badge>
                      ) : plan.my_request_status === "pending" ? (
                        <Badge className="bg-yellow-500/10 text-yellow-600 text-[10px]">
                          <Clock className="w-2.5 h-2.5 mr-0.5" /> Pending
                        </Badge>
                      ) : plan.my_request_status === "rejected" ? (
                        <Badge className="bg-destructive/10 text-destructive text-[10px]">Declined</Badge>
                      ) : (
                        <Button
                          onClick={() => setSelectedPlan(plan)}
                          className="w-full rounded-xl bg-gradient-primary text-xs h-8"
                          size="sm"
                        >
                          Request to Join <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Booking Dialog */}
      {selectedHotspot && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          title={selectedHotspot.name}
          subtitle="Compare prices across platforms"
          platforms={getHotspotPlatforms(selectedHotspot)}
          eventDetails={{
            date: selectedHotspot.date,
            duration: selectedHotspot.duration,
            location: selectedHotspot.distance,
            rating: selectedHotspot.rating,
            reviews: selectedHotspot.reviews,
          }}
        />
      )}
      {/* Destination Dialog */}
      <DestinationDialog
        open={destinationDialogOpen}
        onOpenChange={setDestinationDialogOpen}
        destination={selectedDestination}
        onAddToPlanner={onAddToPlanner}
      />
    </div>
  );
};

export default HomePage;
