import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Users, Calendar, Eye, EyeOff, Loader2, ArrowRight,
  User, Shield, Clock, Sparkles, Plus,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlans, Plan } from "@/hooks/usePlans";
import { format } from "date-fns";

interface ExplorePageProps {
  onNavigateToAccount?: () => void;
  onCreatePlan?: () => void;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigateToAccount, onCreatePlan }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const { plans, isLoading, fetchPlans, requestToJoin } = usePlans(currentUserId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Explore Trips</h1>
          <Button variant="ghost" size="icon" onClick={onNavigateToAccount}>
            <User className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search destinations..."
            className="pl-10 rounded-full bg-muted/50"
          />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium">No plans yet</p>
            <p className="text-sm text-muted-foreground">Be the first to create a trip!</p>
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
                      {plan.plan_visibility === "public" ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
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
                    <div className="flex gap-2">
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
      </div>

      {/* Create Plan FAB */}
      {onCreatePlan && (
        <button
          onClick={onCreatePlan}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-10"
        >
          <Plus className="w-6 h-6" />
        </button>
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

export default ExplorePage;
