import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, latitude, longitude, query } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const locationContext = latitude && longitude
      ? `User is at coordinates (${latitude}, ${longitude}) near ${location || "unknown city"}.`
      : `User is searching for accommodation in or near ${location || query || "India"}.`;

    const searchQuery = query || `hotels and hostels near ${location}`;

    const prompt = `${locationContext}

Search query: "${searchQuery}"

Return a JSON object with two keys:
1. "landmarks": An array of exactly 3 famous landmarks/tourist attractions in or near this city/destination. Each landmark object should have:
   - name: The landmark name (e.g. "Charminar", "Taj Mahal")

2. "hotels": A JSON array of 5-8 real hotels/hostels that actually exist near this location. For each hotel, provide:
   - name: Real hotel/hostel name
   - type: "hotel", "hostel", "guesthouse", or "resort"
   - stars: Star rating (1-5)
   - pricePerNight: Approximate price in INR (realistic for the area)
   - distance: Approximate distance from user location (e.g. "1.2 km", "3.5 km")
   - address: Real or approximate address
   - mapLink: Google Maps search link (https://www.google.com/maps/search/HOTEL+NAME+CITY)
   - amenities: Array of 3-5 key amenities
   - description: One-line description (under 20 words)
   - landmarkDistances: An object where keys are the landmark names and values are realistic distances in km as numbers.

IMPORTANT: Use real hotel names that exist in the area. Provide realistic prices for the Indian market. Sort by distance from user.`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a hotel search assistant. Return ONLY a valid JSON object with 'landmarks' and 'hotels' keys. No markdown, no explanation, just the JSON object. Use real hotel names and real landmark distances."
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
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let result = { landmarks: [], hotels: [] };
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        result = { landmarks: [], hotels: parsed };
      } else {
        result = parsed;
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch {
          console.error("Second parse attempt failed");
        }
      }
    }

    return new Response(JSON.stringify({ 
      hotels: result.hotels || [], 
      landmarks: result.landmarks || [],
      location: location || query 
    }), {
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
