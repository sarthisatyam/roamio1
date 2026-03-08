import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface Conversation {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  is_online: boolean;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export const useDirectMessages = (currentUserId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      setIsLoading(true);
      const { data: msgs, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const convMap = new Map<string, { messages: any[] }>();
      (msgs || []).forEach((m: any) => {
        const partnerId = m.sender_id === currentUserId ? m.receiver_id : m.sender_id;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, { messages: [] });
        }
        convMap.get(partnerId)!.messages.push(m);
      });

      const partnerIds = [...convMap.keys()];
      if (partnerIds.length === 0) {
        setConversations([]);
        return;
      }

      const [profilesRes, presenceRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", partnerIds),
        supabase.from("user_presence").select("user_id, is_online").in("user_id", partnerIds),
      ]);

      const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.user_id, p]));
      const presenceMap = new Map((presenceRes.data || []).map((p: any) => [p.user_id, p.is_online]));

      const convs: Conversation[] = partnerIds.map(pid => {
        const conv = convMap.get(pid)!;
        const profile = profileMap.get(pid);
        const lastMsg = conv.messages[0];
        return {
          user_id: pid,
          display_name: profile?.display_name || "User",
          avatar_url: profile?.avatar_url || null,
          is_online: presenceMap.get(pid) || false,
          last_message: lastMsg.message,
          last_message_at: lastMsg.created_at,
          unread_count: 0,
        };
      });

      convs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      setConversations(convs);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, isLoading, refetch: fetchConversations };
};

export const useChatMessages = (currentUserId: string | null, partnerId: string | null) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !partnerId) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((data || []).map((m: any) => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      setMessages(
        (data || []).map((m: any) => {
          const profile = profileMap.get(m.sender_id);
          return {
            ...m,
            sender_name: profile?.display_name || "User",
            sender_avatar: profile?.avatar_url || undefined,
          };
        })
      );
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, partnerId]);

  const sendMessage = async (text: string) => {
    if (!currentUserId || !partnerId) return;
    const { error } = await supabase
      .from("direct_messages")
      .insert({ sender_id: currentUserId, receiver_id: partnerId, message: text });
    if (error) throw error;
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime
  useEffect(() => {
    if (!currentUserId || !partnerId) return;

    const channel = supabase
      .channel(`dm-${[currentUserId, partnerId].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        async (payload) => {
          const newMsg = payload.new as any;
          const isMine = newMsg.sender_id === currentUserId && newMsg.receiver_id === partnerId;
          const isTheirs = newMsg.sender_id === partnerId && newMsg.receiver_id === currentUserId;
          if (!isMine && !isTheirs) return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", newMsg.sender_id)
            .maybeSingle();

          setMessages(prev => [
            ...prev,
            {
              ...newMsg,
              sender_name: profile?.display_name || "User",
              sender_avatar: profile?.avatar_url || undefined,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, partnerId]);

  return { messages, isLoading, sendMessage };
};
