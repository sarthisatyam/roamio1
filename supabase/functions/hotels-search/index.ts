import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, currency = "inr", limit = 10 } = await req.json();

    if (!location) {
      return new Response(
        JSON.stringify({ error: "Location is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = "d3c81d4b9";
    const url = `https://engine.hotellook.com/api/v2/cache.json?location=${encodeURIComponent(location)}&currency=${currency}&limit=${limit}&token=${token}`;

    console.log("Fetching hotels from:", url);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Travelpayouts API error:", response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch from Travelpayouts API" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Hotels found:", Array.isArray(data) ? data.length : 0);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in hotels-search function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
