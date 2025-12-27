import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Connection {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string | null;
  status: string;
  created_at: string;
}

export const useConnections = (currentUserId: string | null) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectedUserIds, setConnectedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnections = async () => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("companion_connections")
        .select("*")
        .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`);

      if (error) throw error;

      setConnections(data || []);

      // Build set of connected user IDs (accepted connections)
      const connectedIds = new Set<string>();
      data?.forEach(conn => {
        if (conn.status === "accepted") {
          if (conn.from_user_id === currentUserId) {
            connectedIds.add(conn.to_user_id);
          } else {
            connectedIds.add(conn.from_user_id);
          }
        }
      });
      setConnectedUserIds(connectedIds);
    } catch (err) {
      console.error("Error fetching connections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendConnectionRequest = async (toUserId: string, message?: string) => {
    if (!currentUserId) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("companion_connections")
      .insert({
        from_user_id: currentUserId,
        to_user_id: toUserId,
        message: message || null,
        status: "pending"
      });

    if (error) throw error;
    await fetchConnections();
  };

  const hasConnectionWith = (userId: string): boolean => {
    return connections.some(
      conn => 
        (conn.from_user_id === currentUserId && conn.to_user_id === userId) ||
        (conn.to_user_id === currentUserId && conn.from_user_id === userId)
    );
  };

  const getConnectionStatus = (userId: string): string => {
    const conn = connections.find(
      c => 
        (c.from_user_id === currentUserId && c.to_user_id === userId) ||
        (c.to_user_id === currentUserId && c.from_user_id === userId)
    );
    return conn?.status || "none";
  };

  useEffect(() => {
    if (currentUserId) {
      fetchConnections();
    }
  }, [currentUserId]);

  return {
    connections,
    connectedUserIds,
    isLoading,
    sendConnectionRequest,
    hasConnectionWith,
    getConnectionStatus,
    refetch: fetchConnections
  };
};
