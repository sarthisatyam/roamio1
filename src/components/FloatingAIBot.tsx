import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, X, Sparkles, Loader2, MapPin, Star, Shield, ExternalLink, Building2, Bed, Home, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmergencyDialog } from "@/components/dialogs/AccountSectionDialogs";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
  hotelResults?: HotelResult[];
}

interface HotelResult {
  name: string;
  type: string;
  stars: number;
  pricePerNight: number;
  distance: string;
  address: string;
  mapLink: string;
  amenities: string[];
  description: string;
  safetyRating: string;
  imageSearchUrl: string;
}

interface FloatingAIBotProps {
  currentCity?: string | null;
  locationEnabled?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`;

const ACCOMMODATION_KEYWORDS = [
  "hotel", "hostel", "stay", "accommodation", "room", "lodge", "resort",
  "guesthouse", "guest house", "nearby hotel", "cheap hotel", "budget stay",
  "where to stay", "find hotel", "book hotel", "place to stay", "oyo",
  "pg", "paying guest", "dharamshala", "inn", "motel"
];

function isAccommodationQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return ACCOMMODATION_KEYWORDS.some(kw => lower.includes(kw));
}

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const HotelCard: React.FC<{ hotel: HotelResult }> = ({ hotel }) => {
  const IconComponent = hotel.type === "hotel" ? Building2 : hotel.type === "hostel" ? Bed : Home;
  
  return (
    <div className="bg-card border border-border rounded-xl p-3 space-y-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <IconComponent className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{hotel.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{hotel.distance}</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-sm text-primary">₹{hotel.pricePerNight?.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-muted-foreground">/night</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: hotel.stars || 0 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", 
          hotel.safetyRating === "High" ? "border-green-500/50 text-green-600" : "border-yellow-500/50 text-yellow-600"
        )}>
          <Shield className="w-2.5 h-2.5 mr-0.5" />
          {hotel.safetyRating} Safety
        </Badge>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
          {hotel.type}
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground">{hotel.description}</p>
      
      <div className="flex flex-wrap gap-1">
        {hotel.amenities?.slice(0, 4).map((amenity, i) => (
          <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
            {amenity}
          </span>
        ))}
      </div>
      
      <div className="flex items-center gap-2 pt-1">
        <p className="text-[10px] text-muted-foreground flex-1 truncate">
          <MapPin className="w-2.5 h-2.5 inline mr-0.5" />
          {hotel.address}
        </p>
        {hotel.mapLink && (
          <a
            href={hotel.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary flex items-center gap-0.5 hover:underline shrink-0"
          >
            Map <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
};

const FloatingAIBot: React.FC<FloatingAIBotProps> = ({ currentCity, locationEnabled, latitude, longitude }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi! I'm Roamio AI, your travel companion. Ask me anything about travel, or search for nearby hotels & hostels! 🌍🏨",
      time: "now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(2);

  const quickActions = [
    "Find nearby hotels",
    "Budget hostels near me",
    "Safe stays for solo women",
    "Local travel tips",
  ];

  const handleEmergencyClick = () => {
    setEmergencyDialogOpen(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAccommodationSearch = async (query: string) => {
    const assistantId = nextIdRef.current++;
    
    // Add a loading message
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: `🔍 Searching for accommodation near ${currentCity || "your location"}...`,
      time: "now",
    }]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-hotel-search', {
        body: {
          location: currentCity || "India",
          latitude: latitude || null,
          longitude: longitude || null,
          query,
        }
      });

      if (error) throw new Error(error.message);

      const hotels: HotelResult[] = data?.hotels || [];
      const locationName = data?.location || currentCity || "your area";

      if (hotels.length > 0) {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: `🏨 Found ${hotels.length} places to stay near **${locationName}**. Here are the best options sorted by distance:`,
                hotelResults: hotels,
              }
            : m
        ));
      } else {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `Sorry, I couldn't find specific accommodation near ${locationName}. Try searching with a different city name or ask me about popular destinations!` }
            : m
        ));
      }
    } catch (e) {
      console.error("Hotel search error:", e);
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: "Sorry, I had trouble searching for hotels. Please try again in a moment." }
          : m
      ));
    }
  };

  const handleSendMessage = async (text?: string) => {
    const msg = (text || inputMessage).trim();
    if (!msg || isLoading) return;

    const userMsg: ChatMessage = {
      id: nextIdRef.current++,
      role: "user",
      content: msg,
      time: "now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    // Check if this is an accommodation query
    if (isAccommodationQuery(msg)) {
      await handleAccommodationSearch(msg);
      setIsLoading(false);
      return;
    }

    // Regular chat flow
    const history = [...messages.slice(1), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let assistantContent = "";
    const assistantId = nextIdRef.current++;

    const upsert = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === assistantId) {
          return prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          { id: assistantId, role: "assistant" as const, content: assistantContent, time: "now" },
        ];
      });
    };

    try {
      await streamChat({
        messages: history,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to get AI response");
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-20 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="default"
          className={cn(
            "w-14 h-14 rounded-full bg-gradient-primary text-white shadow-strong",
            "hover:scale-110 transition-transform duration-300",
            isOpen && "hidden"
          )}
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
          </div>
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end justify-center p-4">
          <Card className="w-full max-w-md h-[80vh] max-h-[600px] flex flex-col shadow-strong">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-primary text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Roamio AI</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <p className="text-xs text-white/80">
                      {currentCity ? `📍 ${currentCity}` : "Online"}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={cn(
                      "flex",
                      message.role === "assistant" ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] p-3 rounded-2xl text-sm",
                        message.role === "assistant"
                          ? "bg-muted text-foreground"
                          : "bg-gradient-primary text-white"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-3 h-3" />
                          <span className="text-xs font-medium">Roamio AI</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                  
                  {/* Hotel Results Cards */}
                  {message.hotelResults && message.hotelResults.length > 0 && (
                    <div className="mt-3 space-y-2 pl-2">
                      {message.hotelResults.map((hotel, idx) => (
                        <HotelCard key={idx} hotel={hotel} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-2xl text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs text-muted-foreground">Searching...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="destructive"
                  className="cursor-pointer hover:bg-destructive/90 text-xs flex items-center gap-1"
                  onClick={handleEmergencyClick}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Emergency Details
                </Badge>
                {quickActions.map((action) => (
                  <Badge
                    key={action}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 text-xs"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Search hotels or ask anything..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  size="sm"
                  onClick={() => handleSendMessage()}
                  className="bg-gradient-primary text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default FloatingAIBot;
