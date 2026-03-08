import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  User,
  MapPin,
  Shield,
  ArrowRight,
  Compass,
  Wallet,
  Bookmark,
  Calendar,
  Clock,
  CloudSun,
  Loader2,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  Plus,
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";
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

const quickAccessCategories = [
  { icon: Shield, label: "Safe Places", color: "bg-emerald-500/10 text-emerald-600" },
  { icon: Compass, label: "Solo-Friendly", color: "bg-blue-500/10 text-blue-600" },
  { icon: Users, label: "Women-Safe", color: "bg-pink-500/10 text-pink-600" },
  { icon: Wallet, label: "Budget Friendly", color: "bg-amber-500/10 text-amber-600" },
];

const HomePage: React.FC<HomePageProps> = ({
  userData,
  onNavigateToAccount,
  bookmarkedPlaces = [],
  onToggleBookmark,
  onAddToPlanner,
  onLocationToggle,
  onCreatePlan,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [destinationDialogOpen, setDestinationDialogOpen] = useState(false);

  // Popular destinations state
  const [popularDestinations, setPopularDestinations] = useState<AIDestination[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);

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

  // Fetch popular destinations: 3 nearby + 2 famous overall
  const fetchPopularDestinations = useCallback(async () => {
    setPopularLoading(true);
    try {
      const city = userData?.locationEnabled && userData?.currentCity
        ? userData.currentCity
        : "Delhi";

      // Fetch nearby and famous destinations in parallel
      const [nearbyRes, famousRes] = await Promise.all([
        supabase.functions.invoke('search-generator', {
          body: { query: `top 3 nearby destinations close to ${city} for solo women travelers`, pageContext: "home" }
        }),
        supabase.functions.invoke('search-generator', {
          body: { query: `top 2 most famous must-visit destinations in India for solo women travelers (not near ${city})`, pageContext: "home" }
        }),
      ]);

      const nearby = (nearbyRes.data?.destinations || []).slice(0, 3);
      const famous = (famousRes.data?.destinations || []).slice(0, 2);

      // Tag them so UI can differentiate
      const taggedNearby = nearby.map((d: AIDestination) => ({
        ...d,
        tags: ["Nearby", ...d.tags.filter((t: string) => t !== "Nearby")],
      }));
      const taggedFamous = famous.map((d: AIDestination) => ({
        ...d,
        tags: ["Must Visit", ...d.tags.filter((t: string) => t !== "Must Visit")],
      }));

      setPopularDestinations([...taggedNearby, ...taggedFamous]);
    } catch (err) {
      console.error('Failed to fetch popular destinations:', err);
    } finally {
      setPopularLoading(false);
    }
  }, [userData?.locationEnabled, userData?.currentCity]);

  useEffect(() => {
    fetchPopularDestinations();
  }, [fetchPopularDestinations]);

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

  // AI Search hook
  const {
    results: aiResults,
    isLoading: aiLoading,
    error: aiError,
  } = useAISearch(searchQuery, { pageContext: "home" });

  const showAIResults = searchQuery.length >= 2;

  const handleAIDestinationSelect = (dest: AIDestination) => {
    setSelectedDestination(dest);
    setDestinationDialogOpen(true);
  };

  const handleCategoryClick = (label: string) => {
    setSearchQuery(label);
  };

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
        {/* Quick Access Categories */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-4 gap-2">
            {quickAccessCategories.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className={cn(
                    "p-3 text-center shadow-soft hover:shadow-medium transition-shadow cursor-pointer rounded-2xl border-0",
                    searchQuery === item.label && "ring-2 ring-primary"
                  )}
                  onClick={() => handleCategoryClick(item.label)}
                >
                  <div className={cn("w-10 h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center", item.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-medium leading-tight">{item.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* AI Search Results (shown when searching) */}
        {showAIResults && (
          <section className="px-4 mb-4">
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
          </section>
        )}

        {/* Popular Destinations (shown when NOT searching) */}
        {!showAIResults && (
          <section className="px-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">Popular Destinations</h2>
                <p className="text-[10px] text-muted-foreground">
                  {userData?.locationEnabled && userData?.currentCity
                    ? `3 nearby ${userData.currentCity} + 2 must-visit across India`
                    : "3 nearby + 2 must-visit across India"}
                </p>
              </div>
            </div>

            {popularLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="p-3 rounded-2xl border-0 shadow-soft">
                    <div className="flex items-start gap-2.5">
                      <Skeleton className="w-10 h-10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : popularDestinations.length > 0 ? (
              <div className="space-y-3">
                {popularDestinations.map((dest) => (
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
                            {dest.tags.slice(0, 3).map((tag) => (
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
                        {dest.recommendedDays && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Best for {dest.recommendedDays} day{dest.recommendedDays > 1 ? "s" : ""} visit
                          </p>
                        )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center rounded-2xl border-0 shadow-soft">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No destinations found</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {!userData?.locationEnabled ? (
                    <span
                      className="text-primary cursor-pointer"
                      onClick={() => onLocationToggle?.(true)}
                    >
                      Enable location for nearby recommendations
                    </span>
                  ) : "Try searching for a destination above"}
                </p>
              </Card>
            )}
          </section>
        )}

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

      {/* Destination Dialog */}
      <DestinationDialog
        open={destinationDialogOpen}
        onOpenChange={setDestinationDialogOpen}
        destination={selectedDestination}
        onAddToPlanner={onAddToPlanner}
      />

      {/* Join Request Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Request to Join</DialogTitle>
            <DialogDescription>
              Send a request to join "{selectedPlan?.plan_name}"
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={joinMessage}
            onChange={e => setJoinMessage(e.target.value)}
            placeholder="Introduce yourself (optional)"
            className="min-h-[80px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPlan(null)}>Cancel</Button>
            <Button onClick={handleJoinRequest} disabled={isJoining} className="bg-gradient-primary">
              {isJoining ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
