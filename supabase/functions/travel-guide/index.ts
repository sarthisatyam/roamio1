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
    const { action, text, fromLang, toLang, city } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "translate") {
      systemPrompt = `You are a translation assistant. Translate the given text accurately. Return ONLY a JSON object: {"translated": "<translated text>", "pronunciation": "<romanized pronunciation if non-Latin script>"}. No extra text.`;
      userPrompt = `Translate from ${fromLang} to ${toLang}: "${text}"`;
    } else if (action === "detect_language") {
      systemPrompt = `You are a language detection assistant for India. Given a city name in India, return the primary local language spoken there. Return ONLY a JSON object: {"language": "<language name>", "languageCode": "<ISO code>", "script": "<script name>", "greeting": "<hello in that language>"}. No extra text.`;
      userPrompt = `What is the primary local language spoken in ${city}, India?`;
    } else if (action === "lessons") {
      systemPrompt = `You are a language teacher. Create practical travel-focused language lessons. Return ONLY a JSON array of lesson objects. Each lesson: {"title": "<lesson title>", "phrases": [{"original": "<phrase in English>", "translated": "<phrase in target language>", "pronunciation": "<romanized pronunciation>"}]}. Include exactly 3 lessons with 4 phrases each. Focus on: 1) Greetings & Basics 2) Getting Around 3) Food & Shopping. No extra text.`;
      userPrompt = `Create ${toLang} language lessons for travelers visiting ${city}, India.`;
    } else if (action === "tips") {
      systemPrompt = `You are an expert solo women travel advisor for India. Provide authentic, practical tips based on real traveler experiences from forums and local knowledge. Return ONLY a JSON array of tip objects: [{"tip": "<practical tip>", "category": "general|do|dont"}]. Include exactly 6 tips (2 general, 2 do, 2 dont) specific to the given city. No extra text.`;
      userPrompt = `Give solo women travel tips for ${city}, India.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          { role: "user", content: userPrompt },
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
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from the response, handling markdown code blocks
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Travel guide error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
