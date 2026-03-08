import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Users, Search, MapPin, Shield, CheckCircle, User, Compass,
  Mountain, Plus, Loader2, Calendar, ArrowRight, Send, Clock,
  MessageCircle, Eye, ChevronLeft, TrendingUp, UserCheck,
  Heart, Filter, X, RefreshCw,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCompanions, Companion } from "@/hooks/useCompanions";
import { useConnections } from "@/hooks/useConnections";
import { useGroups, useGroupMessages, Group } from "@/hooks/useGroups";
import { usePlans, Plan } from "@/hooks/usePlans";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import GroupChatDialog from "@/components/dialogs/GroupChatDialog";
import DirectChatDialog from "@/components/dialogs/DirectChatDialog";
import { format, formatDistanceToNow } from "date-fns";
import { useLikedCompanions } from "@/hooks/useLikedCompanions";

interface CompanionPageProps {
  onNavigateToAccount?: () => void;
  userCity?: string | null;
  onCreatePlan?: () => void;
}

const GROUP_CATEGORIES = [
  "Backpacking", "Road Trips", "Weekend Trips", "Adventure", "Food Trips", "Digital Nomads",
];


const INTEREST_LIST = [
  "Photography", "Trekking", "Food", "Culture", "Nightlife", "Shopping",
  "History", "Nature", "Adventure", "Spiritual", "Beach", "Mountains",
];

const CompanionPage: React.FC<CompanionPageProps> = ({ onNavigateToAccount, userCity, onCreatePlan }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");

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

  if (!currentUserId) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="bg-gradient-hero px-4 py-3 pb-5">
          <h1 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Companions
          </h1>
          <p className="text-primary-foreground/80 text-[10px]">Connect with verified travelers</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="p-6 text-center max-w-sm">
            <Compass className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="font-semibold text-lg mb-2">Find Companions</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Sign in to discover travel companions, join groups, and plan trips together.
            </p>
            <Button onClick={onNavigateToAccount} className="bg-gradient-primary text-primary-foreground">
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
      <div className="bg-gradient-hero px-4 py-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Companions
            </h1>
            <p className="text-primary-foreground/80 text-[10px]">Connect with verified travelers</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateToAccount}
            className="w-9 h-9 rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Common Search Bar */}
      <div className="px-4 pt-2 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search companions, groups, or destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs bg-card border shadow-soft h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-2 mb-0 h-10 bg-muted rounded-xl p-1">
          <TabsTrigger value="discover" className="flex-1 rounded-lg text-xs gap-1.5 data-[state=active]:bg-background">
            <Compass className="w-3.5 h-3.5" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1 rounded-lg text-xs gap-1.5 data-[state=active]:bg-background">
            <Users className="w-3.5 h-3.5" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="trips" className="flex-1 rounded-lg text-xs gap-1.5 data-[state=active]:bg-background">
            <Mountain className="w-3.5 h-3.5" />
            Trips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="flex-1 overflow-y-auto mt-0 pb-24">
          <DiscoverTab currentUserId={currentUserId} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="groups" className="flex-1 overflow-y-auto mt-0 pb-24">
          <GroupsTab currentUserId={currentUserId} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="trips" className="flex-1 overflow-y-auto mt-0 pb-24 relative">
          <TripsTab currentUserId={currentUserId} onNavigateToAccount={onNavigateToAccount} searchQuery={searchQuery} onCreatePlan={onCreatePlan} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ==================== DISCOVER TAB ====================
const DiscoverTab: React.FC<{ currentUserId: string; searchQuery: string }> = ({ currentUserId, searchQuery }) => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [radiusFilter, setRadiusFilter] = useState<number>(50);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 80]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Connect dialog
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [isSendingConnect, setIsSendingConnect] = useState(false);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState<{ id: string; name: string; avatar?: string | null } | null>(null);

  const { companions, isLoading, refetch } = useCompanions(currentUserId);
  const { connections, connectedUserIds, sendConnectionRequest, hasConnectionWith, getConnectionStatus } = useConnections(currentUserId);
  const { isLiked: isCompanionLiked, toggleLike } = useLikedCompanions(currentUserId);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredCompanions = useMemo(() => {
    return companions.filter(c => {
      // Search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchesName = c.display_name?.toLowerCase().includes(q);
        const matchesBio = c.bio?.toLowerCase().includes(q);
        const matchesInterests = c.interests?.some(i => i.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesInterests) return false;
      }
      // Gender
      if (genderFilter !== "all" && c.gender?.toLowerCase() !== genderFilter) return false;
      // Status
      if (statusFilter === "online" && !c.is_online) return false;
      // Radius
      if (c.distance !== undefined && c.distance > radiusFilter) return false;
      // Age
      if (c.age !== null && (c.age < ageRange[0] || c.age > ageRange[1])) return false;
      return true;
    });
  }, [companions, debouncedSearch, genderFilter, statusFilter, radiusFilter, ageRange]);

  const activeFilterCount = [
    genderFilter !== "all",
    statusFilter !== "all",
    radiusFilter < 50,
    ageRange[0] > 18 || ageRange[1] < 80,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setGenderFilter("all");
    setStatusFilter("all");
    setRadiusFilter(50);
    setAgeRange([18, 80]);
  };

  const handleConnect = async () => {
    if (!selectedCompanion) return;
    try {
      setIsSendingConnect(true);
      await sendConnectionRequest(selectedCompanion.user_id, connectMessage || undefined);
      toast.success(`Connection request sent to ${selectedCompanion.display_name}!`);
      setConnectDialogOpen(false);
      setConnectMessage("");
      setSelectedCompanion(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request");
    } finally {
      setIsSendingConnect(false);
    }
  };

  const handleLike = async (companion: Companion) => {
    try {
      await toggleLike(companion.user_id);
    } catch (err) {
      console.error(err);
    }
  };

  const isLiked = (userId: string) => isCompanionLiked(userId);

  return (
    <div className="px-4 pt-3 space-y-3">

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {genderFilter !== "all" && (
          <Badge variant="secondary" className="text-[10px] gap-1 rounded-lg">
            {genderFilter} <X className="w-3 h-3 cursor-pointer" onClick={() => setGenderFilter("all")} />
          </Badge>
        )}
        {statusFilter !== "all" && (
          <Badge variant="secondary" className="text-[10px] gap-1 rounded-lg">
            Online <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
          </Badge>
        )}
        {radiusFilter < 50 && (
          <Badge variant="secondary" className="text-[10px] gap-1 rounded-lg">
            {radiusFilter}km <X className="w-3 h-3 cursor-pointer" onClick={() => setRadiusFilter(50)} />
          </Badge>
        )}

        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-8 gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 rounded-2xl" align="start">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gender</label>
                <div className="flex gap-2">
                  {["all", "female", "male"].map(g => (
                    <Button
                      key={g}
                      size="sm"
                      variant={genderFilter === g ? "default" : "outline"}
                      className={cn("flex-1 rounded-xl text-xs h-8", genderFilter === g && "bg-gradient-primary text-primary-foreground border-0")}
                      onClick={() => setGenderFilter(g)}
                    >
                      {g === "all" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                <div className="flex gap-2">
                  {["all", "online"].map(s => (
                    <Button
                      key={s}
                      size="sm"
                      variant={statusFilter === s ? "default" : "outline"}
                      className={cn("flex-1 rounded-xl text-xs h-8", statusFilter === s && "bg-gradient-primary text-primary-foreground border-0")}
                      onClick={() => setStatusFilter(s)}
                    >
                      {s === "all" ? "All" : "Online"}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Radius: {radiusFilter} km
                </label>
                <Slider
                  value={[radiusFilter]}
                  onValueChange={([v]) => setRadiusFilter(v)}
                  min={1}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Age: {ageRange[0]} – {ageRange[1]}
                </label>
                <Slider
                  value={ageRange}
                  onValueChange={([min, max]) => setAgeRange([min, max])}
                  min={18}
                  max={80}
                  step={1}
                  className="mt-2"
                />
              </div>

              <Button variant="ghost" size="sm" className="w-full text-xs rounded-xl" onClick={resetFilters}>
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Reset Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Companions list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredCompanions.length === 0 ? (
        <Card className="p-6 text-center rounded-2xl">
          <Compass className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-sm">No companions match your filters</h3>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCompanions.map(companion => {
            const status = getConnectionStatus(companion.user_id);
            const isConnected = status === "accepted";
            const isPending = status === "pending";
            const liked = isLiked(companion.user_id);

            return (
              <Card key={companion.id} className="p-3 rounded-2xl shadow-soft border-0 bg-card">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={companion.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {companion.display_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {companion.is_online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm truncate">{companion.display_name || "Traveler"}</h4>
                      {companion.is_verified && <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />}
                      {companion.age && <span className="text-xs text-muted-foreground">{companion.age}</span>}
                    </div>

                    {(companion.distance !== undefined || companion.city) && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {companion.distance !== undefined && (
                          <span>{companion.distance < 1 ? "<1 km" : `${Math.round(companion.distance)} km`}</span>
                        )}
                        {companion.city && <span>{companion.distance !== undefined ? "• " : ""}{companion.city}</span>}
                      </div>
                    )}

                    {companion.bio && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{companion.bio}</p>
                    )}

                    {/* Interests */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(companion.interests || []).slice(0, 3).map(interest => (
                        <Badge key={interest} variant="secondary" className="text-[10px] py-0.5 px-1.5 rounded-md">
                          {interest}
                        </Badge>
                      ))}
                      {(companion.interests || []).length > 3 && (
                        <Badge variant="outline" className="text-[10px] py-0.5 px-1.5 rounded-md">
                          +{companion.interests.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      {isConnected ? (
                        <>
                          <Badge variant="secondary" className="text-[10px] gap-1 bg-success/10 text-success border-0 rounded-lg">
                            <CheckCircle className="w-3 h-3" />
                            Connected
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] rounded-lg gap-1"
                            onClick={() => {
                              setChatPartner({
                                id: companion.user_id,
                                name: companion.display_name || "Traveler",
                                avatar: companion.avatar_url,
                              });
                              setChatOpen(true);
                            }}
                          >
                            <MessageCircle className="w-3 h-3" />
                            Chat
                          </Button>
                        </>
                      ) : isPending ? (
                        <Badge variant="secondary" className="text-[10px] gap-1 rounded-lg">
                          <Clock className="w-3 h-3" />
                          Pending
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 text-[10px] rounded-lg bg-gradient-primary text-primary-foreground border-0 gap-1"
                          onClick={() => {
                            setSelectedCompanion(companion);
                            setConnectDialogOpen(true);
                          }}
                        >
                          <UserCheck className="w-3 h-3" />
                          Connect
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => handleLike(companion)}
                      >
                        <Heart className={cn("w-3.5 h-3.5", liked ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-primary" />
              Connect with {selectedCompanion?.display_name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Send a personalized message to introduce yourself
            </DialogDescription>
          </DialogHeader>

          {selectedCompanion && (
            <>
              <div className="p-3 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedCompanion.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedCompanion.display_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{selectedCompanion.display_name}{selectedCompanion.age ? `, ${selectedCompanion.age}` : ""}</h4>
                      {selectedCompanion.is_verified && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                    </div>
                    {selectedCompanion.city && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" /> {selectedCompanion.city}
                      </div>
                    )}
                    {selectedCompanion.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedCompanion.bio}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(selectedCompanion.interests || []).map(interest => (
                    <Badge key={interest} variant="secondary" className="text-[10px]">{interest}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Your message (optional)</label>
                <Textarea
                  placeholder={`Hi ${selectedCompanion.display_name}! I'd love to connect...`}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  className="min-h-[80px] resize-none rounded-xl text-sm"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setConnectDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button
                  onClick={handleConnect}
                  disabled={isSendingConnect}
                  className="bg-gradient-primary text-primary-foreground border-0 rounded-xl gap-1.5"
                >
                  {isSendingConnect ? "Sending..." : <><Send className="w-3.5 h-3.5" />Send Request</>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Direct Chat */}
      <DirectChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        currentUserId={currentUserId}
        partnerId={chatPartner?.id || null}
        partnerName={chatPartner?.name || ""}
        partnerAvatar={chatPartner?.avatar}
      />
    </div>
  );
};

// ==================== GROUPS TAB ====================
const GroupsTab: React.FC<{ currentUserId: string; searchQuery: string }> = ({ currentUserId, searchQuery }) => {
  const { groups, isLoading, createGroup, joinGroup, leaveGroup, refetch } = useGroups(currentUserId);

  // Create group
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Group chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatGroup, setChatGroup] = useState<Group | null>(null);

  // Group members
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Direct chat from group
  const [directChatOpen, setDirectChatOpen] = useState(false);
  const [directChatPartner, setDirectChatPartner] = useState<{ id: string; name: string; avatar?: string | null } | null>(null);

  // Connection request dialog from group member
  const [connectFromGroupOpen, setConnectFromGroupOpen] = useState(false);
  const [connectFromGroupUser, setConnectFromGroupUser] = useState<any>(null);

  const { connectedUserIds, sendConnectionRequest, getConnectionStatus } = useConnections(currentUserId);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !newGroupCategory) {
      toast.error("Name and category are required");
      return;
    }
    try {
      setIsCreatingGroup(true);
      await createGroup(newGroupName.trim(), newGroupDescription, newGroupCategory);
      toast.success("Group created!");
      setCreateDialogOpen(false);
      setNewGroupName("");
      setNewGroupCategory("");
      setNewGroupDescription("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      toast.success("Joined group!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to join group");
    }
  };

  const handleLeave = async (groupId: string) => {
    try {
      await leaveGroup(groupId);
      toast.success("Left group");
    } catch (err) {
      console.error(err);
      toast.error("Failed to leave group");
    }
  };

  const openGroupMembers = async (group: Group) => {
    setViewingGroup(group);
    setMembersDialogOpen(true);
    setLoadingMembers(true);
    try {
      const { data: members } = await supabase
        .from("group_members")
        .select("user_id, joined_at")
        .eq("group_id", group.id);

      if (members && members.length > 0) {
        const userIds = members.map(m => m.user_id);
        const [profilesRes, presenceRes] = await Promise.all([
          supabase.from("profiles").select("user_id, display_name, avatar_url, is_verified").in("user_id", userIds),
          supabase.from("user_presence").select("user_id, is_online").in("user_id", userIds),
        ]);

        const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p]));
        const presenceMap = new Map((presenceRes.data || []).map(p => [p.user_id, p.is_online]));

        setGroupMembers(
          members.map(m => ({
            user_id: m.user_id,
            joined_at: m.joined_at,
            ...profileMap.get(m.user_id),
            is_online: presenceMap.get(m.user_id) || false,
          }))
        );
      } else {
        setGroupMembers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleMessageMember = (member: any) => {
    const status = getConnectionStatus(member.user_id);
    if (status === "accepted") {
      setDirectChatPartner({
        id: member.user_id,
        name: member.display_name || "User",
        avatar: member.avatar_url,
      });
      setDirectChatOpen(true);
    } else {
      setConnectFromGroupUser(member);
      setConnectFromGroupOpen(true);
    }
  };

  const handleSendConnectFromGroup = async () => {
    if (!connectFromGroupUser) return;
    try {
      await sendConnectionRequest(connectFromGroupUser.user_id, "Hi! I'd like to connect from our group.");
      toast.success("Connection request sent!");
      setConnectFromGroupOpen(false);
      setConnectFromGroupUser(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "backpacking": return "🎒";
      case "road trips": return "🚗";
      case "weekend trips": return "🏕️";
      case "adventure": return "⛰️";
      case "food trips": return "🍜";
      case "digital nomads": return "💻";
      default: return "✈️";
    }
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  return (
    <div className="px-4 pt-3 space-y-3">
      {/* Create Group Button */}
      <Button
        className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-10 text-xs gap-1.5"
        onClick={() => setCreateDialogOpen(true)}
      >
        <Plus className="w-4 h-4" />
        Create New Group
      </Button>

      {/* Groups list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card className="p-6 text-center rounded-2xl">
          <Users className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-sm">{searchQuery ? "No groups match your search" : "No groups yet"}</h3>
          <p className="text-xs text-muted-foreground mt-1">{searchQuery ? "Try a different search term." : "Be the first to create a travel community!"}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map(group => (
            <Card key={group.id} className="p-3 rounded-2xl shadow-soft border-0 bg-card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-lg flex-shrink-0">
                  {getCategoryIcon(group.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate">{group.name}</h4>
                    {group.last_activity && (
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 rounded-md">{group.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">{group.member_count} members</span>
                    {group.last_activity && (
                      <span className="text-[10px] text-muted-foreground">
                        • {formatDistanceToNow(new Date(group.last_activity), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {group.is_member ? (
                      <>
                        <Button
                          size="sm"
                          className="h-7 text-[10px] rounded-lg bg-gradient-primary text-primary-foreground border-0 gap-1"
                          onClick={() => {
                            setChatGroup(group);
                            setChatOpen(true);
                          }}
                        >
                          <MessageCircle className="w-3 h-3" />
                          Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] rounded-lg gap-1"
                          onClick={() => openGroupMembers(group)}
                        >
                          <Users className="w-3 h-3" />
                          Members
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px] rounded-lg text-destructive"
                          onClick={() => handleLeave(group.id)}
                        >
                          Leave
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="h-7 text-[10px] rounded-lg bg-gradient-primary text-primary-foreground border-0 gap-1"
                        onClick={() => handleJoin(group.id)}
                      >
                        <Plus className="w-3 h-3" />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4 text-primary" />
              Create New Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Group Name *</label>
              <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g., Backpackers India" className="rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
              <Select value={newGroupCategory} onValueChange={setNewGroupCategory}>
                <SelectTrigger className="rounded-xl text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {GROUP_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <Textarea
                value={newGroupDescription}
                onChange={e => setNewGroupDescription(e.target.value)}
                placeholder="What's this group about?"
                className="rounded-xl text-sm resize-none"
                rows={3}
              />
            </div>
            <Button
              className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-10"
              onClick={handleCreateGroup}
              disabled={isCreatingGroup}
            >
              {isCreatingGroup ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              {viewingGroup?.name} — Members
            </DialogTitle>
          </DialogHeader>
          {loadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : groupMembers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No members yet</p>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {groupMembers.filter(m => m.user_id !== currentUserId).map(member => (
                <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50">
                  <div className="relative">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.display_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {member.is_online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium truncate">{member.display_name || "User"}</span>
                      {member.is_verified && <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {member.is_online ? "Online" : "Offline"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] rounded-lg gap-1"
                    onClick={() => handleMessageMember(member)}
                  >
                    <MessageCircle className="w-3 h-3" />
                    Message
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Connect from group dialog */}
      <Dialog open={connectFromGroupOpen} onOpenChange={setConnectFromGroupOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Send connection request?</DialogTitle>
            <DialogDescription className="text-xs">
              You need to be connected with {connectFromGroupUser?.display_name} before messaging.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConnectFromGroupOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              className="bg-gradient-primary text-primary-foreground rounded-xl gap-1.5"
              onClick={handleSendConnectFromGroup}
            >
              <Send className="w-3.5 h-3.5" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Chat */}
      <GroupChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        groupId={chatGroup?.id || null}
        groupName={chatGroup?.name || ""}
        currentUserId={currentUserId}
      />

      {/* Direct Chat */}
      <DirectChatDialog
        open={directChatOpen}
        onOpenChange={setDirectChatOpen}
        currentUserId={currentUserId}
        partnerId={directChatPartner?.id || null}
        partnerName={directChatPartner?.name || ""}
        partnerAvatar={directChatPartner?.avatar}
      />
    </div>
  );
};

// ==================== TRIPS TAB ====================
const TripsTab: React.FC<{ currentUserId: string; onNavigateToAccount?: () => void; searchQuery: string; onCreatePlan?: () => void }> = ({ currentUserId, onNavigateToAccount, searchQuery, onCreatePlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const { plans, isLoading, fetchPlans, requestToJoin } = usePlans(currentUserId);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => fetchPlans(searchQuery), 300);
      return () => clearTimeout(timer);
    } else if (searchQuery.length === 0) {
      fetchPlans();
    }
  }, [searchQuery, fetchPlans]);

  const handleJoinRequest = async () => {
    if (!selectedPlan) return;
    setIsJoining(true);
    try {
      await requestToJoin(selectedPlan.id, joinMessage || undefined);
      toast.success("Join request sent! ✈️");
      setSelectedPlan(null);
      setJoinMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
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

  return (
    <div className="px-4 pt-3 space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20">
          <Mountain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">No plans yet</p>
          <p className="text-sm text-muted-foreground">Be the first to create a plan!</p>
        </div>
      ) : (
        plans.map(plan => {
          const badge = getGroupBadge(plan.group_type);
          return (
            <Card key={plan.id} className="overflow-hidden rounded-2xl border-border shadow-sm">
              {/* Cover Image */}
              <div className="aspect-[16/9] relative bg-muted">
                {plan.cover_image_url ? (
                  <img
                    src={plan.cover_image_url}
                    alt={plan.plan_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <MapPin className="w-12 h-12 text-primary/40" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={cn("text-xs", badge.color)}>{badge.label}</Badge>
                  <Badge className={cn("text-xs", plan.plan_visibility === "public" ? "bg-accent/80 text-accent-foreground" : "bg-muted/80 text-muted-foreground")}>
                    {plan.plan_visibility === "public" ? <Eye className="w-3 h-3 mr-1" /> : null}
                    {plan.plan_visibility === "public" ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <h3 className="font-bold text-lg leading-tight">{plan.plan_name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{plan.destination_name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(plan.start_date), "MMM dd")} – {format(new Date(plan.end_date), "MMM dd")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{plan.member_count || 1} / {plan.max_members}</span>
                  </div>
                </div>

                {/* Interests */}
                {plan.interests && plan.interests.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {plan.interests.map(i => (
                      <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                    ))}
                  </div>
                )}

                {/* Action */}
                {plan.is_owner ? (
                  <Badge className="bg-primary/10 text-primary">Your Plan</Badge>
                ) : plan.is_member ? (
                  <Badge className="bg-green-500/10 text-green-600">Joined</Badge>
                ) : plan.my_request_status === "pending" ? (
                  <Badge className="bg-yellow-500/10 text-yellow-600">
                    <Clock className="w-3 h-3 mr-1" /> Pending
                  </Badge>
                ) : plan.my_request_status === "rejected" ? (
                  <Badge className="bg-destructive/10 text-destructive">Declined</Badge>
                ) : (
                  <Button
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full rounded-xl bg-gradient-primary"
                    size="sm"
                  >
                    Request to Join <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      )}

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

export default CompanionPage;
