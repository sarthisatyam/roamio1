import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePresence = (userId: string | null) => {
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const isSettingOffline = useRef(false);

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

  const setOffline = useCallback(async () => {
    if (isSettingOffline.current) return;
    isSettingOffline.current = true;
    await updatePresence(false);
    isSettingOffline.current = false;
  }, [updatePresence]);

  // Listen for auth state changes to set offline on logout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && userId) {
        // User logged out - set them offline immediately
        updatePresence(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [userId, updatePresence]);

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

    // Handle before unload - set offline synchronously before page closes
    const handleBeforeUnload = () => {
      // Use sync XHR as a fallback since sendBeacon doesn't support auth headers
      // The RLS policy requires authentication, so we need to use a different approach
      // We'll rely on the heartbeat timeout instead
      updatePresence(false);
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
