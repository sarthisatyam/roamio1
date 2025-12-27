import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Companion {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  interests: string[];
  gender: string | null;
  age: number | null;
  city: string | null;
  location_lat: number | null;
  location_lng: number | null;
  is_verified: boolean;
  is_online: boolean;
  last_seen: string | null;
  distance?: number;
}

export const useCompanions = (currentUserId: string | null, userLocation?: { lat: number; lng: number }) => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchCompanions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch profiles with presence data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          display_name,
          avatar_url,
          bio,
          interests,
          gender,
          age,
          city,
          location_lat,
          location_lng,
          is_verified
        `)
        .neq("user_id", currentUserId || "");

      if (profilesError) throw profilesError;

      // Fetch presence data
      const { data: presenceData, error: presenceError } = await supabase
        .from("user_presence")
        .select("user_id, is_online, last_seen");

      if (presenceError) throw presenceError;

      // Create a map of presence data
      const presenceMap = new Map(
        presenceData?.map(p => [p.user_id, { is_online: p.is_online, last_seen: p.last_seen }]) || []
      );

      // Combine profiles with presence data
      const companionsWithPresence: Companion[] = (profiles || []).map(profile => {
        const presence = presenceMap.get(profile.user_id);
        let distance: number | undefined;

        if (userLocation && profile.location_lat && profile.location_lng) {
          distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            profile.location_lat,
            profile.location_lng
          );
        }

        return {
          ...profile,
          interests: profile.interests || [],
          is_verified: profile.is_verified || false,
          is_online: presence?.is_online || false,
          last_seen: presence?.last_seen || null,
          distance
        };
      });

      setCompanions(companionsWithPresence);
    } catch (err) {
      console.error("Error fetching companions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch companions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchCompanions();
    }
  }, [currentUserId, userLocation?.lat, userLocation?.lng]);

  // Subscribe to realtime presence updates
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("presence-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence"
        },
        (payload) => {
          const { new: newPresence, old: oldPresence, eventType } = payload;
          
          setCompanions(prev => prev.map(companion => {
            if (companion.user_id === (newPresence as any)?.user_id) {
              return {
                ...companion,
                is_online: (newPresence as any)?.is_online || false,
                last_seen: (newPresence as any)?.last_seen || null
              };
            }
            return companion;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return { companions, isLoading, error, refetch: fetchCompanions };
};
