import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface JourneyInvite {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string | null;
  status: string;
  created_at: string;
  from_profile?: {
    display_name: string | null;
    avatar_url: string | null;
    city: string | null;
  };
}

export interface SearchedUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  is_verified: boolean | null;
  is_online?: boolean;
}

export const useJourneyInvites = (currentUserId: string | null) => {
  const [sentInvites, setSentInvites] = useState<JourneyInvite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<JourneyInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvites = useCallback(async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("journey_invites")
        .select("*")
        .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const allInvites = data || [];
      const sent = allInvites.filter(i => i.from_user_id === currentUserId);
      const received = allInvites.filter(i => i.to_user_id === currentUserId);

      // Enrich received invites with sender profiles
      const enrichedReceived: JourneyInvite[] = [];
      if (received.length > 0) {
        const senderIds = received.map(i => i.from_user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, city")
          .in("user_id", senderIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        received.forEach(inv => {
          const p = profileMap.get(inv.from_user_id);
          enrichedReceived.push({
            ...inv,
            from_profile: p ? { display_name: p.display_name, avatar_url: p.avatar_url, city: p.city } : undefined,
          });
        });
      }

      setSentInvites(sent);
      setReceivedInvites(received);
    } catch (err) {
      console.error("Error fetching journey invites:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const searchUsers = async (query: string): Promise<SearchedUser[]> => {
    if (!query.trim() || !currentUserId) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, city, is_verified")
      .or(`display_name.ilike.%${query}%,city.ilike.%${query}%`)
      .neq("user_id", currentUserId)
      .limit(10);

    if (error) { console.error(error); return []; }

    // Get presence
    const userIds = data?.map(d => d.user_id) || [];
    if (userIds.length === 0) return [];
    const { data: presence } = await supabase
      .from("user_presence")
      .select("user_id, is_online")
      .in("user_id", userIds);

    const presenceMap = new Map(presence?.map(p => [p.user_id, p.is_online]) || []);

    return (data || []).map(u => ({
      ...u,
      is_online: presenceMap.get(u.user_id) || false,
    }));
  };

  const sendInvite = async (toUserId: string, message?: string) => {
    if (!currentUserId) throw new Error("Not authenticated");
    // Check if invite already exists
    const existing = [...sentInvites, ...receivedInvites].find(
      i => (i.from_user_id === currentUserId && i.to_user_id === toUserId) ||
           (i.to_user_id === currentUserId && i.from_user_id === toUserId)
    );
    if (existing) throw new Error("Invite already exists");

    const { error } = await supabase
      .from("journey_invites")
      .insert({ from_user_id: currentUserId, to_user_id: toUserId, message: message || null });

    if (error) throw error;
    await fetchInvites();
  };

  const respondToInvite = async (inviteId: string, status: "accepted" | "declined") => {
    const { error } = await supabase
      .from("journey_invites")
      .update({ status })
      .eq("id", inviteId);

    if (error) throw error;
    await fetchInvites();
  };

  const getInviteStatusForUser = (userId: string): string => {
    const inv = [...sentInvites, ...receivedInvites].find(
      i => (i.from_user_id === currentUserId && i.to_user_id === userId) ||
           (i.to_user_id === currentUserId && i.from_user_id === userId)
    );
    return inv?.status || "none";
  };

  useEffect(() => {
    if (currentUserId) fetchInvites();
  }, [currentUserId, fetchInvites]);

  const pendingReceived = receivedInvites.filter(i => i.status === "pending");
  const acceptedInvites = [...sentInvites, ...receivedInvites].filter(i => i.status === "accepted");

  return {
    sentInvites,
    receivedInvites,
    pendingReceived,
    acceptedInvites,
    isLoading,
    searchUsers,
    sendInvite,
    respondToInvite,
    getInviteStatusForUser,
    refetch: fetchInvites,
  };
};
