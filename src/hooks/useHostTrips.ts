import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CommunityTrip } from "./useCommunityTrips";

export interface HostTripInput {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  price_inr: number;
  seats_total: number;
  group_type: string;
  trip_type: string;
  meeting_point?: string;
  cancellation_policy?: string;
  itinerary?: any[];
  inclusions?: string[];
  exclusions?: string[];
  cover_url?: string;
  status?: "draft" | "published";
}

export function useHostTrips(hostId: string | null) {
  const [trips, setTrips] = useState<(CommunityTrip & { bookingsCount?: number; revenue?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    if (!hostId) { setTrips([]); setLoading(false); return; }
    setLoading(true);
    const { data: tripData } = await supabase
      .from("community_trips")
      .select("*")
      .eq("host_id", hostId)
      .order("created_at", { ascending: false });

    const tripIds = (tripData ?? []).map((t: any) => t.id);
    let bookingMap = new Map<string, { count: number; revenue: number }>();
    if (tripIds.length) {
      const { data: bookings } = await supabase
        .from("community_bookings")
        .select("trip_id, seats, amount_paid, status")
        .in("trip_id", tripIds)
        .eq("status", "paid");
      (bookings ?? []).forEach((b: any) => {
        const cur = bookingMap.get(b.trip_id) ?? { count: 0, revenue: 0 };
        cur.count += b.seats;
        cur.revenue += b.amount_paid;
        bookingMap.set(b.trip_id, cur);
      });
    }
    setTrips((tripData ?? []).map((t: any) => ({
      ...t,
      bookingsCount: bookingMap.get(t.id)?.count ?? 0,
      revenue: bookingMap.get(t.id)?.revenue ?? 0,
    })));
    setLoading(false);
  }, [hostId]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const createTrip = useCallback(async (input: HostTripInput) => {
    if (!hostId) throw new Error("No host profile");
    const { data, error } = await supabase
      .from("community_trips")
      .insert({
        host_id: hostId,
        ...input,
        seats_left: input.seats_total,
        itinerary: input.itinerary ?? [],
        inclusions: input.inclusions ?? [],
        exclusions: input.exclusions ?? [],
        status: input.status ?? "published",
      })
      .select()
      .single();
    if (error) throw error;
    await fetchTrips();
    return data;
  }, [hostId, fetchTrips]);

  const updateTripStatus = useCallback(async (tripId: string, status: string) => {
    const { error } = await supabase
      .from("community_trips")
      .update({ status })
      .eq("id", tripId);
    if (error) throw error;
    await fetchTrips();
  }, [fetchTrips]);

  return { trips, loading, createTrip, updateTripStatus, refetch: fetchTrips };
}
