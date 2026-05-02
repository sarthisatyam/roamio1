import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 min

type TipCategory = "general" | "do" | "dont";

interface TravelOptions {
  destinations: Array<{
    id: number;
    name: string;
    image: string;
    rating: number;
    price: string;
    safety: number;
    tags: string[];
    recommendedDays: number;
    itinerary: Array<{
      day: number;
      title: string;
      activities: Array<{ time: string; activity: string; type: string }>;
    }>;
    eateries: Array<{
      name: string;
      type: string;
      rating: number;
      priceRange: string;
      specialty: string;
    }>;
    travelGuide: Array<{
      tip: string;
      category: TipCategory;
    }>;
  }>;
  stays: Array<{
    id: number;
    name: string;
    location: string;
    price: string;
    rating: number;
    amenities: string[];
    verified: boolean;
    category: "hostel" | "hotel" | "coliving";
  }>;
  flights: Array<{
    id: number;
    name: string;
    departure: string;
    arrival: string;
    duration: string;
    price: string;
    features: string[];
    type: string;
  }>;
  trains: Array<{
    id: number;
    name: string;
    departure: string;
    arrival: string;
    duration: string;
    price: string;
    features: string[];
    type: string;
  }>;
}

const responseCache = new Map<string, { data: TravelOptions; timestamp: number }>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeQuery = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const parseRetryDelayMs = (errorBody: any): number => {
  const retryInfo = errorBody?.error?.details?.find((detail: any) =>
    String(detail?.["@type"] || "").includes("RetryInfo"),
  );

  const retryDelay = retryInfo?.retryDelay;
  if (typeof retryDelay !== "string") return 1200;

  const match = retryDelay.match(/(\d+(?:\.\d+)?)s/);
  if (!match) return 1200;

  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds)) return 1200;

  return Math.max(300, Math.min(3000, Math.floor(seconds * 1000)));
};

const createDestination = (
  id: number,
  name: string,
  image: string,
  tags: string[],
  price = "₹2,200/day",
): TravelOptions["destinations"][number] => ({
  id,
  name,
  image,
  rating: 4.6,
  price,
  safety: 92,
  tags,
  recommendedDays: 2,
  itinerary: [
    {
      day: 1,
      title: "Explore safely in daylight",
      activities: [
        { time: "08:30", activity: "Breakfast at a women-friendly cafe", type: "food" },
        { time: "12:30", activity: "Guided local sightseeing", type: "sightseeing" },
        { time: "17:30", activity: "Sunset point and local market", type: "explore" },
        { time: "20:30", activity: "Return to stay via verified transport", type: "safety" },
      ],
    },
    {
      day: 2,
      title: "Culture + food + easy commute",
      activities: [
        { time: "09:00", activity: "Visit popular cultural spot", type: "culture" },
        { time: "13:00", activity: "Lunch at highly rated restaurant", type: "food" },
        { time: "16:30", activity: "Cafe break and souvenir shopping", type: "leisure" },
        { time: "20:00", activity: "Early wrap-up and check safety route", type: "safety" },
      ],
    },
  ],
  eateries: [
    { name: "Local Spice Kitchen", type: "Restaurant", rating: 4.5, priceRange: "₹₹", specialty: "Regional thali" },
    { name: "Safe Brew Cafe", type: "Cafe", rating: 4.6, priceRange: "₹₹", specialty: "Breakfast combos" },
    { name: "Street Bites Hub", type: "Street Food", rating: 4.4, priceRange: "₹", specialty: "Local snacks" },
  ],
  travelGuide: [
    { tip: "Prefer verified cabs/auto apps after sunset and share live location with a trusted contact.", category: "general" },
    { tip: "DO keep a digital + physical copy of ID and emergency numbers handy.", category: "do" },
    { tip: "DO check latest women traveler reviews before selecting stays or routes.", category: "do" },
    { tip: "DON'T accept food, rides, or tour offers from unverified strangers.", category: "dont" },
    { tip: "DON'T carry all cash in one place; use split payment methods.", category: "dont" },
  ],
});

const buildFallbackResults = (query: string): TravelOptions => {
  const normalized = normalizeQuery(query);

  const nearbyPack = [
    createDestination(1, "Digha", "🏖️", ["Nearby", "Beach", "Weekend"], "₹1,800/day"),
    createDestination(2, "Mandarmani", "🌊", ["Nearby", "Relaxed", "Seafood"], "₹2,100/day"),
    createDestination(3, "Puri", "🏛️", ["Nearby", "Spiritual", "Beach"], "₹2,300/day"),
  ];

  const nationalPack = [
    createDestination(4, "Jaipur", "🏰", ["Must Visit", "Culture", "History"], "₹2,700/day"),
    createDestination(5, "Udaipur", "🛶", ["Must Visit", "Lakes", "Safe"], "₹2,900/day"),
    createDestination(6, "Munnar", "⛰️", ["Must Visit", "Nature", "Tea Estates"], "₹2,400/day"),
  ];

  const useNearby = normalized.includes("nearby") || normalized.includes("close to") || normalized.includes("kharagpur");
  const isTop2 = normalized.includes("top 2");
  const isTop3 = normalized.includes("top 3");

  let destinations = useNearby ? nearbyPack : nationalPack;
  if (isTop2) destinations = destinations.slice(0, 2);
  else if (isTop3) destinations = destinations.slice(0, 3);

  return {
    destinations,
    stays: [
      {
        id: 1,
        name: "Roamio Safe Stay",
        location: destinations[0]?.name || "City Center",
        price: "₹1,600/night",
        rating: 4.5,
        amenities: ["Women-only dorms", "24x7 security", "Wi-Fi"],
        verified: true,
        category: "hostel",
      },
      {
        id: 2,
        name: "Traveler Comfort Inn",
        location: destinations[0]?.name || "Main Market",
        price: "₹2,400/night",
        rating: 4.4,
        amenities: ["Reception support", "CCTV", "Airport transfer"],
        verified: true,
        category: "hotel",
      },
    ],
    flights: [],
    trains: [],
  };
};

const systemPrompt = `You are a travel assistant for solo women travelers in India. Based on the user's search query, generate realistic travel options.

IMPORTANT: Always generate results that match the search query. If user searches for "Paris", generate Paris-related content. If they search for "beach", generate beach destinations.

Generate the following in JSON format:
- For destinations: Include name, emoji icon, rating (4.0-5.0), price per day in INR, safety score (85-99), relevant tags, 2-day itinerary with activities spread across morning (6-12), daytime (12-17), evening (17-21), and night (21+) time slots, popular eateries, AND a travelGuide with exactly 5 tips (mix of general suggestions, DOs, and DON'Ts). The travel guide tips should be practical, authentic advice as if sourced from Google reviews, Reddit travel forums, and local travel blogs. Include safety tips, cultural etiquette, local transport advice, food/water safety, and scam awareness.
- For stays: Include name, location, price per night in INR, rating, amenities, category (hostel/hotel/coliving)
- For travel: Include flights/trains with realistic names, times, duration, price in INR, and features

Make the content relevant to Indian solo women travelers with safety-focused recommendations.`;

const parseToolResult = (data: any): TravelOptions | null => {
  const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
  const args = toolCall?.function?.arguments;
  if (!args) return null;

  const parsed = JSON.parse(args);

  return {
    destinations: Array.isArray(parsed?.destinations) ? parsed.destinations : [],
    stays: Array.isArray(parsed?.stays) ? parsed.stays : [],
    flights: Array.isArray(parsed?.flights) ? parsed.flights : [],
    trains: Array.isArray(parsed?.trains) ? parsed.trains : [],
  };
};

const callGemini = async (model: string, query: string, apiKey: string): Promise<{ ok: true; data: TravelOptions } | { ok: false; status: number; body: any; raw: string }> => {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate travel options for: "${query}"` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_travel_options",
            description: "Generate destinations, stays, and travel options based on user search",
            parameters: {
              type: "object",
              properties: {
                destinations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      image: { type: "string", description: "Emoji representing the destination" },
                      rating: { type: "number" },
                      price: { type: "string", description: "Price per day like ₹1,500/day" },
                      safety: { type: "number", description: "Safety score 85-99" },
                      tags: { type: "array", items: { type: "string" }, description: "At least 3 relevant tags" },
                      recommendedDays: { type: "number", description: "Recommended number of days to visit" },
                      itinerary: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            day: { type: "number" },
                            title: { type: "string" },
                            activities: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  time: { type: "string" },
                                  activity: { type: "string" },
                                  type: { type: "string" },
                                },
                                required: ["time", "activity", "type"],
                              },
                            },
                          },
                          required: ["day", "title", "activities"],
                        },
                      },
                      eateries: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            type: { type: "string" },
                            rating: { type: "number" },
                            priceRange: { type: "string" },
                            specialty: { type: "string" },
                          },
                          required: ["name", "type", "rating", "priceRange", "specialty"],
                        },
                      },
                      travelGuide: {
                        type: "array",
                        description: "Exactly 5 travel tips mixing general suggestions, DOs, and DON'Ts",
                        items: {
                          type: "object",
                          properties: {
                            tip: { type: "string", description: "A practical travel tip or advice" },
                            category: {
                              type: "string",
                              enum: ["general", "do", "dont"],
                              description: "Type of tip",
                            },
                          },
                          required: ["tip", "category"],
                        },
                      },
                    },
                    required: [
                      "id",
                      "name",
                      "image",
                      "rating",
                      "price",
                      "safety",
                      "tags",
                      "recommendedDays",
                      "itinerary",
                      "eateries",
                      "travelGuide",
                    ],
                  },
                },
                stays: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      location: { type: "string" },
                      price: { type: "string", description: "Price per night like ₹1,200/night" },
                      rating: { type: "number" },
                      amenities: { type: "array", items: { type: "string" } },
                      verified: { type: "boolean" },
                      category: { type: "string", enum: ["hostel", "hotel", "coliving"] },
                    },
                    required: ["id", "name", "location", "price", "rating", "amenities", "verified", "category"],
                  },
                },
                flights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      departure: { type: "string" },
                      arrival: { type: "string" },
                      duration: { type: "string" },
                      price: { type: "string" },
                      features: { type: "array", items: { type: "string" } },
                      type: { type: "string" },
                    },
                    required: ["id", "name", "departure", "arrival", "duration", "price", "features", "type"],
                  },
                },
                trains: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      departure: { type: "string" },
                      arrival: { type: "string" },
                      duration: { type: "string" },
                      price: { type: "string" },
                      features: { type: "array", items: { type: "string" } },
                      type: { type: "string" },
                    },
                    required: ["id", "name", "departure", "arrival", "duration", "price", "features", "type"],
                  },
                },
              },
              required: ["destinations", "stays", "flights", "trains"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_travel_options" } },
    }),
  });

  if (!response.ok) {
    const raw = await response.text();
    let body: any = null;
    try {
      body = JSON.parse(raw);
    } catch {
      body = { raw };
    }
    return { ok: false, status: response.status, body, raw };
  }

  const data = await response.json();
  const parsed = parseToolResult(data);
  if (!parsed) {
    return { ok: false, status: 502, body: { error: { message: "No valid tool call response" } }, raw: JSON.stringify(data) };
  }

  return { ok: true, data: parsed };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { query, pageContext } = body as Record<string, unknown>;

    if (typeof query !== "string" || query.trim().length === 0 || query.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid query (1-200 chars required)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ALLOWED_PAGE_CONTEXTS = new Set(["home", "bookings", "journey", "companion"]);
    const safePageContext = typeof pageContext === "string" && ALLOWED_PAGE_CONTEXTS.has(pageContext)
      ? pageContext
      : "home";

    const normalizedQuery = normalizeQuery(query);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const cacheKey = `${pageContext || "home"}:${normalizedQuery}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-AI-Cache": "HIT" },
      });
    }

    console.log(`Generating search results for query: "${query}" on page: ${pageContext}`);

    let sawRateLimit = false;

    for (const model of MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const result = await callGemini(model, query, GEMINI_API_KEY);

        if (result.ok) {
          responseCache.set(cacheKey, { data: result.data, timestamp: Date.now() });
          return new Response(JSON.stringify(result.data), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "X-AI-Model": model,
              "X-AI-Cache": "MISS",
            },
          });
        }

        const message = result.body?.error?.message || result.raw;
        console.error(`Gemini API error [model=${model}, attempt=${attempt}]`, result.status, message);

        if (result.status === 429) {
          sawRateLimit = true;
          const delay = parseRetryDelayMs(result.body);
          await sleep(delay);
          continue;
        }

        throw new Error(`Gemini API error: ${result.status}`);
      }
    }

    if (sawRateLimit) {
      const fallback = buildFallbackResults(query);
      responseCache.set(cacheKey, { data: fallback, timestamp: Date.now() });

      return new Response(
        JSON.stringify({
          ...fallback,
          fallback: true,
          message: "AI is temporarily rate-limited. Showing curated results.",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-AI-Fallback": "rate_limited",
          },
        },
      );
    }

    throw new Error("No valid response from AI");
  } catch (error) {
    console.error("Error in search-generator:", error);

    const fallback = buildFallbackResults("popular destinations");
    return new Response(
      JSON.stringify({
        ...fallback,
        fallback: true,
        message: "Temporary AI issue. Showing curated results.",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-AI-Fallback": "error",
        },
      },
    );
  }
});
