import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Trip {
  id: string;
  created_by: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  budget_range: string;
  group_type: string;
  max_members: number;
  trip_style: string | null;
  description: string | null;
  status: string;
  created_at: string;
  member_count?: number;
  verified_count?: number;
  is_member?: boolean;
  is_owner?: boolean;
  my_request_status?: string | null;
}

export interface TripRequest {
  id: string;
  trip_id: string;
  user_id: string;
  status: string;
  answers: Record<string, string> | null;
  message: string | null;
  created_at: string;
  sender_name?: string;
}

export interface TripMessage {
  id: string;
  trip_id: string;
  user_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

export const useTrips = (currentUserId: string | null) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrips = useCallback(async (destination?: string) => {
    if (!currentUserId) return;
    try {
      setIsLoading(true);

      let query = supabase
        .from("trips")
        .select("*")
        .eq("status", "open")
        .gte("start_date", new Date().toISOString().split("T")[0]);

      if (destination) {
        query = query.ilike("destination", `%${destination}%`);
      }

      const { data: tripsData, error } = await query.order("start_date", { ascending: true });
      if (error) throw error;

      // Get member counts
      const tripIds = (tripsData || []).map((t: any) => t.id);
      
      let membersData: any[] = [];
      let requestsData: any[] = [];
      
      if (tripIds.length > 0) {
        const [membersRes, requestsRes] = await Promise.all([
          supabase.from("trip_members").select("trip_id, user_id, role").in("trip_id", tripIds),
          supabase.from("trip_requests").select("trip_id, user_id, status").eq("user_id", currentUserId).in("trip_id", tripIds),
        ]);
        membersData = membersRes.data || [];
        requestsData = requestsRes.data || [];
      }

      // Get verified count from profiles
      const memberUserIds = membersData.map((m: any) => m.user_id);
      let verifiedMap: Record<string, boolean> = {};
      if (memberUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, is_verified")
          .in("user_id", memberUserIds);
        (profiles || []).forEach((p: any) => {
          verifiedMap[p.user_id] = p.is_verified || false;
        });
      }

      const enriched: Trip[] = (tripsData || []).map((trip: any) => {
        const members = membersData.filter((m: any) => m.trip_id === trip.id);
        const myMembership = members.find((m: any) => m.user_id === currentUserId);
        const myRequest = requestsData.find((r: any) => r.trip_id === trip.id);
        const verifiedCount = members.filter((m: any) => verifiedMap[m.user_id]).length;

        return {
          ...trip,
          member_count: members.length,
          verified_count: verifiedCount,
          is_member: !!myMembership,
          is_owner: myMembership?.role === "owner",
          my_request_status: myRequest?.status || null,
        };
      });

      setTrips(enriched);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const fetchMyTrips = useCallback(async () => {
    if (!currentUserId) return;
    try {
      // Fetch trips where user is a member
      const { data: memberships } = await supabase
        .from("trip_members")
        .select("trip_id, role")
        .eq("user_id", currentUserId);

      // Fetch trips where user has sent requests (pending/accepted/declined)
      const { data: myRequests } = await supabase
        .from("trip_requests")
        .select("trip_id, status")
        .eq("user_id", currentUserId);

      const memberTripIds = (memberships || []).map((m: any) => m.trip_id);
      const requestTripIds = (myRequests || [])
        .filter((r: any) => !memberTripIds.includes(r.trip_id))
        .map((r: any) => r.trip_id);

      const allTripIds = [...memberTripIds, ...requestTripIds];

      if (allTripIds.length === 0) {
        setMyTrips([]);
        return;
      }

      const { data: tripsData } = await supabase
        .from("trips")
        .select("*")
        .in("id", allTripIds);

      const { data: allMembers } = await supabase
        .from("trip_members")
        .select("trip_id, user_id, role")
        .in("trip_id", allTripIds);

      const enriched: Trip[] = (tripsData || []).map((trip: any) => {
        const members = (allMembers || []).filter((m: any) => m.trip_id === trip.id);
        const myRole = (memberships || []).find((m: any) => m.trip_id === trip.id);
        const myRequest = (myRequests || []).find((r: any) => r.trip_id === trip.id);
        return {
          ...trip,
          member_count: members.length,
          is_member: !!myRole,
          is_owner: myRole?.role === "owner",
          my_request_status: myRequest?.status || null,
        };
      });

      setMyTrips(enriched);
    } catch (err) {
      console.error("Error fetching my trips:", err);
    }
  }, [currentUserId]);

  const createTrip = async (tripData: {
    destination: string;
    start_date: string;
    end_date: string;
    trip_type: string;
    budget_range: string;
    group_type: string;
    max_members: number;
    trip_style?: string;
    description?: string;
  }) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const { data: trip, error } = await supabase
      .from("trips")
      .insert({ ...tripData, created_by: currentUserId })
      .select()
      .single();

    if (error) throw error;

    // Add creator as owner member
    await supabase
      .from("trip_members")
      .insert({ trip_id: trip.id, user_id: currentUserId, role: "owner" });

    await Promise.all([fetchTrips(), fetchMyTrips()]);
    return trip;
  };

  const requestToJoin = async (tripId: string, message?: string, answers?: Record<string, string>) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("trip_requests")
      .insert({
        trip_id: tripId,
        user_id: currentUserId,
        message,
        answers: answers as any,
      });

    if (error) throw error;
    await fetchTrips();
  };

  const handleRequest = async (requestId: string, action: "accepted" | "declined", tripId: string, requestUserId: string) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("trip_requests")
      .update({ status: action, reviewed_by: currentUserId })
      .eq("id", requestId);

    if (error) throw error;

    if (action === "accepted") {
      const { error: memberError } = await supabase
        .from("trip_members")
        .insert({ trip_id: tripId, user_id: requestUserId });
      if (memberError) {
        console.error("Failed to add member:", memberError);
        throw new Error("Failed to add member to trip");
      }
    }

    await Promise.all([fetchTrips(), fetchMyTrips()]);
  };

  const getPendingRequests = async (tripId: string): Promise<TripRequest[]> => {
    const { data, error } = await supabase
      .from("trip_requests")
      .select("*")
      .eq("trip_id", tripId)
      .eq("status", "pending");

    if (error) throw error;

    // Get sender names
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
      answers: r.answers as Record<string, string> | null,
      sender_name: profileMap[r.user_id] || "Traveler",
    }));
  };

  useEffect(() => {
    if (currentUserId) {
      fetchTrips();
      fetchMyTrips();
    }
  }, [currentUserId, fetchTrips, fetchMyTrips]);

  return {
    trips,
    myTrips,
    isLoading,
    fetchTrips,
    fetchMyTrips,
    createTrip,
    requestToJoin,
    handleRequest,
    getPendingRequests,
  };
};

export const useTripMessages = (tripId: string | null, currentUserId: string | null) => {
  const [messages, setMessages] = useState<TripMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!tripId || !currentUserId) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("trip_messages")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((data || []).map((m: any) => m.user_id))];
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

      setMessages(
        (data || []).map((m: any) => ({
          ...m,
          sender_name: profileMap[m.user_id] || "Traveler",
        }))
      );
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [tripId, currentUserId]);

  const sendMessage = async (content: string) => {
    if (!tripId || !currentUserId) throw new Error("Not ready");
    const { error } = await supabase
      .from("trip_messages")
      .insert({ trip_id: tripId, user_id: currentUserId, content });
    if (error) throw error;
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!tripId || !currentUserId) return;

    const channel = supabase
      .channel(`trip-messages-${tripId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trip_messages", filter: `trip_id=eq.${tripId}` },
        async (payload) => {
          const newMsg = payload.new as any;
          // Get sender name
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", newMsg.user_id)
            .maybeSingle();

          setMessages((prev) => [
            ...prev,
            {
              ...newMsg,
              sender_name: profile?.display_name || "Traveler",
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, currentUserId]);

  return { messages, isLoading, sendMessage };
};
