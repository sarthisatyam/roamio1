import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HostProfile {
  id: string;
  user_id: string;
  legal_name: string;
  business_name: string | null;
  gstin: string | null;
  city: string | null;
  bio: string | null;
  experience_years: number | null;
  social_links: any;
  status: string;
  rating: number | null;
  total_trips: number | null;
  commission_pct: number;
}

export function useHostProfile() {
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile((data as any) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const apply = useCallback(async (input: {
    legal_name: string;
    business_name?: string;
    gstin?: string;
    city?: string;
    bio?: string;
    experience_years?: number;
    website?: string;
    instagram?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("host_profiles")
      .insert({
        user_id: user.id,
        legal_name: input.legal_name,
        business_name: input.business_name || null,
        gstin: input.gstin || null,
        city: input.city || null,
        bio: input.bio || null,
        experience_years: input.experience_years ?? 0,
        social_links: { website: input.website || "", instagram: input.instagram || "" },
      })
      .select()
      .single();
    if (error) throw error;
    setProfile(data as any);
    return data;
  }, []);

  return { profile, loading, apply, refetch: fetchProfile };
}
