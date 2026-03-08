import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Plan {
  id: string;
  creator_id: string;
  plan_name: string;
  destination_name: string;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string;
  max_members: number;
  group_type: string;
  plan_visibility: string;
  trip_description: string | null;
  cover_image_url: string | null;
  interests: string[];
  status: string;
  created_at: string;
  member_count?: number;
  request_count?: number;
  is_member?: boolean;
  is_owner?: boolean;
  my_request_status?: string | null;
  creator_name?: string;
}

export interface JoinRequest {
  id: string;
  plan_id: string;
  user_id: string;
  status: string;
  message: string | null;
  created_at: string;
  sender_name?: string;
}

export const usePlans = (currentUserId: string | null) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [myPlans, setMyPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = useCallback(async (destination?: string) => {
    if (!currentUserId) return;
    try {
      setIsLoading(true);

      let query = supabase
        .from("plans")
        .select("*")
        .eq("status", "open")
        .gte("start_date", new Date().toISOString().split("T")[0]);

      if (destination) {
        query = query.ilike("destination_name", `%${destination}%`);
      }

      const { data: plansData, error } = await query.order("start_date", { ascending: true });
      if (error) throw error;

      const planIds = (plansData || []).map((p: any) => p.id);
      let membersData: any[] = [];
      let requestsData: any[] = [];
      let allRequestsData: any[] = [];
      let coCompanions: any[] = [];

      if (planIds.length > 0) {
        const [membersRes, requestsRes, allRequestsRes, coCompRes] = await Promise.all([
          supabase.from("plan_members").select("plan_id, user_id, role").in("plan_id", planIds),
          supabase.from("join_requests").select("plan_id, user_id, status").eq("user_id", currentUserId).in("plan_id", planIds),
          supabase.from("join_requests").select("plan_id, status").in("plan_id", planIds),
          supabase.from("co_companions").select("companion_id").eq("user_id", currentUserId),
        ]);
        membersData = membersRes.data || [];
        requestsData = requestsRes.data || [];
        allRequestsData = allRequestsRes.data || [];
        coCompanions = coCompRes.data || [];
      }

      const coCompanionIds = coCompanions.map((c: any) => c.companion_id);

      // Get creator names
      const creatorIds = [...new Set((plansData || []).map((p: any) => p.creator_id))];
      let creatorMap: Record<string, string> = {};
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", creatorIds);
        (profiles || []).forEach((p: any) => {
          creatorMap[p.user_id] = p.display_name || "Traveler";
        });
      }

      const enriched: Plan[] = (plansData || []).map((plan: any) => {
        const members = membersData.filter((m: any) => m.plan_id === plan.id);
        const myMembership = members.find((m: any) => m.user_id === currentUserId);
        const myRequest = requestsData.find((r: any) => r.plan_id === plan.id);
        const pendingRequests = allRequestsData.filter((r: any) => r.plan_id === plan.id && r.status === "pending");

        // Filter private plans: only show if user is creator or co-companion of creator
        if (plan.plan_visibility === "private" && plan.creator_id !== currentUserId && !coCompanionIds.includes(plan.creator_id)) {
          return null;
        }

        return {
          ...plan,
          interests: plan.interests || [],
          member_count: members.filter((m: any) => m.status === "approved" || !m.status).length,
          request_count: pendingRequests.length,
          is_member: !!myMembership,
          is_owner: myMembership?.role === "owner",
          my_request_status: myRequest?.status || null,
          creator_name: creatorMap[plan.creator_id] || "Traveler",
        };
      }).filter(Boolean) as Plan[];

      setPlans(enriched);
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const fetchMyPlans = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const { data: memberships } = await supabase
        .from("plan_members")
        .select("plan_id, role")
        .eq("user_id", currentUserId);

      const { data: myRequests } = await supabase
        .from("join_requests")
        .select("plan_id, status")
        .eq("user_id", currentUserId);

      const memberPlanIds = (memberships || []).map((m: any) => m.plan_id);
      const requestPlanIds = (myRequests || [])
        .filter((r: any) => !memberPlanIds.includes(r.plan_id))
        .map((r: any) => r.plan_id);

      const allPlanIds = [...memberPlanIds, ...requestPlanIds];
      if (allPlanIds.length === 0) { setMyPlans([]); return; }

      const [plansRes, allMembersRes, allRequestsRes] = await Promise.all([
        supabase.from("plans").select("*").in("id", allPlanIds),
        supabase.from("plan_members").select("plan_id, user_id, role").in("plan_id", allPlanIds),
        supabase.from("join_requests").select("plan_id, status").in("plan_id", allPlanIds),
      ]);

      const plansData = plansRes.data || [];
      const allMembers = allMembersRes.data || [];
      const allRequests = allRequestsRes.data || [];

      const enriched: Plan[] = plansData.map((plan: any) => {
        const members = allMembers.filter((m: any) => m.plan_id === plan.id);
        const myRole = (memberships || []).find((m: any) => m.plan_id === plan.id);
        const myRequest = (myRequests || []).find((r: any) => r.plan_id === plan.id);
        const pendingRequests = allRequests.filter((r: any) => r.plan_id === plan.id && r.status === "pending");
        return {
          ...plan,
          interests: plan.interests || [],
          member_count: members.length,
          request_count: pendingRequests.length,
          is_member: !!myRole,
          is_owner: myRole?.role === "owner",
          my_request_status: myRequest?.status || null,
        };
      });

      setMyPlans(enriched);
    } catch (err) {
      console.error("Error fetching my plans:", err);
    }
  }, [currentUserId]);

  const syncPlanGroup = async (planId: string) => {
    // Check member count - need at least 2 members to create group
    const { data: members } = await supabase
      .from("plan_members")
      .select("user_id")
      .eq("plan_id", planId);

    if (!members || members.length < 2) return;

    // Use SECURITY DEFINER function to sync all plan members to the group
    const { error } = await supabase.rpc("sync_plan_group_members", { p_plan_id: planId });
    if (error) {
      console.error("Failed to sync plan group members:", error);
    }
  };

  const createPlan = async (planData: {
    plan_name: string;
    destination_name: string;
    latitude?: number;
    longitude?: number;
    start_date: string;
    end_date: string;
    max_members: number;
    group_type: string;
    plan_visibility: string;
    trip_description?: string;
    cover_image_url?: string;
    interests?: string[];
  }) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const { data: plan, error } = await supabase
      .from("plans")
      .insert({ ...planData, creator_id: currentUserId } as any)
      .select()
      .single();

    if (error) throw error;

    // Add creator as owner
    await supabase
      .from("plan_members")
      .insert({ plan_id: (plan as any).id, user_id: currentUserId, role: "owner" } as any);

    // If no cover image, generate one via AI
    if (!planData.cover_image_url) {
      try {
        const { data: aiData } = await supabase.functions.invoke("generate-cover-image", {
          body: { destination_name: planData.destination_name, plan_id: (plan as any).id },
        });
        if (aiData?.cover_image_url) {
          // Plan already updated by edge function
        }
      } catch (err) {
        console.error("AI cover generation failed:", err);
      }
    }

    await Promise.all([fetchPlans(), fetchMyPlans()]);
    return plan;
  };

  const requestToJoin = async (planId: string, message?: string) => {
    if (!currentUserId) throw new Error("Not authenticated");

    // Check if private plan and user is co-companion
    const { data: plan } = await supabase
      .from("plans")
      .select("plan_visibility, creator_id")
      .eq("id", planId)
      .single();

    if (plan && (plan as any).plan_visibility === "private") {
      const { data: coComp } = await supabase
        .from("co_companions")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("companion_id", (plan as any).creator_id)
        .maybeSingle();

      if (!coComp && (plan as any).creator_id !== currentUserId) {
        throw new Error("This plan is only visible to travel companions.");
      }
    }

    const { error } = await supabase
      .from("join_requests")
      .insert({ plan_id: planId, user_id: currentUserId, message } as any);

    if (error) throw error;
    await fetchPlans();
  };

  const handleJoinRequest = async (requestId: string, action: "approved" | "rejected", planId: string, requestUserId: string) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("join_requests")
      .update({ status: action } as any)
      .eq("id", requestId);

    if (error) throw error;

    if (action === "approved") {
      await supabase
        .from("plan_members")
        .insert({ plan_id: planId, user_id: requestUserId, role: "member" } as any);

      // Sync all plan members to group (creates group if needed, adds all members)
      await syncPlanGroup(planId);
    }

    await Promise.all([fetchPlans(), fetchMyPlans()]);
  };

  const getPendingRequests = async (planId: string): Promise<JoinRequest[]> => {
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .eq("plan_id", planId)
      .eq("status", "pending");

    if (error) throw error;

    const userIds = (data || []).map((r: any) => r.user_id);
    let profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      (profiles || []).forEach((p: any) => {
        profileMap[p.user_id] = p.display_name || "Traveler";
      });
    }

    return (data || []).map((r: any) => ({
      ...r,
      sender_name: profileMap[r.user_id] || "Traveler",
    }));
  };

  useEffect(() => {
    if (currentUserId) {
      fetchPlans();
      fetchMyPlans();
    }
  }, [currentUserId, fetchPlans, fetchMyPlans]);

  // Realtime subscriptions for live member/request counts
  useEffect(() => {
    if (!currentUserId) return;

    const membersChannel = supabase
      .channel("plan-members-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plan_members" },
        () => {
          fetchPlans();
          fetchMyPlans();
        }
      )
      .subscribe();

    const requestsChannel = supabase
      .channel("join-requests-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "join_requests" },
        () => {
          fetchPlans();
          fetchMyPlans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [currentUserId, fetchPlans, fetchMyPlans]);

  return {
    plans,
    myPlans,
    isLoading,
    fetchPlans,
    fetchMyPlans,
    createPlan,
    requestToJoin,
    handleJoinRequest,
    getPendingRequests,
  };
};
