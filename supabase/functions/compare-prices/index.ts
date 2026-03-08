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
    const { hotelName, location, stars, basePrice } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `I need realistic price comparisons for this hotel across 3 Indian booking platforms.

Hotel: "${hotelName}"
Location: ${location}
Stars: ${stars || "unknown"}
Base price hint: ₹${basePrice || "unknown"} per night

Return a JSON array of exactly 3 objects for these platforms: MakeMyTrip, Goibibo, Agoda.
Each object must have:
- platform: string (exact name)
- price: number (price per night in INR, realistic for this hotel class and location)
- url: string (a Google search URL like https://www.google.com/search?q=HOTEL+NAME+PLATFORM+book)

Rules:
- Prices should be realistic and vary slightly between platforms (5-15% variance)
- One platform should be cheapest, one mid, one highest
- Use realistic Indian hotel pricing based on star rating and city tier
- If base price is provided, keep prices within 20% of it`;

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
            content: "You are a hotel price comparison assistant. Return ONLY a valid JSON array. No markdown, no explanation."
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    let platforms = [];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      platforms = JSON.parse(cleaned);
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try { platforms = JSON.parse(match[0]); } catch { /* ignore */ }
      }
    }

    // Normalize and add savings
    if (Array.isArray(platforms) && platforms.length > 0) {
      const minPrice = Math.min(...platforms.map((p: any) => p.price || Infinity));
      platforms = platforms.map((p: any) => ({
        name: p.platform || p.name,
        price: `₹${(p.price || 0).toLocaleString("en-IN")}`,
        priceNum: p.price || 0,
        savings: p.price > minPrice ? `₹${(p.price - minPrice).toLocaleString("en-IN")}` : "₹0",
        url: p.url || `https://www.google.com/search?q=${encodeURIComponent(hotelName + ' ' + (p.platform || p.name) + ' book')}`,
      }));
    }

    return new Response(JSON.stringify({ platforms }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Compare prices error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
