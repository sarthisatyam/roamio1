import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Users,
  Shield,
  Crown,
  Headphones,
  LogOut,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Heart,
  Star,
  Bookmark,
  Settings,
  CheckCircle,
  Calendar,
  Languages,
  MessageCircle,
  Eye,
  Clock,
  TrendingUp,
  UserCheck,
  UserMinus,
  DoorOpen,
  Trash2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  EmergencyDialog, 
  ParentalControlDialog, 
  VerifyDialog, 
  SupportDialog, 
  MyCoCompanionDialog,
  MyInterestsDialog,
  TravelListDialog
} from "@/components/dialogs/AccountSectionDialogs";
import TravelGuideDialog from "@/components/dialogs/TravelGuideDialog";
import { HelpLegalDialog } from "@/components/dialogs/LegalContactDialogs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupChatDialog from "@/components/dialogs/GroupChatDialog";
import { supabase } from "@/integrations/supabase/client";
import { usePlans, Plan, JoinRequest } from "@/hooks/usePlans";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AccountPageProps {
  userData: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean } | null;
  onNavigateBack: () => void;
  onLogout: () => void;
  likedCompanions?: number[];
  bookmarkedPlaces?: { id: number; name: string; image: string }[];
  onLocationToggle?: (enabled: boolean) => void;
  currentCity?: string | null;
}

const AccountPage: React.FC<AccountPageProps> = ({ userData, onNavigateBack, onLogout, likedCompanions = [], bookmarkedPlaces = [], onLocationToggle, currentCity }) => {
  const accountType = "Free";
  const [userProfile, setUserProfile] = useState<{
    gender?: string | null;
    age?: number | null;
    bio?: string | null;
    interests?: string[] | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null>(null);
  
  // Dialog states
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [parentalDialogOpen, setParentalDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [myTripsDialogOpen, setMyTripsDialogOpen] = useState(false);
  const [travelGuideDialogOpen, setTravelGuideDialogOpen] = useState(false);
  const [coCompanionDialogOpen, setCoCompanionDialogOpen] = useState(false);
  const [interestsDialogOpen, setInterestsDialogOpen] = useState(false);
  const [travelListDialogOpen, setTravelListDialogOpen] = useState(false);
  const [helpLegalDialogOpen, setHelpLegalDialogOpen] = useState(false);

  // Trips state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [managingPlan, setManagingPlan] = useState<Plan | null>(null);
  const [planMembers, setPlanMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [tripChatOpen, setTripChatOpen] = useState(false);
  const [chatPlan, setChatPlan] = useState<{ groupId: string; groupName: string } | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      setCurrentUserId(userId);
      if (userId) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('gender, age, bio, interests, display_name, avatar_url')
          .eq('user_id', userId)
          .single();
        if (profile) setUserProfile(profile);
      }
    };
    getSession();
  }, []);

  const { myPlans, fetchMyPlans, handleJoinRequest, getPendingRequests, leavePlan, removeMember, getPlanMembers } = usePlans(currentUserId);

  const openManageMembers = async (plan: Plan) => {
    setMembersPlan(plan);
    setLoadingMembers(true);
    setMembersDialogOpen(true);
    try {
      const members = await getPlanMembers(plan.id);
      setPlanMembers(members);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleRemoveMember = async (planId: string, userId: string) => {
    try {
      await removeMember(planId, userId);
      setPlanMembers(prev => prev.filter(m => m.user_id !== userId));
      toast.success("Member removed from trip and group");
      await fetchMyPlans();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleLeavePlan = async (planId: string) => {
    try {
      await leavePlan(planId);
      toast.success("You left the trip");
      await fetchMyPlans();
    } catch {
      toast.error("Failed to leave trip");
    }
  };

  const getGroupBadge = (type: string) => {
    if (type === "females_only") return { label: "Females Only", color: "bg-pink-500/10 text-pink-600" };
    if (type === "males_only") return { label: "Males Only", color: "bg-blue-500/10 text-blue-600" };
    return { label: "Everyone", color: "bg-green-500/10 text-green-600" };
  };
  const openManageRequests = async (plan: Plan) => {
    setManagingPlan(plan);
    setLoadingRequests(true);
    setRequestsDialogOpen(true);
    try {
      const reqs = await getPendingRequests(plan.id);
      setPendingRequests(reqs);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleReviewRequest = async (req: JoinRequest, action: "approved" | "rejected") => {
    try {
      await handleJoinRequest(req.id, action, req.plan_id, req.user_id);
      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
      toast.success(action === "approved" ? "Request approved!" : "Request rejected.");
      await fetchMyPlans();
    } catch {
      toast.error("Failed to process request");
    }
  };
  // Dynamic liked companions from database
  const [dynamicCompanions, setDynamicCompanions] = useState<{
    id: string;
    name: string;
    profileImage: string;
    age: number | null;
    location: string;
    bio: string;
    interests: string[];
    gender: string;
    status: string;
  }[]>([]);

  useEffect(() => {
    if (!currentUserId) return;
    const fetchLikedCompanions = async () => {
      const { data: liked } = await supabase
        .from('liked_companions')
        .select('liked_user_id')
        .eq('user_id', currentUserId);
      if (!liked || liked.length === 0) { setDynamicCompanions([]); return; }
      
      const likedIds = liked.map(l => l.liked_user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, age, city, bio, interests, gender')
        .in('user_id', likedIds);
      
      if (profiles) {
        // Check presence
        const { data: presenceData } = await supabase
          .from('user_presence')
          .select('user_id, is_online')
          .in('user_id', likedIds);
        const presenceMap = new Map(presenceData?.map(p => [p.user_id, p.is_online]) || []);

        setDynamicCompanions(profiles.map(p => ({
          id: p.user_id,
          name: p.display_name || 'Traveler',
          profileImage: (p.display_name || 'T').charAt(0).toUpperCase(),
          age: p.age,
          location: p.city || 'India',
          bio: p.bio || 'Fellow traveler',
          interests: p.interests || [],
          gender: p.gender || 'Not specified',
          status: presenceMap.get(p.user_id) ? 'online' : 'offline',
        })));
      }
    };
    fetchLikedCompanions();
  }, [currentUserId]);

  const likedCompanionProfiles = dynamicCompanions;

  const menuItems = [
    {
      icon: Calendar,
      title: "My Trips",
      description: "View and manage your trips",
      color: "text-primary",
      bgColor: "bg-primary/10",
      action: () => { setMyTripsDialogOpen(true); fetchMyPlans(); }
    },
    {
      icon: Users,
      title: "My Co-Companion",
      description: `${likedCompanionProfiles.length} saved companions`,
      color: "text-primary",
      bgColor: "bg-primary/10",
      action: () => setCoCompanionDialogOpen(true),
      companions: likedCompanionProfiles
    },
    {
      icon: Bookmark,
      title: "Travel List",
      description: `${bookmarkedPlaces.length} saved destinations`,
      color: "text-success",
      bgColor: "bg-success/10",
      action: () => setTravelListDialogOpen(true),
      places: bookmarkedPlaces
    },
    {
      icon: Languages,
      title: "Travel Guide",
      description: "Language assistant and travel tips",
      color: "text-warning",
      bgColor: "bg-warning/10",
      action: () => setTravelGuideDialogOpen(true)
    },
    {
      icon: Shield,
      title: "Emergency Details",
      description: "Emergency contacts and safety information",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      action: () => setEmergencyDialogOpen(true)
    },
    {
      icon: Settings,
      title: "Parental Control",
      description: "Manage safety settings and restrictions",
      color: "text-warning",
      bgColor: "bg-warning/10",
      action: () => setParentalDialogOpen(true)
    },
    {
      icon: CheckCircle,
      title: "Verify Yourself",
      description: "Complete your profile verification",
      color: "text-primary",
      bgColor: "bg-primary/10",
      action: () => setVerifyDialogOpen(true)
    },
    {
      icon: Headphones,
      title: "Help & Support",
      description: "Support, contact, privacy & terms",
      color: "text-success",
      bgColor: "bg-success/10",
      action: () => setHelpLegalDialogOpen(true)
    },
  ];

  const getAccountTypeIcon = () => {
    switch (accountType.toLowerCase()) {
      case 'pro':
        return <Crown className="w-5 h-5 text-warning" />;
      case 'prime':
        return <Crown className="w-5 h-5 text-primary" />;
      default:
        return <User className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getAccountTypeBadge = () => {
    switch (accountType.toLowerCase()) {
      case 'pro':
        return <Badge className="bg-warning text-warning-foreground">Pro</Badge>;
      case 'prime':
        return <Badge className="bg-primary text-primary-foreground">Prime</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-4 py-3 pb-5">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateBack}
            className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold text-white text-center flex-1">Account</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInterestsDialogOpen(true)}
            className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
            title="Edit Profile"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14">
            {userProfile?.avatar_url && (
              <AvatarImage src={userProfile.avatar_url} alt="Profile" />
            )}
            <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-base font-bold text-white">{userData?.name || 'User'}</h2>
            <p className="text-white/80 text-xs">{userData?.emailOrPhone || 'No contact info'}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {getAccountTypeIcon()}
              {getAccountTypeBadge()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Quick Settings Card */}
        <Card className="mb-4 shadow-soft rounded-2xl border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs">
                  {userData?.locationEnabled ? 'Location enabled' : 'Location disabled'}
                </span>
              </div>
              <Switch 
                checked={userData?.locationEnabled ?? false}
                onCheckedChange={(checked) => onLocationToggle?.(checked)}
              />
            </div>
          </CardContent>
        </Card>


        <div className="space-y-3 mb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.title} 
                className="p-3 shadow-soft hover:shadow-medium transition-shadow cursor-pointer rounded-2xl border-0"
                onClick={() => item.action()}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bgColor}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    {item.companions && item.companions.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {item.companions.slice(0, 3).map((companion) => (
                          <div key={companion.id} className="w-5 h-5 text-xs flex items-center justify-center bg-muted rounded-full">
                            {companion.profileImage}
                          </div>
                        ))}
                        {item.companions.length > 3 && (
                          <div className="w-5 h-5 text-[10px] flex items-center justify-center bg-muted rounded-full text-muted-foreground">
                            +{item.companions.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    {item.places && item.places.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {item.places.slice(0, 3).map((place) => (
                          <div key={place.id} className="w-5 h-5 text-xs flex items-center justify-center bg-muted rounded-full">
                            {place.image}
                          </div>
                        ))}
                        {item.places.length > 3 && (
                          <div className="w-5 h-5 text-[10px] flex items-center justify-center bg-muted rounded-full text-muted-foreground">
                            +{item.places.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Logout */}
        <Card className="p-3 shadow-soft border-destructive/20 rounded-2xl">
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-9 text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Card>
      </div>

      {/* Dialogs */}
      {/* My Trips Dialog */}
      <Dialog open={myTripsDialogOpen} onOpenChange={setMyTripsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> My Trips
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {myPlans.length === 0 ? (
              <Card className="p-6 text-center rounded-2xl border-0 shadow-soft">
                <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-semibold text-sm">No trips yet</h3>
                <p className="text-xs text-muted-foreground mt-1">Create or join a trip from the Companion page</p>
              </Card>
            ) : (
              myPlans.map(plan => {
                const isPending = !plan.is_member && plan.my_request_status === "pending";
                const isRejected = !plan.is_member && plan.my_request_status === "rejected";
                const isMember = plan.is_member || plan.my_request_status === "approved";
                const groupBadge = getGroupBadge(plan.group_type);

                return (
                  <Card key={plan.id} className="overflow-hidden shadow-soft rounded-2xl border-0 bg-card">
                    {/* Cover Image */}
                    {plan.cover_image_url ? (
                      <div className="relative h-32 w-full">
                        <img src={plan.cover_image_url} alt={plan.destination_name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3">
                          <h3 className="font-bold text-sm text-white">{plan.plan_name}</h3>
                          <p className="text-[10px] text-white/80 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {plan.destination_name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-24 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-primary/40" />
                        <div className="absolute bottom-2 left-3">
                          <h3 className="font-bold text-sm">{plan.plan_name}</h3>
                          <p className="text-[10px] text-muted-foreground">{plan.destination_name}</p>
                        </div>
                      </div>
                    )}

                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(plan.start_date), "MMM d")} → {format(new Date(plan.end_date), "MMM d, yyyy")}
                        </p>
                        <div className="flex gap-1">
                          <Badge className={cn("text-[10px] rounded-lg border-0", groupBadge.color)}>{groupBadge.label}</Badge>
                          {plan.is_owner && <Badge className="text-[10px] rounded-lg bg-primary/10 text-primary border-0">Admin</Badge>}
                          {isPending && <Badge className="text-[10px] rounded-lg bg-warning/10 text-warning border-0">Pending</Badge>}
                          {isRejected && <Badge variant="destructive" className="text-[10px] rounded-lg">Rejected</Badge>}
                          {isMember && !plan.is_owner && <Badge className="text-[10px] rounded-lg bg-success/10 text-success border-0">Joined</Badge>}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="outline" className="text-[10px] py-0.5 px-2 rounded-lg gap-1">
                          <Users className="w-3 h-3" /> {plan.member_count || 1} / {plan.max_members}
                        </Badge>
                        {(plan.interests || []).slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] py-0.5 px-2 rounded-lg">{tag}</Badge>
                        ))}
                      </div>

                      {isMember && plan.is_owner ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs h-9" onClick={() => openManageRequests(plan)}>
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> Requests
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs h-9" onClick={() => openManageMembers(plan)}>
                            <Users className="w-3.5 h-3.5 mr-1.5" /> Members
                          </Button>
                        </div>
                      ) : isMember && !plan.is_owner ? (
                        <Button size="sm" variant="outline" className="w-full rounded-xl text-xs h-9 text-destructive hover:bg-destructive/10" onClick={() => handleLeavePlan(plan.id)}>
                          <DoorOpen className="w-3.5 h-3.5 mr-1.5" /> Leave Trip
                        </Button>
                      ) : isPending ? (
                        <div className="flex items-center gap-2 text-xs text-warning bg-warning/5 rounded-xl px-3 py-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Your request is pending review</span>
                        </div>
                      ) : isRejected ? (
                        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-xl px-3 py-2">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Your request was rejected</span>
                        </div>
                      ) : null}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Requests Dialog */}
      <Dialog open={requestsDialogOpen} onOpenChange={setRequestsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Join Requests — {managingPlan?.destination_name}</DialogTitle>
          </DialogHeader>
          {loadingRequests ? (
            <p className="text-center text-sm text-muted-foreground py-4">Loading...</p>
          ) : pendingRequests.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <Card key={req.id} className="p-3 rounded-2xl border-0 shadow-soft">
                  <p className="font-medium text-sm mb-1">{req.sender_name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{req.message || "No message"}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-success text-white rounded-xl text-xs h-8" onClick={() => handleReviewRequest(req, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs h-8 text-destructive" onClick={() => handleReviewRequest(req, "rejected")}>Reject</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trip Members — {membersPlan?.plan_name}</DialogTitle>
          </DialogHeader>
          {loadingMembers ? (
            <p className="text-center text-sm text-muted-foreground py-4">Loading...</p>
          ) : planMembers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No members yet</p>
          ) : (
            <div className="space-y-3">
              {planMembers.map(member => (
                <Card key={member.user_id} className="p-3 rounded-2xl border-0 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        {member.avatar_url && <AvatarImage src={member.avatar_url} />}
                        <AvatarFallback className="text-xs">{(member.display_name || "T").charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.display_name}</p>
                        <Badge className={cn("text-[9px] rounded-lg border-0", member.role === "owner" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                          {member.role === "owner" ? "Admin" : "Member"}
                        </Badge>
                      </div>
                    </div>
                    {member.role !== "owner" && membersPlan && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 rounded-xl text-xs h-8 px-2"
                        onClick={() => handleRemoveMember(membersPlan.id, member.user_id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MyInterestsDialog 
        open={interestsDialogOpen} 
        onOpenChange={setInterestsDialogOpen} 
        interests={userProfile?.interests || userData?.preferences || []}
        avatarUrl={userProfile?.avatar_url}
        gender={userProfile?.gender || ''}
        age={userProfile?.age || null}
        about={userProfile?.bio || ""}
        displayName={userProfile?.display_name || userData?.name || ""}
        onProfileUpdated={async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('gender, age, bio, interests, display_name, avatar_url')
              .eq('user_id', session.user.id)
              .single();
            if (profile) setUserProfile(profile);
          }
        }}
      />
      <TravelListDialog open={travelListDialogOpen} onOpenChange={setTravelListDialogOpen} places={bookmarkedPlaces} />
      <EmergencyDialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen} />
      <ParentalControlDialog open={parentalDialogOpen} onOpenChange={setParentalDialogOpen} />
      <VerifyDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen} />
      <SupportDialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen} />
      <TravelGuideDialog open={travelGuideDialogOpen} onOpenChange={setTravelGuideDialogOpen} currentCity={currentCity} />
      <HelpLegalDialog open={helpLegalDialogOpen} onOpenChange={setHelpLegalDialogOpen} />
    </div>
  );
};

export default AccountPage;