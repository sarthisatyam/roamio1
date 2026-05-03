import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MyBooking {
  id: string;
  trip_id: string;
  seats: number;
  amount_paid: number;
  status: string;
  created_at: string;
  contact_phone: string | null;
  trip?: {
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    cover_url: string | null;
    group_id: string | null;
  };
}

export function useMyBookings() {
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBookings([]); setLoading(false); return; }
    const { data } = await supabase
      .from("community_bookings")
      .select("*, trip:community_trips!community_bookings_trip_id_fkey(title,destination,start_date,end_date,cover_url,group_id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setBookings((data as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { bookings, loading, refetch: fetch };
}
