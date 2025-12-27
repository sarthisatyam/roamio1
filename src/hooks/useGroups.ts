import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  created_by: string;
  created_at: string;
  member_count: number;
  is_member: boolean;
  last_activity: string | null;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export const useGroups = (currentUserId: string | null) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (groupsError) throw groupsError;

      // Fetch member counts for all groups
      const { data: memberCounts, error: memberError } = await supabase
        .from("group_members")
        .select("group_id");

      if (memberError) throw memberError;

      // Count members per group
      const memberCountMap = new Map<string, number>();
      memberCounts?.forEach(m => {
        memberCountMap.set(m.group_id, (memberCountMap.get(m.group_id) || 0) + 1);
      });

      // Fetch user's memberships
      const { data: userMemberships, error: userMemberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", currentUserId || "");

      if (userMemberError) throw userMemberError;

      const userGroupIds = new Set(userMemberships?.map(m => m.group_id) || []);

      // Fetch last message for each group
      const { data: lastMessages, error: lastMsgError } = await supabase
        .from("group_messages")
        .select("group_id, created_at")
        .order("created_at", { ascending: false });

      // Get latest message per group
      const lastActivityMap = new Map<string, string>();
      lastMessages?.forEach(msg => {
        if (!lastActivityMap.has(msg.group_id)) {
          lastActivityMap.set(msg.group_id, msg.created_at);
        }
      });

      const groupsWithData: Group[] = (groupsData || []).map(group => ({
        ...group,
        member_count: memberCountMap.get(group.id) || 0,
        is_member: userGroupIds.has(group.id),
        last_activity: lastActivityMap.get(group.id) || group.created_at
      }));

      setGroups(groupsWithData);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch groups");
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (name: string, description: string, category: string) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("groups")
      .insert({
        name,
        description,
        category,
        icon: "Users",
        created_by: currentUserId
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-join the creator to the group
    await supabase.from("group_members").insert({
      group_id: data.id,
      user_id: currentUserId
    });

    await fetchGroups();
    return data;
  };

  const joinGroup = async (groupId: string) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("group_members")
      .insert({
        group_id: groupId,
        user_id: currentUserId
      });

    if (error) throw error;
    await fetchGroups();
  };

  const leaveGroup = async (groupId: string) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", currentUserId);

    if (error) throw error;
    await fetchGroups();
  };

  useEffect(() => {
    if (currentUserId) {
      fetchGroups();
    }
  }, [currentUserId]);

  return { 
    groups, 
    isLoading, 
    error, 
    createGroup, 
    joinGroup, 
    leaveGroup, 
    refetch: fetchGroups 
  };
};

export const useGroupMessages = (groupId: string | null, currentUserId: string | null) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    if (!groupId) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("group_messages")
        .select(`
          id,
          group_id,
          user_id,
          content,
          created_at
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const userIds = [...new Set(data?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const messagesWithSenders: GroupMessage[] = (data || []).map(msg => {
        const profile = profileMap.get(msg.user_id);
        return {
          ...msg,
          sender_name: profile?.display_name || "Unknown User",
          sender_avatar: profile?.avatar_url
        };
      });

      setMessages(messagesWithSenders);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!groupId || !currentUserId) return;

    const { error } = await supabase
      .from("group_messages")
      .insert({
        group_id: groupId,
        user_id: currentUserId,
        content
      });

    if (error) throw error;
  };

  useEffect(() => {
    if (groupId) {
      fetchMessages();
    }
  }, [groupId]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Fetch sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", newMsg.user_id)
            .single();

          setMessages(prev => [...prev, {
            ...newMsg,
            sender_name: profile?.display_name || "Unknown User",
            sender_avatar: profile?.avatar_url
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return { messages, isLoading, sendMessage, refetch: fetchMessages };
};
