import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, pageContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating search results for query: "${query}" on page: ${pageContext}`);

    const systemPrompt = `You are a travel assistant for solo women travelers in India. Based on the user's search query, generate realistic travel options.

IMPORTANT: Always generate results that match the search query. If user searches for "Paris", generate Paris-related content. If they search for "beach", generate beach destinations.

Generate the following in JSON format:
- For destinations: Include name, emoji icon, rating (4.0-5.0), price per day in INR, safety score (85-99), relevant tags, 2-day itinerary, and popular eateries
- For stays: Include name, location, price per night in INR, rating, amenities, category (hostel/hotel/coliving)
- For travel: Include flights/trains with realistic names, times, duration, price in INR, and features

Make the content relevant to Indian solo women travelers with safety-focused recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate travel options for: "${query}"` }
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
                        tags: { type: "array", items: { type: "string" } },
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
                                    type: { type: "string" }
                                  },
                                  required: ["time", "activity", "type"]
                                }
                              }
                            },
                            required: ["day", "title", "activities"]
                          }
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
                              specialty: { type: "string" }
                            },
                            required: ["name", "type", "rating", "priceRange", "specialty"]
                          }
                        }
                      },
                      required: ["id", "name", "image", "rating", "price", "safety", "tags", "itinerary", "eateries"]
                    }
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
                        category: { type: "string", enum: ["hostel", "hotel", "coliving"] }
                      },
                      required: ["id", "name", "location", "price", "rating", "amenities", "verified", "category"]
                    }
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
                        type: { type: "string" }
                      },
                      required: ["id", "name", "departure", "arrival", "duration", "price", "features", "type"]
                    }
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
                        type: { type: "string" }
                      },
                      required: ["id", "name", "departure", "arrival", "duration", "price", "features", "type"]
                    }
                  }
                },
                required: ["destinations", "stays", "flights", "trains"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_travel_options" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
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
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data).substring(0, 500));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const results = JSON.parse(toolCall.function.arguments);
      console.log("Parsed results:", JSON.stringify(results).substring(0, 500));
      
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No valid response from AI");
  } catch (error) {
    console.error("Error in search-generator:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
