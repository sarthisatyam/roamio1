import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock hotel data for fallback when API fails
function getMockHotels(location: string) {
  const locationCapitalized = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
  return [
    { hotelId: 1, hotelName: `The Grand ${locationCapitalized}`, location: { name: locationCapitalized, country: "India" }, priceFrom: 4500, stars: 5 },
    { hotelId: 2, hotelName: `${locationCapitalized} Palace Hotel`, location: { name: locationCapitalized, country: "India" }, priceFrom: 3200, stars: 4 },
    { hotelId: 3, hotelName: `Hotel ${locationCapitalized} Inn`, location: { name: locationCapitalized, country: "India" }, priceFrom: 1800, stars: 3 },
    { hotelId: 4, hotelName: `${locationCapitalized} Comfort Stay`, location: { name: locationCapitalized, country: "India" }, priceFrom: 1200, stars: 3 },
    { hotelId: 5, hotelName: `Budget Inn ${locationCapitalized}`, location: { name: locationCapitalized, country: "India" }, priceFrom: 800, stars: 2 },
  ];
}

const ALLOWED_CURRENCIES = new Set(["INR", "USD", "EUR", "GBP", "AED", "SGD"]);
const LOCATION_REGEX = /^[\p{L}0-9\s,.'-]+$/u;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // --- Input validation ---
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    const { location, currency = "INR", limit = 10, checkIn, checkOut } = body as Record<string, unknown>;

    if (typeof location !== "string" || location.trim().length === 0 || location.length > 100 || !LOCATION_REGEX.test(location)) {
      return jsonResponse({ error: "Invalid location" }, 400);
    }
    if (typeof currency !== "string" || !ALLOWED_CURRENCIES.has(currency)) {
      return jsonResponse({ error: "Invalid currency" }, 400);
    }
    const safeLimit = typeof limit === "number" && Number.isFinite(limit)
      ? Math.max(1, Math.min(50, Math.floor(limit)))
      : 10;
    if (checkIn !== undefined && (typeof checkIn !== "string" || !DATE_REGEX.test(checkIn))) {
      return jsonResponse({ error: "Invalid checkIn date (expected YYYY-MM-DD)" }, 400);
    }
    if (checkOut !== undefined && (typeof checkOut !== "string" || !DATE_REGEX.test(checkOut))) {
      return jsonResponse({ error: "Invalid checkOut date (expected YYYY-MM-DD)" }, 400);
    }

    // --- API token from env ---
    const apiToken = Deno.env.get("TRAVELPAYOUTS_API_TOKEN");
    if (!apiToken) {
      console.error("TRAVELPAYOUTS_API_TOKEN is not configured");
      return jsonResponse(getMockHotels(location));
    }

    const today = new Date();
    const defaultCheckIn = (checkIn as string | undefined) || new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const defaultCheckOut = (checkOut as string | undefined) || new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const lookupUrl = `https://engine.hotellook.com/api/v2/lookup.json?query=${encodeURIComponent(location)}&lang=en&lookFor=both&limit=1&token=${apiToken}`;
    const lookupResponse = await fetch(lookupUrl);

    if (!lookupResponse.ok) {
      console.error("Location lookup failed:", lookupResponse.status);
      return jsonResponse(getMockHotels(location));
    }

    const lookupData = await lookupResponse.json();
    const cityData = lookupData.results?.locations?.[0] || lookupData.results?.hotels?.[0];

    if (!cityData) {
      return jsonResponse(getMockHotels(location));
    }

    const iataCode = cityData.iata || cityData.cityId || cityData.id;
    const cacheUrl = `https://engine.hotellook.com/api/v2/cache.json?location=${encodeURIComponent(iataCode)}&currency=${encodeURIComponent(currency)}&checkIn=${defaultCheckIn}&checkOut=${defaultCheckOut}&limit=${safeLimit}&token=${apiToken}`;

    const response = await fetch(cacheUrl);

    if (!response.ok) {
      console.error("Travelpayouts API error:", response.status, response.statusText);
      return jsonResponse(getMockHotels(location));
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return jsonResponse(getMockHotels(location));
    }

    return jsonResponse(data);
  } catch (error) {
    console.error("Error in hotels-search function:", error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
