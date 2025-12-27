import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePresence = (userId: string | null) => {
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("user_presence")
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString()
        }, {
          onConflict: "user_id"
        });

      if (error) {
        console.error("Error updating presence:", error);
      }
    } catch (err) {
      console.error("Failed to update presence:", err);
    }
  }, [userId]);

  const setOnline = useCallback(() => {
    updatePresence(true);
  }, [updatePresence]);

  const setOffline = useCallback(() => {
    updatePresence(false);
  }, [updatePresence]);

  useEffect(() => {
    if (!userId) return;

    // Set online when component mounts
    setOnline();

    // Heartbeat to keep presence alive
    heartbeatInterval.current = setInterval(() => {
      setOnline();
    }, 30000); // Update every 30 seconds

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setOnline();
      } else {
        // Don't set offline on visibility change, just update last_seen
        updatePresence(true);
      }
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline update
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${userId}`;
      const body = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
      
      navigator.sendBeacon && navigator.sendBeacon(url, body);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clean up
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Set offline when unmounting
      setOffline();
    };
  }, [userId, setOnline, setOffline, updatePresence]);

  return { setOnline, setOffline };
};
