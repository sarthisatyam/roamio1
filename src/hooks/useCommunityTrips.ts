import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityTrip {
  id: string;
  host_id: string;
  title: string;
  destination: string;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string;
  price_inr: number;
  seats_total: number;
  seats_left: number;
  group_type: string;
  trip_type: string;
  languages: string[] | null;
  itinerary: any;
  inclusions: string[] | null;
  exclusions: string[] | null;
  meeting_point: string | null;
  cancellation_policy: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  status: string;
  created_at: string;
  recurrence_type?: "one_time" | "weekly" | "custom" | string;
  recurrence_days?: number[] | null;
  recurrence_dates?: string[] | null;
  duration_nights?: number | null;
  pickup_location?: string | null;
  dropoff_location?: string | null;
  host?: {
    legal_name: string;
    business_name: string | null;
    rating: number | null;
    total_trips: number | null;
    city: string | null;
    bio: string | null;
  };
}

export function useCommunityTrips() {
  const [trips, setTrips] = useState<CommunityTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_trips")
      .select(
        `*, host:host_profiles!community_trips_host_id_fkey(legal_name,business_name,rating,total_trips,city,bio)`
      )
      .eq("status", "published")
      .order("start_date", { ascending: true });
    if (!error && data) setTrips(data as any);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return { trips, loading, refetch: fetchTrips };
}
