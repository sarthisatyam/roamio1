import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, latitude, longitude, query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const locationContext = latitude && longitude
      ? `User is at coordinates (${latitude}, ${longitude}) near ${location || "unknown city"}.`
      : `User is searching for accommodation in or near ${location || query || "India"}.`;

    const searchQuery = query || `hotels and hostels near ${location}`;

    const prompt = `${locationContext}

Search query: "${searchQuery}"

Return a JSON array of 5-8 real hotels/hostels that actually exist near this location. For each, provide:
- name: Real hotel/hostel name
- type: "hotel", "hostel", "guesthouse", or "resort"
- stars: Star rating (1-5)
- pricePerNight: Approximate price in INR (realistic for the area)
- distance: Approximate distance from user location (e.g. "1.2 km", "3.5 km")
- address: Real or approximate address
- mapLink: Google Maps search link (https://www.google.com/maps/search/HOTEL+NAME+CITY)
- amenities: Array of 3-5 key amenities
- description: One-line description (under 20 words)
- safetyRating: "High", "Medium" based on area reputation for solo women travelers
- imageSearchUrl: Google image search URL for the hotel

IMPORTANT: Use real hotel names that exist in the area. Provide realistic prices for the Indian market. Sort by distance from user.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a hotel search assistant. Return ONLY a valid JSON array of hotel objects. No markdown, no explanation, just the JSON array. Use real hotel names that exist in the specified location."
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse the JSON from the AI response
    let hotels = [];
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      hotels = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Try to extract JSON array from response
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          hotels = JSON.parse(match[0]);
        } catch {
          console.error("Second parse attempt failed");
        }
      }
    }

    return new Response(JSON.stringify({ hotels, location: location || query }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI hotel search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
