import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar, MapPin, Clock, Plus, CheckCircle, Trash2, User,
  Home, UtensilsCrossed, Car, Ticket, ShoppingBag, Users, UserRound,
  Compass, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ActivityDialog, { Activity } from "@/components/dialogs/ActivityDialog";
import ExpenseDialog from "@/components/dialogs/ExpenseDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import GroupMembersManager, { GroupMember } from "@/components/journey/GroupMembersManager";
import ActivityPoll, { PollActivity } from "@/components/journey/ActivityPoll";
import ExpenseSplitter, { GroupExpense } from "@/components/journey/ExpenseSplitter";
import GroupSourceSelector from "@/components/journey/GroupSourceSelector";
import { supabase } from "@/integrations/supabase/client";
import { useJourneyInvites } from "@/hooks/useJourneyInvites";

interface JourneyPageProps {
  onNavigateToAccount?: () => void;
  externalActivities?: { title: string; location: string; type: string }[];
}

const JourneyPage: React.FC<JourneyPageProps> = ({ onNavigateToAccount, externalActivities = [] }) => {
  const [activeTab, setActiveTab] = useState("planner");
  const [travelMode, setTravelMode] = useState<"solo" | "group">("solo");
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [activityDialogMode, setActivityDialogMode] = useState<"add" | "edit">("add");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [addedExternalCount, setAddedExternalCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Trip Info
  const [tripDialogOpen, setTripDialogOpen] = useState(false);
  const [tripInfo, setTripInfo] = useState<{ city: string; start: string; end: string }>({ city: "", start: "", end: "" });

  // Group state
  const [groupSource, setGroupSource] = useState<string>("others");
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([{ id: "me", name: "You" }]);
  const [polls, setPolls] = useState<PollActivity[]>([]);
  const [currentVoter, setCurrentVoter] = useState("me");
  const [groupExpenses, setGroupExpenses] = useState<GroupExpense[]>([]);

  const isOthersMode = groupSource === "others";

  // Handler to remove members - works for both "others" and plan-based groups
  const handleMembersChange = (newMembers: GroupMember[]) => {
    if (isOthersMode) {
      setGroupMembers(newMembers);
    } else {
      // Find removed member
      const removed = groupMembers.find(m => !newMembers.some(nm => nm.id === m.id));
      if (removed && removed.user_id && currentUserId) {
        supabase.rpc("remove_plan_member", {
          p_plan_id: groupSource,
          p_user_id: removed.user_id,
        }).then(({ error }) => {
          if (error) {
            toast.error("Failed to remove member");
          } else {
            setGroupMembers(newMembers);
            toast.success(`${removed.name} removed from group`);
          }
        });
      }
    }
  };

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  // Journey invites
  const {
    pendingReceived,
    acceptedInvites,
    searchUsers,
    sendInvite,
    respondToInvite,
    getInviteStatusForUser,
    refetch: refetchInvites,
  } = useJourneyInvites(currentUserId);

  // Load group members based on source selection
  useEffect(() => {
    if (!currentUserId) return;

    if (groupSource === "others") {
      // In "Others" mode, load from accepted journey invites
      const loadFromInvites = async () => {
        const otherUserIds = acceptedInvites.map(inv =>
          inv.from_user_id === currentUserId ? inv.to_user_id : inv.from_user_id
        );
        if (otherUserIds.length === 0) {
          setGroupMembers([{ id: "me", name: "You" }]);
          return;
        }

        const [profilesRes, presenceRes] = await Promise.all([
          supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", otherUserIds),
          supabase.from("user_presence").select("user_id, is_online").in("user_id", otherUserIds),
        ]);

        const presenceMap = new Map(presenceRes.data?.map(p => [p.user_id, p.is_online]) || []);
        const newMembers: GroupMember[] = [{ id: "me", name: "You" }];
        profilesRes.data?.forEach(p => {
          if (!newMembers.some(m => m.user_id === p.user_id)) {
            newMembers.push({
              id: p.user_id,
              name: p.display_name || "User",
              user_id: p.user_id,
              avatar_url: p.avatar_url || undefined,
              is_online: presenceMap.get(p.user_id) || false,
            });
          }
        });
        setGroupMembers(newMembers);
      };
      loadFromInvites();
    } else {
      // Load members from the selected plan
      const loadPlanMembers = async () => {
        const { data: members } = await supabase
          .from("plan_members")
          .select("user_id, role")
          .eq("plan_id", groupSource);

        const userIds = (members || []).map(m => m.user_id);
        if (userIds.length === 0) {
          setGroupMembers([{ id: "me", name: "You" }]);
          return;
        }

        const [profilesRes, presenceRes] = await Promise.all([
          supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds),
          supabase.from("user_presence").select("user_id, is_online").in("user_id", userIds),
        ]);

        const presenceMap = new Map(presenceRes.data?.map(p => [p.user_id, p.is_online]) || []);
        const roleMap = new Map((members || []).map(m => [m.user_id, m.role]));

        const newMembers: GroupMember[] = (profilesRes.data || []).map(p => ({
          id: p.user_id === currentUserId ? "me" : p.user_id,
          name: p.user_id === currentUserId ? "You" : (p.display_name || "User"),
          user_id: p.user_id,
          avatar_url: p.avatar_url || undefined,
          is_online: presenceMap.get(p.user_id) || false,
        }));

        // Ensure "You" is first
        newMembers.sort((a, b) => (a.id === "me" ? -1 : b.id === "me" ? 1 : 0));
        setGroupMembers(newMembers.length > 0 ? newMembers : [{ id: "me", name: "You" }]);
      };
      loadPlanMembers();
    }
  }, [groupSource, acceptedInvites, currentUserId]);

  const getTripDetails = () => {
    if (!tripInfo.start || !tripInfo.end || !tripInfo.city) return null;
    const start = new Date(tripInfo.start);
    const end = new Date(tripInfo.end);
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const duration = `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    return { ...tripInfo, duration, daysLeft };
  };

  const tripDetails = getTripDetails();

  const handleTripSave = () => {
    if (!tripInfo.city || !tripInfo.start || !tripInfo.end) { toast.error("Please fill all fields."); return; }
    if (new Date(tripInfo.end) < new Date(tripInfo.start)) { toast.error("End date cannot be before start date."); return; }
    toast.success("Trip details saved!");
    setTripDialogOpen(false);
  };

  // Solo activities
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (externalActivities.length > addedExternalCount) {
      const newActivities = externalActivities.slice(addedExternalCount).map((ext, idx) => ({
        id: Date.now() + idx, title: ext.title, time: "TBD", location: ext.location,
        type: ext.type, duration: "TBD", status: "planned" as const, date: "Planned",
      }));
      setActivities(prev => [...prev, ...newActivities]);
      setAddedExternalCount(externalActivities.length);
    }
  }, [externalActivities, addedExternalCount]);

  // Solo expenses
  const [expenses, setExpenses] = useState([
    { category: "Accommodation", amount: 0, budget: 0, icon: Home },
    { category: "Food & Drinks", amount: 0, budget: 0, icon: UtensilsCrossed },
    { category: "Transportation", amount: 0, budget: 0, icon: Car },
    { category: "Activities", amount: 0, budget: 0, icon: Ticket },
    { category: "Shopping", amount: 0, budget: 0, icon: ShoppingBag },
  ]);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = expenses.reduce((sum, exp) => sum + exp.budget, 0);
  const completedCount = activities.filter(a => a.status === "completed").length;
  const plannedCount = activities.filter(a => a.status === "planned").length;
  const progressPercent = activities.length ? Math.round((completedCount / activities.length) * 100) : 0;

  const handleEditActivity = (activity: Activity) => {
    if (activity.status === "completed") return;
    setActivityDialogMode("edit");
    setSelectedActivity(activity);
    setActivityDialogOpen(true);
  };

  const handleSaveActivity = (activityData: Omit<Activity, "id"> & { id?: number }) => {
    if (activityData.id) {
      setActivities(prev => prev.map(a => a.id === activityData.id ? { ...activityData, id: a.id } as Activity : a));
    } else {
      setActivities(prev => [...prev, { ...activityData, id: Date.now() } as Activity]);
    }
  };

  const handleCompleteActivity = (id: number) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, status: "completed" as const } : a));
    toast.success("Activity marked as complete!", {
      action: {
        label: "Undo",
        onClick: () => {
          setActivities(prev => prev.map(a => a.id === id ? { ...a, status: "planned" as const } : a));
          toast.success("Completion undone!");
        },
      },
    });
  };

  const handleDeleteActivity = (id: number) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.info("Activity deleted.");
  };

  const handleSaveExpense = (expense: { category: string; amount: number; budget: number }) => {
    setExpenses(prev => {
      const existing = prev.find(e => e.category === expense.category);
      if (existing) return prev.map(e => e.category === expense.category ? { ...e, amount: expense.amount, budget: expense.budget } : e);
      return [...prev, { ...expense, icon: ShoppingBag }];
    });
    toast.success("Expense saved!");
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setExpenseDialogOpen(true);
  };

  const handleResetExpenses = () => {
    setExpenses(prev => prev.map(e => ({ ...e, amount: 0, budget: 0 })));
    toast.success("All expenses reset.");
  };

  const budgetPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-4 py-3 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4" /> Journey
            </h1>
            {tripDetails ? (
              <p className="text-white/80 text-[10px]">
                {tripDetails.city} • {tripDetails.daysLeft} days left
              </p>
            ) : (
              <p className="text-white/80 text-[10px]">Plan & track your adventures</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onNavigateToAccount} className="w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30">
            <User className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className={cn(
              "flex-1 h-9 text-xs rounded-xl gap-1.5 transition-all",
              travelMode === "solo"
                ? "bg-white text-primary shadow-medium font-semibold"
                : "bg-white/20 text-white hover:bg-white/30"
            )}
            onClick={() => setTravelMode("solo")}
          >
            <UserRound className="w-3.5 h-3.5" /> Solo
          </Button>
          <Button
            size="sm"
            className={cn(
              "flex-1 h-9 text-xs rounded-xl gap-1.5 transition-all",
              travelMode === "group"
                ? "bg-white text-primary shadow-medium font-semibold"
                : "bg-white/20 text-white hover:bg-white/30"
            )}
            onClick={() => setTravelMode("group")}
          >
            <Users className="w-3.5 h-3.5" /> Group
          </Button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      {travelMode === "solo" && (
        <div className="px-4 py-2.5 flex gap-2 border-b border-border/50 bg-muted/30">
          <div className="flex-1 flex items-center gap-2 bg-background rounded-xl px-3 py-2 shadow-soft">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-tight">Done</p>
              <p className="text-sm font-bold text-foreground leading-tight">{completedCount}/{activities.length}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-background rounded-xl px-3 py-2 shadow-soft">
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-warning" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-tight">Planned</p>
              <p className="text-sm font-bold text-foreground leading-tight">{plannedCount}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-background rounded-xl px-3 py-2 shadow-soft">
            <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-tight">Spent</p>
              <p className="text-sm font-bold text-foreground leading-tight">₹{(totalSpent / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-[calc(100%-2rem)] grid-cols-2 mx-4 mt-3 h-11 rounded-xl bg-muted">
            <TabsTrigger value="planner" className="text-xs rounded-lg gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Planner
            </TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs rounded-lg gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> Expenses
            </TabsTrigger>
          </TabsList>

          {/* ========== PLANNER TAB ========== */}
          <TabsContent value="planner" className="px-4 pt-3 pb-20">
            {/* Trip Section */}
            <Card className="p-3 mb-4 bg-gradient-card rounded-2xl border-0 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    {tripDetails ? (
                      <>
                        <h3 className="font-semibold text-sm">{tripDetails.city}</h3>
                        <p className="text-[10px] text-muted-foreground">{tripDetails.duration}</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-sm text-muted-foreground">No trip set</h3>
                        <p className="text-[10px] text-muted-foreground">Tap to plan your next trip</p>
                      </>
                    )}
                  </div>
                </div>
                <Button size="sm" className="h-8 text-[10px] rounded-xl px-3" variant="outline" onClick={() => setTripDialogOpen(true)}>
                  {tripDetails ? "Edit" : "Plan Trip"}
                </Button>
              </div>
              {travelMode === "solo" && activities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-muted-foreground">Progress</span>
                    <span className="text-[10px] font-semibold text-primary">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5" />
                </div>
              )}
            </Card>

            {/* Group: Members + Polls | Solo: Activities */}
            {travelMode === "group" ? (
              <>
                <GroupSourceSelector
                  currentUserId={currentUserId}
                  selectedSource={groupSource}
                  onSourceChange={(src) => {
                    setGroupSource(src);
                    setPolls([]);
                    setGroupExpenses([]);
                  }}
                />
                <GroupMembersManager
                  members={groupMembers}
                  onMembersChange={handleMembersChange}
                  onSearchUsers={isOthersMode ? searchUsers : undefined}
                  onSendInvite={isOthersMode ? sendInvite : undefined}
                  onRespondToInvite={isOthersMode ? respondToInvite : undefined}
                  getInviteStatus={isOthersMode ? getInviteStatusForUser : undefined}
                  pendingInvites={isOthersMode ? pendingReceived : []}
                />
                <ActivityPoll
                  polls={polls}
                  onPollsChange={setPolls}
                  members={groupMembers}
                  currentVoter={currentVoter}
                  onCurrentVoterChange={setCurrentVoter}
                />
              </>
            ) : (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold">Activities</h2>
                  <Button
                    size="sm"
                    className="bg-gradient-primary text-white border-0 h-8 text-xs rounded-xl px-3"
                    onClick={() => { setActivityDialogMode("add"); setSelectedActivity(null); setActivityDialogOpen(true); }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>

                {activities.length === 0 ? (
                  <Card className="p-8 text-center rounded-2xl border-0 shadow-soft">
                    <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No activities yet</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Add your first activity to get started</p>
                  </Card>
                ) : (
                  <div className="space-y-2.5">
                    {activities.map((activity, index) => {
                      const isCompleted = activity.status === "completed";
                      return (
                        <Card
                          key={activity.id}
                          onClick={() => handleEditActivity(activity)}
                          className={cn(
                            "p-3 rounded-2xl border-0 transition-all active:scale-[0.98]",
                            isCompleted
                              ? "opacity-60 bg-muted/50"
                              : "shadow-soft hover:shadow-medium"
                          )}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                              isCompleted ? "bg-success/15" : "bg-primary/10"
                            )}>
                              {isCompleted
                                ? <CheckCircle className="w-4 h-4 text-success" />
                                : <span className="font-bold text-xs text-primary">{index + 1}</span>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className={cn(
                                    "font-semibold text-[13px] leading-tight",
                                    isCompleted && "line-through text-muted-foreground"
                                  )}>
                                    {activity.title}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{activity.time}</span>
                                    <span className="text-muted-foreground/40">•</span>
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span className="truncate">{activity.location}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  {!isCompleted && (
                                    <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-success hover:bg-success/10"
                                      onClick={e => { e.stopPropagation(); handleCompleteActivity(activity.id); }}>
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-destructive hover:bg-destructive/10"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteActivity(activity.id); }}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex gap-1.5 mt-1.5">
                                <Badge variant="secondary" className="text-[9px] py-0 px-1.5 rounded-md font-medium">{activity.type}</Badge>
                                <Badge variant="outline" className="text-[9px] py-0 px-1.5 rounded-md">{activity.duration}</Badge>
                                <Badge variant="outline" className="text-[9px] py-0 px-1.5 rounded-md">{activity.date}</Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ========== EXPENSES TAB ========== */}
          <TabsContent value="expenses" className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
            {travelMode === "group" ? (
              <>
                <GroupSourceSelector
                  currentUserId={currentUserId}
                  selectedSource={groupSource}
                  onSourceChange={(src) => {
                    setGroupSource(src);
                    setPolls([]);
                    setGroupExpenses([]);
                  }}
                />
                <GroupMembersManager
                  members={groupMembers}
                  onMembersChange={isOthersMode ? setGroupMembers : undefined}
                  onSearchUsers={isOthersMode ? searchUsers : undefined}
                  onSendInvite={isOthersMode ? sendInvite : undefined}
                  onRespondToInvite={isOthersMode ? respondToInvite : undefined}
                  getInviteStatus={isOthersMode ? getInviteStatusForUser : undefined}
                  pendingInvites={isOthersMode ? pendingReceived : []}
                />
                <ExpenseSplitter expenses={groupExpenses} onExpensesChange={setGroupExpenses} members={groupMembers} />
              </>
            ) : (
              <>
                {/* Budget Overview */}
                <Card className="p-4 mb-4 rounded-2xl border-0 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Budget Overview</h3>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => { setEditingExpense(null); setExpenseDialogOpen(true); }} className="h-7 text-[10px] rounded-lg px-2.5">
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleResetExpenses} className="h-7 text-[10px] rounded-lg px-2.5 text-destructive hover:text-destructive">
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-2xl font-bold text-primary">₹{totalSpent.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground mb-0.5">/ ₹{totalBudget.toLocaleString()}</span>
                  </div>
                  <Progress value={budgetPercent} className="h-2 mb-1" />
                  <p className="text-[10px] text-muted-foreground">{budgetPercent}% of budget used</p>
                </Card>

                {/* Category Breakdown */}
                <h3 className="text-sm font-semibold mb-2.5">Categories</h3>
                <div className="space-y-2">
                  {expenses.map(expense => {
                    const IconComponent = expense.icon;
                    const catPercent = expense.budget > 0 ? Math.round((expense.amount / expense.budget) * 100) : 0;
                    const isOver = catPercent > 90;
                    return (
                      <Card
                        key={expense.category}
                        onClick={() => handleEditExpense(expense)}
                        className="p-3 rounded-2xl border-0 shadow-soft active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center",
                            isOver ? "bg-destructive/10" : "bg-primary/10"
                          )}>
                            <IconComponent className={cn("w-4 h-4", isOver ? "text-destructive" : "text-primary")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-[13px]">{expense.category}</span>
                              <span className="text-[11px] font-semibold text-foreground">
                                ₹{expense.amount.toLocaleString()}
                                <span className="text-muted-foreground font-normal"> / ₹{expense.budget.toLocaleString()}</span>
                              </span>
                            </div>
                            <Progress value={catPercent} className="h-1" />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Trip Dialog */}
      <Dialog open={tripDialogOpen} onOpenChange={setTripDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle>Set Your Trip</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Destination City</label>
              <Input placeholder="e.g., Delhi" value={tripInfo.city} onChange={e => setTripInfo({ ...tripInfo, city: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={tripInfo.start} onChange={e => setTripInfo({ ...tripInfo, start: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={tripInfo.end} onChange={e => setTripInfo({ ...tripInfo, end: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTripDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTripSave} className="bg-gradient-primary text-white">Save Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog (Solo) */}
      <ActivityDialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen} activity={selectedActivity} onSave={handleSaveActivity} onDelete={handleDeleteActivity} mode={activityDialogMode} />

      {/* Expense Dialog (Solo) */}
      <ExpenseDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} onSave={handleSaveExpense} existingCategories={expenses.map(e => e.category)} />
    </div>
  );
};

export default JourneyPage;
