import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface PlanOption {
  id: string;
  plan_name: string;
  destination_name: string;
  member_count: number;
}

interface GroupSourceSelectorProps {
  currentUserId: string | null;
  selectedSource: string; // plan id or "others"
  onSourceChange: (source: string) => void;
}

const GroupSourceSelector: React.FC<GroupSourceSelectorProps> = ({
  currentUserId,
  selectedSource,
  onSourceChange,
}) => {
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;

    const fetchUserPlans = async () => {
      setLoading(true);
      try {
        // Get plans user is a member of
        const { data: memberships } = await supabase
          .from("plan_members")
          .select("plan_id, role")
          .eq("user_id", currentUserId);

        const planIds = (memberships || []).map(m => m.plan_id);
        if (planIds.length === 0) {
          if (!cancelled) setPlanOptions([]);
          return;
        }

        const [plansRes, membersRes] = await Promise.all([
          supabase.from("plans").select("id, plan_name, destination_name").in("id", planIds),
          supabase.from("plan_members").select("plan_id").in("plan_id", planIds),
        ]);

        const memberCounts = new Map<string, number>();
        (membersRes.data || []).forEach(m => {
          memberCounts.set(m.plan_id, (memberCounts.get(m.plan_id) || 0) + 1);
        });

        const options: PlanOption[] = (plansRes.data || []).map(p => ({
          id: p.id,
          plan_name: p.plan_name,
          destination_name: p.destination_name,
          member_count: memberCounts.get(p.id) || 0,
        }));

        if (!cancelled) setPlanOptions(options);
      } catch (err) {
        console.error("Failed to fetch user plans:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUserPlans();

    // Realtime updates
    const channel = supabase
      .channel("group-source-plans")
      .on("postgres_changes", { event: "*", schema: "public", table: "plan_members" }, () => fetchUserPlans())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return (
    <div className="mb-4">
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Group Source</label>
      <Select value={selectedSource} onValueChange={onSourceChange}>
        <SelectTrigger className="rounded-xl h-10 border-border/60 bg-background shadow-soft">
          <SelectValue placeholder={loading ? "Loading..." : "Choose a plan or group..."} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {planOptions.map(plan => (
            <SelectItem key={plan.id} value={plan.id} className="rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="truncate font-medium text-sm">{plan.plan_name}</span>
                <Badge variant="secondary" className="text-[9px] ml-auto flex-shrink-0">
                  <Users className="w-2.5 h-2.5 mr-0.5" />
                  {plan.member_count}
                </Badge>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="others" className="rounded-lg">
            <div className="flex items-center gap-2">
              <UserPlus className="w-3.5 h-3.5 text-accent-foreground flex-shrink-0" />
              <span className="font-medium text-sm">Others</span>
              <span className="text-[10px] text-muted-foreground ml-1">Add members freely</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GroupSourceSelector;
