import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock hotel data for fallback when API fails
function getMockHotels(location: string) {
  const locationCapitalized = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
  return [
    {
      hotelId: 1,
      hotelName: `The Grand ${locationCapitalized}`,
      location: { name: locationCapitalized, country: "India" },
      priceFrom: 4500,
      stars: 5,
    },
    {
      hotelId: 2,
      hotelName: `${locationCapitalized} Palace Hotel`,
      location: { name: locationCapitalized, country: "India" },
      priceFrom: 3200,
      stars: 4,
    },
    {
      hotelId: 3,
      hotelName: `Hotel ${locationCapitalized} Inn`,
      location: { name: locationCapitalized, country: "India" },
      priceFrom: 1800,
      stars: 3,
    },
    {
      hotelId: 4,
      hotelName: `${locationCapitalized} Comfort Stay`,
      location: { name: locationCapitalized, country: "India" },
      priceFrom: 1200,
      stars: 3,
    },
    {
      hotelId: 5,
      hotelName: `Budget Inn ${locationCapitalized}`,
      location: { name: locationCapitalized, country: "India" },
      priceFrom: 800,
      stars: 2,
    },
  ];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, currency = "INR", limit = 10, checkIn, checkOut } = await req.json();

    if (!location) {
      return new Response(
        JSON.stringify({ error: "Location is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate default dates if not provided (tomorrow and day after)
    const today = new Date();
    const defaultCheckIn = checkIn || new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultCheckOut = checkOut || new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const token = "d3c81d4b9";
    
    // Use the lookup endpoint to get location ID first
    const lookupUrl = `https://engine.hotellook.com/api/v2/lookup.json?query=${encodeURIComponent(location)}&lang=en&lookFor=both&limit=1&token=${token}`;
    
    console.log("Looking up location:", lookupUrl);
    
    const lookupResponse = await fetch(lookupUrl);
    
    if (!lookupResponse.ok) {
      console.error("Location lookup failed:", lookupResponse.status);
      // Fallback: return mock data for demo purposes
      return new Response(
        JSON.stringify(getMockHotels(location)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const lookupData = await lookupResponse.json();
    console.log("Lookup result:", JSON.stringify(lookupData));
    
    // Get the city IATA code or location ID
    const cityData = lookupData.results?.locations?.[0] || lookupData.results?.hotels?.[0];
    
    if (!cityData) {
      console.log("No location found, returning mock data");
      return new Response(
        JSON.stringify(getMockHotels(location)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const iataCode = cityData.iata || cityData.cityId || cityData.id;
    
    // Now fetch hotels using the cache endpoint with proper location
    const cacheUrl = `https://engine.hotellook.com/api/v2/cache.json?location=${iataCode}&currency=${currency}&checkIn=${defaultCheckIn}&checkOut=${defaultCheckOut}&limit=${limit}&token=${token}`;
    
    console.log("Fetching hotels from:", cacheUrl);

    const response = await fetch(cacheUrl);
    
    if (!response.ok) {
      console.error("Travelpayouts API error:", response.status, response.statusText);
      // Return mock data as fallback
      return new Response(
        JSON.stringify(getMockHotels(location)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Hotels found:", Array.isArray(data) ? data.length : 0);
    
    // If no results, return mock data
    if (!Array.isArray(data) || data.length === 0) {
      return new Response(
        JSON.stringify(getMockHotels(location)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
