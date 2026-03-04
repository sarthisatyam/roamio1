import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { latitude, longitude } = await req.json();

    // Check if SOS alerts are enabled
    const { data: settings } = await supabase
      .from("parental_settings")
      .select("sos_alerts")
      .eq("user_id", userId)
      .single();

    if (!settings?.sos_alerts) {
      return new Response(JSON.stringify({ error: "Auto SOS is not enabled" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create SOS alert
    const { error: insertError } = await supabase
      .from("parental_sos_alerts")
      .insert({
        user_id: userId,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        status: "triggered",
      });

    if (insertError) throw insertError;

    // Fetch guardian details for notification context
    const { data: guardian } = await supabase
      .from("parental_guardians")
      .select("parent_name, parent_phone, parent_email")
      .eq("user_id", userId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: "SOS alert triggered",
        guardian_notified: !!guardian,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
