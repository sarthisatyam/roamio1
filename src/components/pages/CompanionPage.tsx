import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Users,
  Search,
  Filter,
  MapPin,
  Clock,
  MessageCircle,
  Shield,
  Camera,
  Coffee,
  Briefcase,
  Music,
  CheckCircle,
  Heart,
  UserPlus,
  User,
  Compass,
  Zap,
  Mountain,
  Plus,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCompanions, Companion } from "@/hooks/useCompanions";
import { useGroups, Group } from "@/hooks/useGroups";
import { useConnections } from "@/hooks/useConnections";
import { useLikedCompanions } from "@/hooks/useLikedCompanions";
import { usePresence } from "@/hooks/usePresence";
import GroupChatDialog from "@/components/dialogs/GroupChatDialog";

interface CompanionPageProps {
  onNavigateToAccount?: () => void;
  userCity?: string | null;
}

const CompanionPage: React.FC<CompanionPageProps> = ({ onNavigateToAccount, userCity }) => {
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [isSendingConnection, setIsSendingConnection] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedGroupForChat, setSelectedGroupForChat] = useState<Group | null>(null);
  const [filters, setFilters] = useState({
    gender: "all",
    status: "all",
    radius: [50],
    ageRange: [18, 65],
    interests: [] as string[],
  });

  // Auth state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();

  // Initialize auth and location
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    // Get user location via geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation not available:", error);
          // Fallback: try to geocode from userCity if available
          if (userCity) {
            // Use a simple geocoding approach for major Indian cities
            const cityCoords: Record<string, { lat: number; lng: number }> = {
              "Delhi": { lat: 28.6139, lng: 77.2090 },
              "New Delhi": { lat: 28.6139, lng: 77.2090 },
              "Mumbai": { lat: 19.0760, lng: 72.8777 },
              "Bangalore": { lat: 12.9716, lng: 77.5946 },
              "Bengaluru": { lat: 12.9716, lng: 77.5946 },
              "Chennai": { lat: 13.0827, lng: 80.2707 },
              "Kolkata": { lat: 22.5726, lng: 88.3639 },
              "Hyderabad": { lat: 17.3850, lng: 78.4867 },
              "Pune": { lat: 18.5204, lng: 73.8567 },
              "Jaipur": { lat: 26.9124, lng: 75.7873 },
              "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
              "Goa": { lat: 15.2993, lng: 74.1240 },
              "Manali": { lat: 32.2396, lng: 77.1887 },
              "Udaipur": { lat: 24.5854, lng: 73.7125 },
              "Varanasi": { lat: 25.3176, lng: 82.9739 },
              "Rishikesh": { lat: 30.0869, lng: 78.2676 },
              "Shimla": { lat: 31.1048, lng: 77.1734 },
              "Agra": { lat: 27.1767, lng: 78.0081 },
              "Lucknow": { lat: 26.8467, lng: 80.9462 },
              "Kochi": { lat: 9.9312, lng: 76.2673 },
              "Thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
            };
            
            const normalizedCity = userCity.trim();
            const coords = cityCoords[normalizedCity];
            if (coords) {
              setUserLocation(coords);
            }
          }
        },
      );
    }

    return () => subscription.unsubscribe();
  }, []);

  // Track user presence
  usePresence(currentUserId);

  // Data hooks
  const { companions, isLoading: companionsLoading } = useCompanions(currentUserId, userLocation);
  const { groups, isLoading: groupsLoading, createGroup, joinGroup, leaveGroup } = useGroups(currentUserId);
  const { sendConnectionRequest, getConnectionStatus } = useConnections(currentUserId);
  const { toggleLike, isLiked } = useLikedCompanions(currentUserId);

  // Filter companions based on search and filters
  const filteredCompanions = companions.filter((companion) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        companion.display_name?.toLowerCase().includes(query) ||
        companion.bio?.toLowerCase().includes(query) ||
        companion.interests.some((i) => i.toLowerCase().includes(query)) ||
        companion.city?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (filters.gender !== "all" && companion.gender !== filters.gender) {
      return false;
    }
    if (filters.status === "online" && !companion.is_online) {
      return false;
    }
    if (companion.distance !== undefined && companion.distance > filters.radius[0]) {
      return false;
    }
    if (companion.age !== null) {
      if (companion.age < filters.ageRange[0] || companion.age > filters.ageRange[1]) {
        return false;
      }
    }
    if (filters.interests.length > 0) {
      const hasMatchingInterest = filters.interests.some((interest) => companion.interests.includes(interest));
      if (!hasMatchingInterest) {
        return false;
      }
    }
    return true;
  });

  const handleConnect = async () => {
    if (!selectedCompanion || !currentUserId) return;

    try {
      setIsSendingConnection(true);
      await sendConnectionRequest(selectedCompanion.user_id, connectMessage);
      toast.success("Connection request sent!");
      setConnectDialogOpen(false);
      setConnectMessage("");
      setSelectedCompanion(null);
    } catch (err) {
      console.error("Failed to send connection:", err);
      toast.error("Failed to send connection request");
    } finally {
      setIsSendingConnection(false);
    }
  };

  const handleToggleLike = async (userId: string) => {
    try {
      await toggleLike(userId);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      toast.error("Failed to update like");
    }
  };

  const handleJoinGroup = async (groupId: string, isMember: boolean) => {
    try {
      if (isMember) {
        await leaveGroup(groupId);
        toast.success("Left the group");
      } else {
        await joinGroup(groupId);
        toast.success("Joined the group successfully!");
      }
    } catch (err) {
      console.error("Failed to join/leave group:", err);
      toast.error("Failed to update group membership");
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (!newGroupCategory.trim()) {
      toast.error("Please enter a category");
      return;
    }

    try {
      setIsCreatingGroup(true);
      await createGroup(newGroupName.trim(), newGroupDescription.trim(), newGroupCategory.trim());
      toast.success(`Group "${newGroupName}" created successfully!`);
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupCategory("");
      setCreateGroupOpen(false);
    } catch (err) {
      console.error("Failed to create group:", err);
      toast.error("Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const openGroupChat = (group: Group) => {
    setSelectedGroupForChat(group);
    setChatDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ElementType> = {
      Coworking: Briefcase,
      Safety: Shield,
      Food: Coffee,
      Adventure: Mountain,
      Photography: Camera,
      Music: Music,
      Travel: Compass,
    };
    return iconMap[category] || Users;
  };

  const interestIcons: Record<string, React.ReactNode> = {
    Coworking: <Briefcase className="w-3 h-3" />,
    "Chai Spots": <Coffee className="w-3 h-3" />,
    Photography: <Camera className="w-3 h-3" />,
    Temples: <Mountain className="w-3 h-3" />,
    Heritage: <Compass className="w-3 h-3" />,
    "Local Markets": <MapPin className="w-3 h-3" />,
    Trekking: <Compass className="w-3 h-3" />,
    "Adventure Sports": <Zap className="w-3 h-3" />,
    "Street Food": <Coffee className="w-3 h-3" />,
    "Cultural Events": <Music className="w-3 h-3" />,
  };

  // Show login prompt if not authenticated
  if (!currentUserId) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="bg-gradient-hero px-4 py-3 pb-5">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4" />
            Companions
          </h1>
          <p className="text-white/80 text-[10px]">Connect with verified travelers</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="p-6 text-center max-w-sm">
            <Users className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="font-semibold text-lg mb-2">Join the Community</h2>
            <p className="text-muted-foreground text-sm mb-4">Sign in to discover and connect with other travelers</p>
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
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Companions
            </h1>
            <p className="text-white/80 text-[10px]">Connect with verified travelers</p>
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by interests or cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs bg-white/95 backdrop-blur border-0 shadow-medium h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-[calc(100%-2rem)] grid-cols-2 mx-4 mt-3 h-11 rounded-xl bg-muted">
            <TabsTrigger
              value="discover"
              className="text-xs rounded-lg flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Compass className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="text-xs rounded-lg flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="w-4 h-4" />
              Groups
            </TabsTrigger>
          </TabsList>

          {/* Filters - only show on Discover tab */}
          {activeTab === "discover" && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                  <Badge
                    variant={filters.gender !== "all" ? "default" : "secondary"}
                    className="gap-1 text-[10px] whitespace-nowrap py-1 px-2.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <Users className="w-3 h-3" />
                    {filters.gender === "all" ? "All" : filters.gender === "female" ? "Female" : "Male"}
                  </Badge>
                  <Badge
                    variant={filters.radius[0] !== 50 ? "default" : "secondary"}
                    className="gap-1 text-[10px] whitespace-nowrap py-1 px-2.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <MapPin className="w-3 h-3" />
                    {filters.radius[0]}km
                  </Badge>
                  <Badge
                    variant={filters.status !== "all" ? "default" : "secondary"}
                    className="gap-1 text-[10px] whitespace-nowrap py-1 px-2.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <Clock className="w-3 h-3" />
                    {filters.status === "all" ? "All" : "Online"}
                  </Badge>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs rounded-lg px-3 flex-shrink-0 border-dashed"
                    >
                      <Filter className="w-3.5 h-3.5 mr-1.5" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4 rounded-xl bg-popover" align="end">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Filter Companions
                      </h4>

                      {/* Gender Filter */}
                      <div>
                        <label className="text-xs font-medium mb-2 block text-muted-foreground">Gender</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {["all", "female", "male"].map((gender) => (
                            <Button
                              key={gender}
                              variant={filters.gender === gender ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFilters((prev) => ({ ...prev, gender }))}
                              className={cn(
                                "capitalize text-xs h-8 rounded-lg",
                                filters.gender === gender && "bg-gradient-primary text-white border-0",
                              )}
                            >
                              {gender}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="text-xs font-medium mb-2 block text-muted-foreground">Status</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {["all", "online"].map((status) => (
                            <Button
                              key={status}
                              variant={filters.status === status ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFilters((prev) => ({ ...prev, status }))}
                              className={cn(
                                "capitalize text-xs h-8 rounded-lg",
                                filters.status === status && "bg-gradient-primary text-white border-0",
                              )}
                            >
                              {status === "online" && <div className="w-2 h-2 rounded-full bg-success mr-1.5" />}
                              {status}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Radius Filter */}
                      <div>
                        <label className="text-xs font-medium mb-2 block text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-primary" />
                          Radius: {filters.radius[0]}km
                        </label>
                        <Slider
                          value={filters.radius}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, radius: value }))}
                          max={100}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Age Range Filter */}
                      <div>
                        <label className="text-xs font-medium mb-2 block text-muted-foreground">
                          Age: {filters.ageRange[0]}-{filters.ageRange[1]}
                        </label>
                        <Slider
                          value={filters.ageRange}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, ageRange: value }))}
                          max={80}
                          min={18}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Reset Filters */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFilters({
                            gender: "all",
                            status: "all",
                            radius: [50],
                            ageRange: [18, 65],
                            interests: [],
                          })
                        }
                        className="w-full text-xs h-9 rounded-lg"
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Discover Tab */}
          <TabsContent value="discover" className="flex-1 overflow-y-auto px-4 pt-1 pb-20">
            {companionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompanions.map((companion) => {
                  const connectionStatus = getConnectionStatus(companion.user_id);
                  const isConnected = connectionStatus === "accepted";
                  const isPending = connectionStatus === "pending";

                  return (
                    <Card
                      key={companion.id}
                      className="p-3 shadow-soft rounded-2xl border-0 cursor-pointer hover:shadow-medium transition-all bg-card"
                      onClick={() => {
                        setSelectedCompanion(companion);
                        setConnectDialogOpen(true);
                      }}
                    >
                      <div className="flex gap-3">
                        {/* Profile Image */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                            {companion.avatar_url ? (
                              <img
                                src={companion.avatar_url}
                                alt={companion.display_name || "User"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          {companion.is_online && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          {/* Header Row */}
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-semibold text-sm text-foreground">
                                {companion.display_name || "Anonymous"}
                              </h3>
                              {companion.is_verified && (
                                <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              {companion.age && (
                                <>
                                  <span className="font-medium">{companion.age} years</span>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                </>
                              )}
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>
                                  {companion.distance !== undefined
                                    ? `${companion.distance.toFixed(1)} km away`
                                    : companion.city || "Location unknown"}
                                </span>
                              </div>
                            </div>

                            {/* Interests */}
                            {companion.interests.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {companion.interests.slice(0, 3).map((interest) => (
                                  <Badge
                                    key={interest}
                                    variant="secondary"
                                    className="text-[10px] py-0.5 px-2 rounded-lg bg-primary/10 text-primary border-0"
                                  >
                                    {interest}
                                  </Badge>
                                ))}
                                {companion.interests.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] py-0.5 px-2 rounded-lg bg-muted text-muted-foreground border-0"
                                  >
                                    +{companion.interests.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              className={cn(
                                "text-xs h-9 rounded-xl px-4 flex-1",
                                isConnected
                                  ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                                  : isPending
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-gradient-primary text-white border-0 shadow-sm",
                              )}
                              onClick={() => {
                                if (!isConnected && !isPending) {
                                  setSelectedCompanion(companion);
                                  setConnectDialogOpen(true);
                                }
                              }}
                              disabled={isConnected || isPending}
                            >
                              {isConnected ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1.5" />
                                  Connected
                                </>
                              ) : isPending ? (
                                <>
                                  <Clock className="w-4 h-4 mr-1.5" />
                                  Pending
                                </>
                              ) : (
                                <>
                                  <MessageCircle className="w-4 h-4 mr-1.5" />
                                  Connect
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleLike(companion.user_id)}
                              className={cn(
                                "w-9 h-9 rounded-xl transition-all flex-shrink-0",
                                isLiked(companion.user_id)
                                  ? "text-destructive bg-destructive/10 border-destructive/30"
                                  : "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                              )}
                            >
                              <Heart className={cn("w-4 h-4", isLiked(companion.user_id) && "fill-current")} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {filteredCompanions.length === 0 && (
                  <Card className="p-6 text-center">
                    <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-semibold text-base mb-1">No companions found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? `No results for "${searchQuery}"` : "No registered travelers nearby yet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Invite your friends to join the community!</p>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
            {/* Create Group Button */}
            <Button
              onClick={() => setCreateGroupOpen(true)}
              className="w-full mb-3 bg-gradient-primary text-white border-0 rounded-xl h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Group
            </Button>

            {groupsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : groups.length === 0 ? (
              <Card className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-semibold text-base mb-1">No groups yet</h3>
                <p className="text-sm text-muted-foreground">Be the first to create a group!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => {
                  const IconComponent = getCategoryIcon(group.category);
                  const isJoined = group.is_member;

                  return (
                    <Card
                      key={group.id}
                      className="p-4 shadow-soft rounded-2xl border-0 transition-all hover:shadow-medium hover:scale-[1.01]"
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                            isJoined
                              ? "bg-gradient-to-br from-primary to-primary/80"
                              : "bg-gradient-to-br from-primary/20 to-primary/5",
                          )}
                        >
                          <IconComponent className={cn("w-7 h-7", isJoined ? "text-white" : "text-primary")} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-foreground truncate">{group.name}</h3>
                              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  <span className="font-medium">{group.member_count}</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] py-0.5 px-2 rounded-full bg-secondary/80 font-medium"
                                >
                                  {group.category}
                                </Badge>
                              </div>
                            </div>
                            {/* Activity Badge */}
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-[10px] text-muted-foreground flex-shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                              <span>Active</span>
                            </div>
                          </div>

                          {/* Description */}
                          {group.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                              {group.description}
                            </p>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={isJoined ? "outline" : "default"}
                              className={cn(
                                "text-xs h-9 rounded-xl px-4 flex-1",
                                !isJoined && "bg-gradient-primary text-white border-0 shadow-sm",
                              )}
                              onClick={() => handleJoinGroup(group.id, isJoined)}
                            >
                              {isJoined ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1.5" />
                                  Joined
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 mr-1.5" />
                                  Join Group
                                </>
                              )}
                            </Button>
                            {isJoined && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-9 rounded-xl px-4"
                                onClick={() => openGroupChat(group)}
                              >
                                <MessageCircle className="w-4 h-4 mr-1.5" />
                                Chat
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Connect with {selectedCompanion?.display_name || "Traveler"}
            </DialogTitle>
            <DialogDescription>Send a connection request with an optional message</DialogDescription>
          </DialogHeader>

          {selectedCompanion && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                  {selectedCompanion.avatar_url ? (
                    <img
                      src={selectedCompanion.avatar_url}
                      alt={selectedCompanion.display_name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{selectedCompanion.display_name || "Anonymous"}</h4>
                  <p className="text-xs text-muted-foreground">{selectedCompanion.city || "Location unknown"}</p>
                </div>
              </div>

              {selectedCompanion.bio && <p className="text-sm text-muted-foreground">{selectedCompanion.bio}</p>}

              <div className="space-y-2">
                <label className="text-sm font-medium">Message (optional)</label>
                <Textarea
                  placeholder="Hi! I'd love to connect..."
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  className="min-h-[80px] resize-none rounded-xl"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConnectDialogOpen(false);
                setConnectMessage("");
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isSendingConnection}
              className="bg-gradient-primary text-white border-0 rounded-xl"
            >
              {isSendingConnection ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Create New Group
            </DialogTitle>
            <DialogDescription>Start a community for travelers with shared interests</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input
                placeholder="e.g., Backpackers India"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                placeholder="e.g., Adventure, Food, Culture"
                value={newGroupCategory}
                onChange={(e) => setNewGroupCategory(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="What's your group about?"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="min-h-[80px] resize-none rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateGroupOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={isCreatingGroup}
              className="bg-gradient-primary text-white border-0 rounded-xl"
            >
              {isCreatingGroup ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Chat Dialog */}
      <GroupChatDialog
        open={chatDialogOpen}
        onOpenChange={setChatDialogOpen}
        groupId={selectedGroupForChat?.id || null}
        groupName={selectedGroupForChat?.name || ""}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default CompanionPage;
