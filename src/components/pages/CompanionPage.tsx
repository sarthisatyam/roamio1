import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  MapPin,
  Shield,
  CheckCircle,
  User,
  Compass,
  Mountain,
  Plus,
  Loader2,
  Calendar,
  ArrowRight,
  Send,
  Clock,
  MessageCircle,
  Eye,
  ChevronLeft,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTrips, Trip, TripRequest } from "@/hooks/useTrips";
import TripChatDialog from "@/components/dialogs/TripChatDialog";

interface CompanionPageProps {
  onNavigateToAccount?: () => void;
  userCity?: string | null;
}

type Stage = "explore" | "intent" | "discover" | "my-trips";

const TRIP_TYPES = [
  { value: "darshan", label: "Darshan" },
  { value: "trek", label: "Trek" },
  { value: "relaxed", label: "Relaxed" },
  { value: "adventure", label: "Adventure" },
  { value: "spiritual", label: "Spiritual" },
];

const BUDGET_RANGES = [
  { value: "budget", label: "Budget" },
  { value: "mid-range", label: "Mid-Range" },
  { value: "premium", label: "Premium" },
];

const GROUP_TYPES = [
  { value: "women-only", label: "Women Only" },
  { value: "mixed", label: "Mixed" },
  { value: "family", label: "Family" },
];

const CompanionPage: React.FC<CompanionPageProps> = ({ onNavigateToAccount, userCity }) => {
  const [stage, setStage] = useState<Stage>("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Intent form
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [groupType, setGroupType] = useState("");
  const [maxMembers, setMaxMembers] = useState(6);
  const [tripDescription, setTripDescription] = useState("");

  // Join request
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinAnswers, setJoinAnswers] = useState({ arrival: "", first_visit: "", group_stay: "" });
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Request management
  const [requestsDialogOpen, setRequestsDialogOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<TripRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [managingTrip, setManagingTrip] = useState<Trip | null>(null);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTrip, setChatTrip] = useState<Trip | null>(null);

  // Create trip dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Auth
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { trips, myTrips, isLoading, fetchTrips, fetchMyTrips, createTrip, requestToJoin, handleRequest, getPendingRequests } = useTrips(currentUserId);

  // Search trips when destination entered in explore
  const handleExploreSearch = () => {
    if (!searchQuery.trim()) return;
    setDestination(searchQuery.trim());
    fetchTrips(searchQuery.trim());
    setStage("discover");
  };

  const handleDeclareIntent = () => {
    if (!destination.trim()) { toast.error("Enter a destination"); return; }
    if (!startDate || !endDate) { toast.error("Select dates"); return; }
    if (!tripType) { toast.error("Select trip type"); return; }
    if (!budgetRange) { toast.error("Select budget range"); return; }
    setStage("discover");
    fetchTrips(destination);
  };

  const handleCreateTrip = async () => {
    if (!destination.trim() || !startDate || !endDate || !tripType || !budgetRange || !groupType) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setIsCreating(true);
      await createTrip({
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        trip_type: tripType,
        budget_range: budgetRange,
        group_type: groupType || "mixed",
        max_members: maxMembers,
        trip_style: tripType,
        description: tripDescription || undefined,
      });
      toast.success("Trip created! You're the trip owner.");
      setCreateDialogOpen(false);
      setStage("my-trips");
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create trip");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRequestJoin = async () => {
    if (!selectedTrip) return;
    try {
      setIsSendingRequest(true);
      await requestToJoin(selectedTrip.id, joinMessage, joinAnswers);
      toast.success("Request sent! The trip owner will review it.");
      setJoinDialogOpen(false);
      setJoinMessage("");
      setJoinAnswers({ arrival: "", first_visit: "", group_stay: "" });
      setSelectedTrip(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const openManageRequests = async (trip: Trip) => {
    setManagingTrip(trip);
    setLoadingRequests(true);
    setRequestsDialogOpen(true);
    try {
      const reqs = await getPendingRequests(trip.id);
      setPendingRequests(reqs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleReviewRequest = async (req: TripRequest, action: "accepted" | "declined") => {
    try {
      await handleRequest(req.id, action, req.trip_id, req.user_id);
      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
      toast.success(action === "accepted" ? "Request accepted! They can now join the group chat." : "Request declined.");
      // Refresh my trips to update member count
      await fetchMyTrips();
    } catch (err) {
      console.error(err);
      toast.error("Failed to process request");
    }
  };

  const resetForm = () => {
    setDestination("");
    setStartDate("");
    setEndDate("");
    setTripType("");
    setBudgetRange("");
    setGroupType("");
    setMaxMembers(6);
    setTripDescription("");
  };

  const getGroupTypeLabel = (type: string) => GROUP_TYPES.find(g => g.value === type)?.label || type;
  const getTripTypeLabel = (type: string) => TRIP_TYPES.find(t => t.value === type)?.label || type;
  const getBudgetLabel = (type: string) => BUDGET_RANGES.find(b => b.value === type)?.label || type;

  // Unauthenticated
  if (!currentUserId) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="bg-gradient-hero px-4 py-3 pb-5">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Safe Travel Companion
          </h1>
          <p className="text-white/80 text-[10px]">Trip-first, consent-driven travel groups</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="p-6 text-center max-w-sm">
            <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="font-semibold text-lg mb-2">Safe Travel Groups</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Sign in to find trip-based travel groups. No direct messaging — all interactions are group-first and consent-driven.
            </p>
            <Button onClick={onNavigateToAccount} className="bg-gradient-primary text-white">
              Sign In / Sign Up
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-4 py-3 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {stage !== "explore" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStage("explore")}
                className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Safe Companion
              </h1>
              <p className="text-white/80 text-[10px]">Trip-first • Group-only • Consent-driven</p>
            </div>
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
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* ===== STAGE 1: EXPLORE ===== */}
        {stage === "explore" && (
          <div className="px-4 pt-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search a destination (e.g., Girnar, Manali...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExploreSearch()}
                className="pl-10 text-xs bg-card border shadow-soft h-10 rounded-xl"
              />
            </div>

            {/* Safety Banner */}
            <Card className="p-4 bg-primary/5 border-primary/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">How it works</h3>
                  <ul className="text-xs text-muted-foreground mt-1.5 space-y-1">
                    <li className="flex items-center gap-1.5"><span className="text-primary font-bold">1.</span> Search a destination — see travel patterns, not people</li>
                    <li className="flex items-center gap-1.5"><span className="text-primary font-bold">2.</span> Declare your intent — destination, dates, style, budget</li>
                    <li className="flex items-center gap-1.5"><span className="text-primary font-bold">3.</span> Join or create a trip — request access, no direct chat</li>
                    <li className="flex items-center gap-1.5"><span className="text-primary font-bold">4.</span> Chat unlocks only after consent — group-first, trip-scoped</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Tabs: Explore / My Trips */}
            <Tabs defaultValue="explore-dest" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10 rounded-xl bg-muted">
                <TabsTrigger value="explore-dest" className="text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Compass className="w-3.5 h-3.5 mr-1.5" />
                  Explore
                </TabsTrigger>
                <TabsTrigger value="my-trips-tab" className="text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm" onClick={() => fetchMyTrips()}>
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  My Trips
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explore-dest" className="mt-3 space-y-3">
                {/* Quick destination suggestions */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Popular Destinations</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Girnar", "Manali", "Rishikesh", "Goa", "Varanasi", "Ladakh"].map(dest => (
                      <Badge
                        key={dest}
                        variant="secondary"
                        className="text-xs py-1.5 px-3 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => {
                          setSearchQuery(dest);
                          setDestination(dest);
                          fetchTrips(dest);
                          setStage("discover");
                        }}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {dest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Intent declaration CTA */}
                <Card className="p-4 rounded-2xl border-dashed border-2 border-primary/30 bg-primary/5">
                  <div className="text-center">
                    <Mountain className="w-8 h-8 mx-auto text-primary mb-2" />
                    <h3 className="font-semibold text-sm">Plan a Trip</h3>
                    <p className="text-xs text-muted-foreground mt-1">Declare your travel intent to find or create a group</p>
                    <Button
                      className="mt-3 bg-gradient-primary text-white rounded-xl text-xs h-9"
                      onClick={() => setStage("intent")}
                    >
                      Declare Intent
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="my-trips-tab" className="mt-3 space-y-3">
                {myTrips.length === 0 ? (
                  <Card className="p-6 text-center rounded-2xl">
                    <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-semibold text-sm">No trips yet</h3>
                    <p className="text-xs text-muted-foreground mt-1">Create or join a trip to get started</p>
                  </Card>
                ) : (
                  myTrips.map(trip => (
                    <MyTripCard
                      key={trip.id}
                      trip={trip}
                      onChat={() => { setChatTrip(trip); setChatOpen(true); }}
                      onManageRequests={() => openManageRequests(trip)}
                      getGroupTypeLabel={getGroupTypeLabel}
                      getTripTypeLabel={getTripTypeLabel}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* ===== STAGE 2: INTENT DECLARATION ===== */}
        {stage === "intent" && (
          <div className="px-4 pt-4 space-y-4">
            <h2 className="font-semibold text-base">Declare Your Travel Intent</h2>
            <p className="text-xs text-muted-foreground">Fill in your travel plans to find or create matching trips. No profiles or chats at this stage.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Destination *</label>
                <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Girnar, Manali" className="rounded-xl text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date *</label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date *</label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-xl text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Trip Type *</label>
                <Select value={tripType} onValueChange={setTripType}>
                  <SelectTrigger className="rounded-xl text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {TRIP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Budget Range *</label>
                <Select value={budgetRange} onValueChange={setBudgetRange}>
                  <SelectTrigger className="rounded-xl text-sm"><SelectValue placeholder="Select budget" /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-gradient-primary text-white rounded-xl h-11"
                onClick={() => {
                  handleDeclareIntent();
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Find Matching Trips
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => {
                  if (!destination.trim() || !startDate || !endDate || !tripType || !budgetRange) {
                    toast.error("Fill all required fields first");
                    return;
                  }
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Trip
              </Button>
            </div>
          </div>
        )}

        {/* ===== STAGE 3: TRIP DISCOVERY ===== */}
        {stage === "discover" && (
          <div className="px-4 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Trips to {destination || "Destination"}
                </h2>
                <p className="text-[10px] text-muted-foreground">Showing trip groups — no individual profiles</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl text-xs h-8"
                onClick={() => setStage("intent")}
              >
                <Plus className="w-3 h-3 mr-1" />
                Create
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : trips.length === 0 ? (
              <Card className="p-6 text-center rounded-2xl">
                <Compass className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-semibold text-sm">No trips found</h3>
                <p className="text-xs text-muted-foreground mt-1">Be the first to create a trip to {destination}!</p>
                <Button
                  className="mt-4 bg-gradient-primary text-white rounded-xl text-xs"
                  onClick={() => setStage("intent")}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create a Trip
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {trips.map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onRequestJoin={() => {
                      setSelectedTrip(trip);
                      setJoinDialogOpen(true);
                    }}
                    getGroupTypeLabel={getGroupTypeLabel}
                    getTripTypeLabel={getTripTypeLabel}
                    getBudgetLabel={getBudgetLabel}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== JOIN REQUEST DIALOG ===== */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Send className="w-4 h-4 text-primary" />
              Request to Join Trip
            </DialogTitle>
            <DialogDescription className="text-xs">
              The trip owner will review your request. No direct chat until accepted.
            </DialogDescription>
          </DialogHeader>

          {selectedTrip && (
            <div className="space-y-4">
              <Card className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs font-medium">{selectedTrip.destination}</p>
                <p className="text-[10px] text-muted-foreground">
                  {selectedTrip.start_date} → {selectedTrip.end_date} • {getGroupTypeLabel(selectedTrip.group_type)}
                </p>
              </Card>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">What time do you plan to arrive?</label>
                <Input value={joinAnswers.arrival} onChange={e => setJoinAnswers(prev => ({ ...prev, arrival: e.target.value }))} placeholder="e.g., Morning, 10 AM" className="rounded-xl text-sm" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Is this your first visit?</label>
                <Select value={joinAnswers.first_visit} onValueChange={v => setJoinAnswers(prev => ({ ...prev, first_visit: v }))}>
                  <SelectTrigger className="rounded-xl text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes, first time</SelectItem>
                    <SelectItem value="no">No, visited before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Comfortable with group stay?</label>
                <Select value={joinAnswers.group_stay} onValueChange={v => setJoinAnswers(prev => ({ ...prev, group_stay: v }))}>
                  <SelectTrigger className="rounded-xl text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No, I'll book separately</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Optional message</label>
                <Textarea value={joinMessage} onChange={e => setJoinMessage(e.target.value)} placeholder="Introduce yourself briefly..." className="rounded-xl text-sm resize-none" rows={2} />
              </div>

              <DialogFooter>
                <Button
                  className="w-full bg-gradient-primary text-white rounded-xl h-10"
                  onClick={handleRequestJoin}
                  disabled={isSendingRequest}
                >
                  {isSendingRequest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Send Request
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== CREATE TRIP DIALOG ===== */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4 text-primary" />
              Create a Trip
            </DialogTitle>
            <DialogDescription className="text-xs">
              You'll be the trip owner and can approve/decline join requests.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Card className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs font-medium">{destination} • {getTripTypeLabel(tripType)} • {getBudgetLabel(budgetRange)}</p>
              <p className="text-[10px] text-muted-foreground">{startDate} → {endDate}</p>
            </Card>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Group Type *</label>
              <Select value={groupType} onValueChange={setGroupType}>
                <SelectTrigger className="rounded-xl text-sm"><SelectValue placeholder="Select group type" /></SelectTrigger>
                <SelectContent>
                  {GROUP_TYPES.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Members</label>
              <Select value={String(maxMembers)} onValueChange={v => setMaxMembers(Number(v))}>
                <SelectTrigger className="rounded-xl text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 8, 10].map(n => <SelectItem key={n} value={String(n)}>{n} people</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description (optional)</label>
              <Textarea value={tripDescription} onChange={e => setTripDescription(e.target.value)} placeholder="Brief trip plan..." className="rounded-xl text-sm resize-none" rows={2} />
            </div>

            <DialogFooter>
              <Button className="w-full bg-gradient-primary text-white rounded-xl h-10" onClick={handleCreateTrip} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Trip
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== MANAGE REQUESTS DIALOG ===== */}
      <Dialog open={requestsDialogOpen} onOpenChange={setRequestsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              Join Requests — {managingTrip?.destination}
            </DialogTitle>
          </DialogHeader>

          {loadingRequests ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {pendingRequests.map(req => (
                <Card key={req.id} className="p-3 rounded-xl">
                  <p className="text-sm font-medium">{req.sender_name}</p>
                  {req.answers && (
                    <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                      {req.answers.arrival && <p>Arrival: {req.answers.arrival}</p>}
                      {req.answers.first_visit && <p>First visit: {req.answers.first_visit}</p>}
                      {req.answers.group_stay && <p>Group stay: {req.answers.group_stay}</p>}
                    </div>
                  )}
                  {req.message && <p className="text-xs text-muted-foreground mt-1 italic">"{req.message}"</p>}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 bg-gradient-primary text-white rounded-xl text-xs h-8" onClick={() => handleReviewRequest(req, "accepted")}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs h-8" onClick={() => handleReviewRequest(req, "declined")}>
                      Decline
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== TRIP CHAT ===== */}
      <TripChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        tripId={chatTrip?.id || null}
        tripName={chatTrip?.destination || "Trip"}
        currentUserId={currentUserId}
      />
    </div>
  );
};

// ===== TRIP CARD COMPONENT (Stage 3 — No profiles, no names) =====
const TripCard: React.FC<{
  trip: Trip;
  onRequestJoin: () => void;
  getGroupTypeLabel: (t: string) => string;
  getTripTypeLabel: (t: string) => string;
  getBudgetLabel: (t: string) => string;
}> = ({ trip, onRequestJoin, getGroupTypeLabel, getTripTypeLabel, getBudgetLabel }) => {
  const isPending = trip.my_request_status === "pending";
  const isAccepted = trip.my_request_status === "accepted" || trip.is_member;
  const isFull = (trip.member_count || 0) >= trip.max_members;

  return (
    <Card className="p-4 shadow-soft rounded-2xl border-0 bg-card">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {trip.destination}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {trip.start_date} → {trip.end_date}
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px] rounded-lg bg-primary/10 text-primary border-0">
            {getTripTypeLabel(trip.trip_type)}
          </Badge>
        </div>

        {/* Info badges — NO names, NO profiles */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px] py-1 px-2 rounded-lg gap-1">
            <Users className="w-3 h-3" />
            {trip.member_count || 0}/{trip.max_members} people
          </Badge>
          <Badge variant="outline" className="text-[10px] py-1 px-2 rounded-lg gap-1">
            <Shield className="w-3 h-3" />
            {getGroupTypeLabel(trip.group_type)}
          </Badge>
          <Badge variant="outline" className="text-[10px] py-1 px-2 rounded-lg gap-1">
            <TrendingUp className="w-3 h-3" />
            {getBudgetLabel(trip.budget_range)}
          </Badge>
          {trip.verified_count !== undefined && trip.verified_count > 0 && (
            <Badge variant="outline" className="text-[10px] py-1 px-2 rounded-lg gap-1 text-success border-success/30">
              <UserCheck className="w-3 h-3" />
              {trip.member_count && trip.member_count > 0
                ? `${Math.round((trip.verified_count / trip.member_count) * 100)}% verified`
                : "Verified"}
            </Badge>
          )}
        </div>

        {trip.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{trip.description}</p>
        )}

        {/* CTA */}
        <Button
          className={cn(
            "w-full rounded-xl text-xs h-9",
            isAccepted
              ? "bg-success/10 text-success border border-success/30"
              : isPending
                ? "bg-muted text-muted-foreground"
                : isFull
                  ? "bg-muted text-muted-foreground"
                  : "bg-gradient-primary text-white border-0",
          )}
          onClick={onRequestJoin}
          disabled={isAccepted || isPending || isFull}
        >
          {isAccepted ? (
            <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Member</>
          ) : isPending ? (
            <><Clock className="w-3.5 h-3.5 mr-1.5" /> Request Pending</>
          ) : isFull ? (
            "Trip Full"
          ) : (
            <><ArrowRight className="w-3.5 h-3.5 mr-1.5" /> Request to Join Trip</>
          )}
        </Button>
      </div>
    </Card>
  );
};

// ===== MY TRIP CARD =====
const MyTripCard: React.FC<{
  trip: Trip;
  onChat: () => void;
  onManageRequests: () => void;
  getGroupTypeLabel: (t: string) => string;
  getTripTypeLabel: (t: string) => string;
}> = ({ trip, onChat, onManageRequests, getGroupTypeLabel, getTripTypeLabel }) => {
  const isPending = !trip.is_member && trip.my_request_status === "pending";
  const isDeclined = !trip.is_member && trip.my_request_status === "declined";
  // Treat accepted request status as member (covers edge case where trip_members insert may not have propagated)
  const isMember = trip.is_member || trip.my_request_status === "accepted";

  return (
    <Card className="p-4 shadow-soft rounded-2xl border-0 bg-card">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {trip.destination}
          </h3>
          <p className="text-[10px] text-muted-foreground">{trip.start_date} → {trip.end_date}</p>
        </div>
        <div className="flex gap-1">
          <Badge variant="secondary" className="text-[10px] rounded-lg">{getTripTypeLabel(trip.trip_type)}</Badge>
          {trip.is_owner && <Badge className="text-[10px] rounded-lg bg-primary/10 text-primary border-0">Owner</Badge>}
          {isPending && <Badge className="text-[10px] rounded-lg bg-yellow-500/10 text-yellow-600 border-0">Pending</Badge>}
          {isDeclined && <Badge variant="destructive" className="text-[10px] rounded-lg">Declined</Badge>}
          {isMember && !trip.is_owner && <Badge className="text-[10px] rounded-lg bg-green-500/10 text-green-600 border-0">Accepted</Badge>}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="outline" className="text-[10px] py-1 px-2 rounded-lg gap-1">
          <Users className="w-3 h-3" />{trip.member_count} members
        </Badge>
        <Badge variant="outline" className="text-[10px] py-1 px-2 rounded-lg gap-1">
          <Shield className="w-3 h-3" />{getGroupTypeLabel(trip.group_type)}
        </Badge>
      </div>

      {isMember ? (
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-gradient-primary text-white rounded-xl text-xs h-9" onClick={onChat}>
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Group Chat
          </Button>
          {trip.is_owner && (
            <Button size="sm" variant="outline" className="rounded-xl text-xs h-9" onClick={onManageRequests}>
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Requests
            </Button>
          )}
        </div>
      ) : isPending ? (
        <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-500/5 rounded-xl px-3 py-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Your request is pending review by the trip owner</span>
        </div>
      ) : isDeclined ? (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-xl px-3 py-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Your request was declined</span>
        </div>
      ) : null}
    </Card>
  );
};

export default CompanionPage;
